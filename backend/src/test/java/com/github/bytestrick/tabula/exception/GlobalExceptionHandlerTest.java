package com.github.bytestrick.tabula.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bytestrick.tabula.controller.dto.SignInRequest;
import jakarta.validation.Valid;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.stringContainsInOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class GlobalExceptionHandlerTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;


    @Test
    void validationExceptionsAreHandled() throws Exception {
        mockMvc.perform(post("/test/no-auth/validation-exception")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SignInRequest("invalid email", "invalid password", false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(Matchers.containsString("'email' must be a well-formed email address")));
    }

    @Test
    void unhandledGenericExceptionsAreHandled() throws Exception {
        mockMvc.perform(post("/test/no-auth/generic-exception").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(stringContainsInOrder("test generic exception")));
    }
}

@Nested
@RestController
@RequestMapping("/test/no-auth")
class GlobalExceptionHandlerTestController {
    @PostMapping("/validation-exception")
    public ResponseEntity<?> validationException(@RequestBody @Valid SignInRequest body) {
        return ResponseEntity.ok().body(body);
    }

    @PostMapping("/generic-exception")
    public ResponseEntity<?> genericException() {
        throw new RuntimeException("test generic exception");
    }
}
