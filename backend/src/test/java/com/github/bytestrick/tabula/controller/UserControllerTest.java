package com.github.bytestrick.tabula.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bytestrick.tabula.controller.dto.DeleteAccountRequest;
import com.github.bytestrick.tabula.repository.UserDao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {
    private static final String email = "test@example.com", password = "document3.UNEXAMPLED";
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserDao userDao;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private SecurityFilterChain securityFilterChain;

    @Test
    void deleteUserFailsWhenPasswordIsWrong() throws Exception {
        when(userDao.findPasswordByEmail(email)).thenReturn(Optional.of(passwordEncoder.encode("foobar")));

        mockMvc.perform(delete("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("email", email)
                        .content(objectMapper.writeValueAsString(new DeleteAccountRequest(password))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Incorrect password"));
    }

    @Test
    void deleteUserWorks() throws Exception {
        when(userDao.findPasswordByEmail(email)).thenReturn(Optional.of(passwordEncoder.encode(password)));

        mockMvc.perform(delete("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("email", email)
                        .content(objectMapper.writeValueAsString(new DeleteAccountRequest(password))))
                .andExpect(status().isOk());

        verify(userDao).deleteByEmail(email);
    }
}
