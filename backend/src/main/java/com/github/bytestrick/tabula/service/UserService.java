package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.Country;
import com.github.bytestrick.tabula.repository.UserDao;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final OtpProvider otpProvider;
    private final JwtProvider jwtProvider;
    private final UserDetailsService userDetailsService;

    public void deleteAccount(String email, String password) {
        String encodedPassword = userDao.findPasswordByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        if (passwordEncoder.matches(password, encodedPassword)) {
            userDao.deleteByEmail(email);
            log.info("User '{}' deleted", email);
        } else {
            throw new BadCredentialsException("Incorrect password");
        }
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        String encodedPassword = userDao.findPasswordByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        if (passwordEncoder.matches(oldPassword, encodedPassword)) {
            userDao.updatePasswordByEmail(email, passwordEncoder.encode(newPassword));
            log.info("User '{}' updated their password", email);
        } else {
            throw new BadCredentialsException("Incorrect password");
        }
    }

    public String updateUserDetails(String email, String name, String surname,
                                    Country country, String newEmail, String otp, String jwt) {
        AtomicReference<String> token = new AtomicReference<>("");
        userDao.findByEmail(email).map(user -> {
            // if the email has changed we have to do a bit more work
            if (!user.getEmail().equals(newEmail)) {
                otpProvider.verify(email, otp);
                user.setOtp(null);
                user.setOtpExpiration(null);
                userDao.updateOtp(user);
                // old token contains previous email so it is no longer valid
                try {
                    token.set(jwtProvider.create(Map.of(), newEmail, Duration.ZERO, Duration.ofHours(24)));
                } catch (JOSEException e) {
                    throw new RuntimeException(e);
                }
                jwtProvider.invalidate(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                        newEmail,
                        userDetails.getPassword(),
                        userDetails.getAuthorities()
                ));
            }
            return user;
        }).orElseThrow(() -> new UsernameNotFoundException(email));
        userDao.updateDetailsByEmail(email, name, surname, country, newEmail);
        log.info("Updated account details for '{}'", newEmail);
        return token.get();
    }
}
