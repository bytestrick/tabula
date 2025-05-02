package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.DeleteAccountRequest;
import com.github.bytestrick.tabula.controller.dto.InformativeResponse;
import com.github.bytestrick.tabula.controller.dto.UserInfo;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.service.UserService;
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
@RequestMapping(path = "/users", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserController {
    private final UserDao userDao;
    private final UserService userService;

    @GetMapping("/info")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam String email) {
        return userDao.findByEmail(email).map(user ->
                ResponseEntity.ok(new UserInfo(
                        user.getName(),
                        user.getSurname(),
                        user.getEmail()
                ))
        ).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void deleteUser(@NotBlank @Email @RequestParam String email,
                           @Valid @RequestBody DeleteAccountRequest body) {
        userService.deleteAccount(email, body.password());
    }

    @ExceptionHandler({UsernameNotFoundException.class, BadCredentialsException.class})
    public ResponseEntity<?> handle(Exception e) {
        return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
    }
}
