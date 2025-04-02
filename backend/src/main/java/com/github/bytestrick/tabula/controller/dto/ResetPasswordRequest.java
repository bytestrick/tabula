package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static com.github.bytestrick.tabula.config.Constants.PASSWORD_REGEXP;

public record ResetPasswordRequest(@NotBlank @Email String email,
                                   @NotBlank @Pattern(regexp = PASSWORD_REGEXP) String newPassword,
                                   @NotBlank @Size(min = 6, max = 6) String otp) {
}
