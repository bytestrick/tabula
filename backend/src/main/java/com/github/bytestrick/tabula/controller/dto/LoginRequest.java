package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(@NotBlank @Email String email,
                           @NotBlank @Size(max = 512)
                           @Pattern(regexp = PASSWORD_REGEX)
                           String password,
                           boolean rememberMe) {
    static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!#$%&'()*+,\\-./:;<=>?@\\[\\]^_`{|}~\\\\]).{10,}$";
}