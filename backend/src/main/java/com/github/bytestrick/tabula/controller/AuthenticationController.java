package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public SignInResponse signIn(@Valid @RequestBody SignInRequest signInRequest) {
        return new SignInResponse(authenticationService.signIn(signInRequest.email(), signInRequest.password()));
    }

    @PostMapping("/sign-up")
    @ResponseStatus(HttpStatus.CREATED)
    public void signUp(@Valid @RequestBody SignUpRequest r) {
        authenticationService.signUp(r.email(), r.name(), r.surname(), r.password(), r.country());
    }

    @PostMapping("/verify-email-otp")
    public void verifyEmail(@Valid @RequestBody VerifyOtpRequest body) {
        authenticationService.verifyEmail(body.email(), body.otp());
    }

    @PostMapping("/verify-reset-password-otp")
    public void verifyResetPasswordOtp(@Valid @RequestBody VerifyOtpRequest body) {
        authenticationService.verifyResetPassword(body.email(), body.otp());
    }

    @PatchMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        authenticationService.resetPassword(body.email(), body.newPassword(), body.otp());
    }

    @PostMapping("/send-otp")
    public void sendOtp(@Valid @RequestBody SendOtpRequest body) {
        authenticationService.sendOtp(body.email(), body.reason());
    }

    @PostMapping("/sign-out")
    public void signOut(HttpServletRequest request, HttpSession session) {
        authenticationService.signOut(request, session);
    }

    @ExceptionHandler({InvalidOtpException.class, UsernameNotFoundException.class,
            IllegalStateException.class, BadCredentialsException.class})
    public ResponseEntity<?> handle(Exception e) {
        return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
    }
}
