package com.github.bytestrick.tabula.controller.dto;

import com.github.bytestrick.tabula.model.Country;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static com.github.bytestrick.tabula.controller.dto.LoginRequest.PASSWORD_REGEX;

public record RegisterRequest(@NotBlank @Email String email,
                              @NotBlank @Size(min = 2, max = 100) String name,
                              @NotBlank @Size(min = 2, max = 100) String surname,
                              @NotBlank @Size(min = 10, max = 512) @Pattern(regexp = PASSWORD_REGEX) String password,
                              boolean rememberMe,
                              @Valid Country country) {
}
