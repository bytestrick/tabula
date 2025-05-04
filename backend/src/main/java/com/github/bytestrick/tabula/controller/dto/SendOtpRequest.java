package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendOtpRequest(@NotBlank @Email String email, @NotBlank @Email String receiver, @NotBlank String reason) {
}
