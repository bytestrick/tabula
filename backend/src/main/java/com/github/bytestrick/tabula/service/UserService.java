package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.repository.UserDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

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
}
