package com.github.bytestrick.tabula.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TableCard {

    @NotNull
    private final UUID id;

    @NotNull
    @Size(min = 1, max = 50)
    private String title;

    @Size(max = 500)
    private String description;

    @NotNull
    @PastOrPresent
    private LocalDateTime creationDate;

    @PastOrPresent
    private LocalDateTime lastEditDate;
}
