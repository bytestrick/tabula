package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;


/**
 * Data Transfer Object (DTO) representing a column within a table.
 * This immutable record carries all the attributes needed to display
 * or manage a column in the frontend or service layer.
 *
 * @param id           The unique identifier (UUID) of the column.
 * @param tableId      The unique identifier (UUID) of the table this column belongs to.
 * @param dataType     Numeric code identifying the column’s data type (e.g., 0 = Textual, 1 = Numeric).
 * @param columnName   The name of the column.
 * @param columnIndex  Zero-based position of the column within the table.
 */
public record ColumnDTO(
        UUID id,
        UUID tableId,
        int dataType,
        String columnName,
        int columnIndex
) {}