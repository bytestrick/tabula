package com.github.bytestrick.tabula.controller.dto;

import com.github.bytestrick.tabula.model.Country;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(@NotNull @Email String email,
                              @NotNull @Size(min = 2, max = 50) String name,
                              @NotNull @Size(min = 2, max = 50) String surname,
                              @NotNull String password,
                              boolean rememberMe,
                              @Valid Country country) {
}
