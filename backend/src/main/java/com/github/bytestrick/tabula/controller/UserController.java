package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.UserInfo;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserController {
    private final UserDao userDao;

    @GetMapping(value = "/user/info")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam String email) {
        return userDao.findByEmail(email).map(user ->
                ResponseEntity.ok(new UserInfo(
                        user.getName(),
                        user.getSurname(),
                        user.getEmail()
                ))
        ).orElse(ResponseEntity.notFound().build());
    }
}
