package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.service.JwtProvider;
import com.github.bytestrick.tabula.service.OtpProvider;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Note: all endpoints under {@code /auth} don't require authentication to be accessed
 */
@Slf4j
@RestController
@RequestMapping(
        value = "/auth",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
)
@RequiredArgsConstructor
public class AuthenticationController {
    private static final ResponseEntity<Object> USER_NOT_FOUND =
            ResponseEntity.badRequest().body(new InformativeResponse("No user found with this email"));
    private final UserDao userDao;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final OtpProvider otpProvider;

    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn(@Valid @RequestBody SignInRequest signInRequest) {
        Optional<User> user = userDao.findByEmail(signInRequest.email());
        if (user.isEmpty()) {
            log.warn("User '{}' tried to sign-in but is not registered", signInRequest.email());
            return USER_NOT_FOUND;
        }
        if (!user.get().isEnabled()) {
            return ResponseEntity.badRequest().body(new InformativeResponse("Not enabled"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signInRequest.email(), signInRequest.password())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            log.warn("Incorrect password for user '{}'", signInRequest.email());
            return ResponseEntity.badRequest().body(new InformativeResponse("Incorrect password"));
        }
        try {
            String jwt = jwtProvider.create(Map.of(), signInRequest.email(), Duration.ZERO, Duration.ofHours(24));
            log.info("User '{}' has signed in", signInRequest.email());
            return ResponseEntity.ok(new SignInResponse(jwt));
        } catch (JOSEException e) {
            return ResponseEntity.internalServerError().body("Error while signing in");
        }
    }

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userDao.findByEmail(signUpRequest.email()).isPresent()) {
            return ResponseEntity.badRequest().body(new InformativeResponse("Email already registered"));
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(signUpRequest.email())
                .encodedPassword(passwordEncoder.encode(signUpRequest.password()))
                .name(signUpRequest.name())
                .surname(signUpRequest.surname())
                .country(signUpRequest.country())
                .roles(List.of(new SimpleGrantedAuthority("USER")))
                .build();

        otpProvider.send(user, OtpProvider.Reason.VERIFY_EMAIL.getReason());
        userDao.save(user);

        log.info("User '{}' has signed up", user.getEmail());
        // TODO: maybe return CREATED
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyOtpRequest body) {
        try {
            return otpProvider.verify(body.email(), body.otp())
                    .map(user -> {
                        user.setEnabled(true);
                        user.setOtp(null);
                        user.setOtpExpiration(null);
                        userDao.updateEmailVerification(user);
                        log.info("{} has verified their email", body.email());
                        return ResponseEntity.ok().build();
                    })
                    .orElse(USER_NOT_FOUND);
        } catch (InvalidOtpException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-reset-password-otp")
    public ResponseEntity<?> verifyResetPassword(@Valid @RequestBody VerifyOtpRequest body) {
        try {
            return otpProvider.verify(body.email(), body.otp())
                    .map(user -> ResponseEntity.ok().build())
                    .orElse(USER_NOT_FOUND);
        } catch (InvalidOtpException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        try {
            return userDao.findByEmail(body.email())
                    .map(user -> {
                        // check the OTP again so that a single request can't hijack the password
                        otpProvider.verify(body.email(), body.otp());

                        user.setOtp(null);
                        user.setOtpExpiration(null);
                        userDao.updatePassword(user.getId(), passwordEncoder.encode(body.newPassword()));
                        log.info("password reset for {}", body.email());
                        return ResponseEntity.ok().build();
                    })
                    .orElse(USER_NOT_FOUND);
        } catch (InvalidOtpException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest body) {
        return userDao.findByEmail(body.email())
                .map(user -> {
                    otpProvider.send(user, body.reason());
                    userDao.updateOtp(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(USER_NOT_FOUND);
    }

    @PostMapping("/sign-out")
    public ResponseEntity<?> signOut(HttpServletRequest request) {
        try {
            jwtProvider.invalidate(JwtProvider.fromRequest(request));
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse("No token found"));
        }
    }
}
