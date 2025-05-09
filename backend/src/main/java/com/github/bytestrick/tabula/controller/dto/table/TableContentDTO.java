package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) representing a table structure,
 * including its header (columns) and content (rows).
 *
 * @param id       the unique identifier (UUID) of the table; must not be {@code null}
 * @param header   list of {@link ColumnDTO} defining each column of the header's table; must not be {@code null}
 * @param content  list of {@link RowDTO} representing each row of the table; must not be {@code null}
 */
public record TableContentDTO(
        @NotNull UUID id,
        @NotNull List<ColumnDTO> header,
        @NotNull List<RowDTO> content
) {}
