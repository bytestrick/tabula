package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.UserInfo;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserDao userDao;


    @GetMapping("/user/info")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam String email) {
        User user = userDao.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UserInfo(
                user.getName(),
                user.getSurname(),
                user.getEmail()
        ));
    }
}
