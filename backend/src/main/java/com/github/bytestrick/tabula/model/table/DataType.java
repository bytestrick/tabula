package com.github.bytestrick.tabula.model.table;

/**
 * Model representing a data-type entry in the {@code data_type} table.
 * <p>
 * Immutable record containing the integer identifier and name of the data-type.
 * </p>
 */
public record DataType(
        int id,
        String name
) {}
