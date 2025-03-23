package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(@NotNull @Email String email,
                           @NotBlank String password,
                           boolean rememberMe) {
}
