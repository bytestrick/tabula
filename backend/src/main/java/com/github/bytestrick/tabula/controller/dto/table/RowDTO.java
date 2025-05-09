package com.github.bytestrick.tabula.controller.dto.table;

import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) representing a row within a table.
 *
 * @param id       The unique identifier (UUID) of this row.
 * @param tableId  The UUID of the table to which this row belongs.
 * @param cells    List of {@link CellDTO} containing the values for each column.
 */
public record RowDTO(
        UUID id,
        UUID tableId,
        List<CellDTO> cells
) {}
