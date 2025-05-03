package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) sent by the backend to the frontend
 * after a new column has been created in a table.
 * This immutable record carries all details needed by the UI
 * to update its view with the newly created column.
 *
 * @param id                The unique identifier (UUID) of the newly created column.
 * @param tableId           The unique identifier (UUID) of the table to which the column belongs.
 * @param dataTypeId        Numeric code identifying the column’s data type.
 * @param columnIndex       Zero-based position of the column within the table.
 */
public record ColumnCreatedDTO(
        UUID id,
        UUID tableId,
        int dataTypeId,
        int columnIndex
) {}
