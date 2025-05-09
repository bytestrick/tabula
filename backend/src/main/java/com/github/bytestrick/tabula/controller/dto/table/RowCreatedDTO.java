package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) sent by the backend to the frontend
 * after a new row has been created in a table.
 * This immutable record carries the unique identifiers and
 * the zero-based position of the newly inserted row.
 *
 * @param id        the unique identifier (UUID) of the newly created row
 * @param tableId   the unique identifier (UUID) of the table to which the row belongs
 * @param rowIndex  zero-based position of the new row within the table
 */
public record RowCreatedDTO(
        UUID id,
        UUID tableId,
        int rowIndex
) {}
