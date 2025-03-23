package com.github.bytestrick.tabula.model;

import jakarta.validation.constraints.Size;

public record Country(@Size(min = 2, max = 200) String name,
                      @Size(min = 4, max = 4) String flag,
                      @Size(min = 2, max = 2) String code,
                      int dialCode) {
}
