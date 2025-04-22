package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.UserInfo;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.UserDao;
import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserDao userDao;


    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginBody body, HttpSession session) {
        session.setAttribute("user", "authenticated");
        return ResponseEntity.ok().body("{\"result\": \"ciao\"}");
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Logout successful";
    }

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

    private record LoginBody(String username, String password) {
    }
}
