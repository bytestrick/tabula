package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static com.github.bytestrick.tabula.config.Constants.PASSWORD_REGEXP;

public record UpdatePasswordRequest(
        @NotBlank @Size(min = 10, max = 512) @Pattern(regexp = PASSWORD_REGEXP) String oldPassword,
        @NotBlank @Size(min = 10, max = 512) @Pattern(regexp = PASSWORD_REGEXP) String newPassword) {
}
