package com.github.bytestrick.tabula.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class TableCard {

    @NotNull
    private final UUID id;

    @NotNull
    @Size(min = 1, max = 50)
    private String title;

    @Size(max = 500)
    private String description;
}
