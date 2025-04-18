package com.github.bytestrick.tabula.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record Country(@NotBlank @Size(min = 2, max = 200) String name,
                      @NotBlank @Size(min = 4, max = 4) String flag,
                      @Size(min = 2, max = 2) String code,
                      @Min(1) @Max(1999) int dialCode) {
}
