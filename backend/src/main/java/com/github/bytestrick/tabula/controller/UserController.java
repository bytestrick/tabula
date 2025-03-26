package com.github.bytestrick.tabula.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
public class UserController {
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

    private record LoginBody(String username, String password) {
    }
}
