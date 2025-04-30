package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * Note: all endpoints under {@code /auth} do not require authentication to be accessed
 */
@RestController
@RequestMapping(
        value = "/auth",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
)
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn(@Valid @RequestBody SignInRequest signInRequest) {
        try {
            return ResponseEntity.ok().body(new SignInResponse(
                    authenticationService.signIn(signInRequest.email(), signInRequest.password())
            ));
        } catch (UsernameNotFoundException | IllegalStateException | BadCredentialsException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        } catch (JOSEException e) {
            return ResponseEntity.internalServerError().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest r) {
        try {
            authenticationService.signUp(r.email(), r.name(), r.surname(), r.password(), r.country());
            return ResponseEntity.ok().build(); // TODO: maybe return CREATED
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyOtpRequest body) {
        try {
            authenticationService.verifyEmail(body.email(), body.otp());
            return ResponseEntity.ok().build();
        } catch (InvalidOtpException | UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-reset-password-otp")
    public ResponseEntity<?> verifyResetPassword(@Valid @RequestBody VerifyOtpRequest body) {
        try {
            authenticationService.verifyResetPassword(body.email(), body.otp());
            return ResponseEntity.ok().build();
        } catch (InvalidOtpException | UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        try {
            authenticationService.resetPassword(body.email(), body.newPassword(), body.otp());
            return ResponseEntity.ok().build();
        } catch (InvalidOtpException | UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest body) {
        try {
            authenticationService.sendOtp(body.email(), body.reason());
            return ResponseEntity.ok().build();
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
        }
    }

    @PostMapping("/sign-out")
    public ResponseEntity<?> signOut(HttpServletRequest request, HttpSession session) {
        authenticationService.signOut(request, session);
        return ResponseEntity.ok().build();
    }
}
