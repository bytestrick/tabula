package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.model.Country;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserDao userDao;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final OtpProvider otpProvider;

    public String signIn(String email, String password) {
        Optional<User> user = userDao.findByEmail(email);
        if (user.isEmpty()) {
            log.warn("User '{}' tried to sign-in but is not registered", email);
            throw new UsernameNotFoundException("No user found with this email");
        }
        if (!user.get().isEnabled()) {
            throw new IllegalStateException("Not enabled");
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            log.warn("Incorrect password for user '{}'", email);
            throw new BadCredentialsException("Incorrect password");
        }
        try {
            String jwt = jwtProvider.create(Map.of(), email, Duration.ZERO, Duration.ofHours(24));
            log.info("User '{}' has signed in", email);
            return jwt;
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public void signUp(String email, String name, String surname, String password, Country country)
            throws IllegalStateException {
        if (userDao.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Email already registered");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .encodedPassword(passwordEncoder.encode(password))
                .name(name)
                .surname(surname)
                .country(country)
                .roles(List.of(new SimpleGrantedAuthority("USER")))
                .build();

        otpProvider.send(user, user.getEmail(), OtpProvider.Reason.VERIFY_EMAIL.getReason());
        userDao.save(user);
        log.info("User '{}' has signed up", user.getEmail());
    }

    public void verifyEmail(String email, String otp) throws InvalidOtpException, UsernameNotFoundException {
        otpProvider.verify(email, otp)
                .map(user -> {
                    user.setEnabled(true);
                    user.setOtp(null);
                    user.setOtpExpiration(null);
                    userDao.updateEmailVerification(user);
                    log.info("{} has verified their email", email);
                    return user;
                })
                .orElseThrow(() -> new UsernameNotFoundException("No user found with this email"));
    }

    public void verifyResetPassword(String email, String otp) throws InvalidOtpException, UsernameNotFoundException {
        otpProvider.verify(email, otp)
                .orElseThrow(() -> new UsernameNotFoundException("No user found with this email"));
    }

    public void resetPassword(String email, String newPassword, String otp)
            throws InvalidOtpException, UsernameNotFoundException {
        userDao.findByEmail(email)
                .map(user -> {
                    // check the OTP again so that a single request can't hijack the password
                    otpProvider.verify(email, otp);

                    user.setOtp(null);
                    user.setOtpExpiration(null);
                    userDao.resetPasswordWithOtp(user.getId(), passwordEncoder.encode(newPassword));
                    log.info("password reset for {}", email);
                    return user;
                })
                .orElseThrow(() -> new UsernameNotFoundException("No user found with this email"));
    }

    public void sendOtp(String email, String receiver, String reason) throws UsernameNotFoundException {
        userDao.findByEmail(email)
                .map(user -> {
                    otpProvider.send(user, receiver, reason);
                    userDao.updateOtp(user);
                    return user;
                })
                .orElseThrow(() -> new UsernameNotFoundException("No user found with this email"));
    }

    public void signOut(HttpServletRequest request, HttpSession session) {
        jwtProvider.invalidate(JwtProvider.fromRequest(request));
        session.invalidate();
        log.info("User '{}' has signed out", SecurityContextHolder.getContext().getAuthentication().getName());
        SecurityContextHolder.clearContext();
    }
}
