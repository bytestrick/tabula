package com.github.bytestrick.tabula.controller.dto.table;

/**
 * Data Transfer Object (DTO) representing a data-type.
 *
 * @param id   The unique identifier of the data type.
 * @param name The human-readable name or label of the data type.
 */
public record DataTypeDTO(
        int id,
        String name
) {}
