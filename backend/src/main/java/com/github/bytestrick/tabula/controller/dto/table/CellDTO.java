package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) representing a single cell within a row.
 *
 * @param tableId     The UUID of the table containing this cell.
 * @param rowIndex    The UUID identifying the row index or row key.
 * @param columnIndex The UUID identifying the column index or column key.
 * @param value       The cell’s value as a String; may be {@code null} or empty if the cell is blank.
 */
public record CellDTO(
        UUID tableId,
        UUID rowIndex,
        UUID columnIndex,
        String value
) {}
