package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.exception.GlobalExceptionHandler;
import com.github.bytestrick.tabula.repository.UserDao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(GlobalExceptionHandler.class)
@WebMvcTest(AuthenticationController.class)
public class GlobalExceptionHandlerTest {
    private static final UUID id = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserDao userDao;

    @Test
    void internalServerError() throws Exception {
        String msg = "Internal server error TEST";

        when(userDao.findById(id)).thenThrow(new RuntimeException(msg));

        mockMvc.perform(get("/users/{id}", id))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.detail").value(msg));
    }
}
