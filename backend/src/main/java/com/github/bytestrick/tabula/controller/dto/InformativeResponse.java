package com.github.bytestrick.tabula.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record InformativeResponse(@NotBlank String message) {
}
