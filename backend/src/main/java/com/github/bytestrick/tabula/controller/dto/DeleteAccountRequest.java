package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import static com.github.bytestrick.tabula.config.Constants.PASSWORD_REGEXP;

public record DeleteAccountRequest(@NotBlank @Pattern(regexp = PASSWORD_REGEXP) String password) {
}
