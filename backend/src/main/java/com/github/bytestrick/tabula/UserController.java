package com.github.bytestrick.tabula;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
public class UserController {
    @GetMapping("/login")
    public String login(HttpSession session) {
        session.setAttribute("user", "authenticated");
        return "Login successful";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Logout successful";
    }
}
