package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * This service is used by Spring Security to authenticate users.
 * Retrieves a user through the {@link UserDao} and returns a {@link UserDetails} object.
 */
@Service
@RequiredArgsConstructor
public class DaoUserDetailsService implements UserDetailsService {
    private final UserDao userDao;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userDao.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getEncodedPassword(),
                user.getRoles());
    }
}