package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.AuthenticationResponse;
import com.github.bytestrick.tabula.controller.dto.LoginRequest;
import com.github.bytestrick.tabula.controller.dto.RegisterRequest;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.service.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    private final UserDao userDao;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationController(UserDao userDao,
                                    JwtProvider jwtProvider,
                                    AuthenticationManager authenticationManager,
                                    PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.jwtProvider = jwtProvider;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            if (userDao.findByEmail(loginRequest.email()).isEmpty()) {
                log.info("User '{}' tried to log in but is not registered", loginRequest.email());
                return ResponseEntity.notFound().build();
            }
            log.info("Bad credentials for user '{}'", loginRequest.email());
            return ResponseEntity.badRequest().body(e);
        }
        log.info("User '{}' has logged in", loginRequest.email());
        return ResponseEntity.ok(new AuthenticationResponse(jwtProvider.generateToken(loginRequest.email())));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userDao.findByEmail(registerRequest.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use.");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(registerRequest.email())
                .encodedPassword(passwordEncoder.encode(registerRequest.password()))
                .name(registerRequest.name())
                .surname(registerRequest.surname())
                .country(registerRequest.country())
                .roles(List.of(new SimpleGrantedAuthority("USER")))
                .build();
        userDao.save(user);

        log.info("User '{}' just signed up", user.getEmail());
        return ResponseEntity.created(URI.create("/users/" + user.getId())).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = JwtProvider.fromRequest(request);
        if (token != null) {
            jwtProvider.invalidateToken(token);
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok().body("Logged out successfully.");
        }
        return ResponseEntity.badRequest().body("No token found.");
    }
}
