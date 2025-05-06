package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;

/**
 * Data Transfer Object returned after a column has been patched.
 * Contains the column’s identifier and its updated properties.
 *
 * @param id          UUID of the column that was updated.
 * @param columnIndex The zero-based position of the column after the update.
 * @param columnName  The updated name of the column. If it is null it has not been changed.
 * @param dataTypeId  The updated numeric code identifying the column’s data type. If it
 *                    is null it has not been changed.
 */
public record ColumnPatchedDTO(
        UUID id,
        int columnIndex,
        String columnName,
        Integer dataTypeId
) {
}