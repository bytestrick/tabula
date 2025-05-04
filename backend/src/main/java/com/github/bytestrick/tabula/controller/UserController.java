package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.exception.InvalidOtpException;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.service.JwtProvider;
import com.github.bytestrick.tabula.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserController {
    private final UserDao userDao;
    private final UserService userService;

    @GetMapping
    public UserDetails getUserDetails(@RequestParam String email) {
        return userDao.findByEmail(email).map(user -> new UserDetails(
                        user.getName(), user.getSurname(), user.getEmail(), user.getCountry()))
                .orElseThrow(() -> new UsernameNotFoundException(email));
    }

    @PatchMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public SignInResponse updateUserDetails(@RequestParam String email,
                                            @RequestBody @Valid UpdateUserDetailsRequest body,
                                            HttpServletRequest request) {
        return new SignInResponse(userService.updateUserDetails(
                email,
                body.userDetails().name(),
                body.userDetails().surname(),
                body.userDetails().country(),
                body.userDetails().email(),
                body.otp(),
                JwtProvider.fromRequest(request)
        ));
    }

    @DeleteMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void deleteUser(@NotBlank @Email @RequestParam String email,
                           @Valid @RequestBody DeleteAccountRequest body) {
        userService.deleteAccount(email, body.password());
    }

    @PatchMapping(path = "/password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void changePassword(@NotBlank @Email @RequestParam String email,
                               @Valid @RequestBody UpdatePasswordRequest body) {
        userService.changePassword(email, body.oldPassword(), body.newPassword());
    }

    @ExceptionHandler({UsernameNotFoundException.class, BadCredentialsException.class, InvalidOtpException.class})
    public ResponseEntity<?> handle(Exception e) {
        return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
    }
}
