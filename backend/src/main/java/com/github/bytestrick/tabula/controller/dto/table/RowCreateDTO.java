package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.PositiveOrZero;

/**
 * Data Transfer Object (DTO) sent by the frontend to the backend
 * to request creation of a new row in a table.
 *
 * @param rowIndex  optional zero-based index at which to insert the new row;
 *                  if {@code null}, the row is appended at the end
 */
public record RowCreateDTO(
        @PositiveOrZero Integer rowIndex
) {}
