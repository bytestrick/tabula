package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) sent by the frontend to update cell values.
 * Depending on which identifiers are provided, this DTO can:
 * <ul>
 *   <li>Update a single cell when both {@code rowId} and {@code columnId} are non-null.</li>
 *   <li>Update an entire row when only {@code rowId} is non-null (all columns in that row).</li>
 *   <li>Update an entire column when only {@code columnId} is non-null (all rows in that column).</li>
 * </ul>
 * Only the {@code newValue} field carries the updated content; all other cell attributes remain unchanged.
 *
 * @param rowId
 *   UUID of the row to update. If null, no row-based update is performed.
 * @param columnId
 *   UUID of the column to update. If null, no column-based update is performed.
 * @param dataTypeId
 *   Numeric code identifying the cell’s data type. Used by the backend
 *   to figure out whether that data type can be inserted as the contents of a cell.
 * @param newValue
 *   The new content for the targeted cell(s). An empty string represents a blank cell. Cannot be null.
 */
public record CellPatchDTO(
        UUID rowId,
        UUID columnId,
        int dataTypeId,
        @NotNull String newValue
) {}
