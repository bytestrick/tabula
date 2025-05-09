package com.github.bytestrick.tabula.model.table;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Represents a column in a table.
 * <p>
 *  Properties:
 *  <ul>
 *      <li>{@code id} – unique UUID of the column.</li>
 *      <li>{@code myTable} – UUID of the parent table.</li>
 *      <li>{@code dataTypeId} – integer identifier for the column’s data type.</li>
 *      <li>{@code name} – human-readable name of the column.</li>
 *      <li>{@code columnIndex} – zero-based position index of the column.</li>
 *      <li>{@code cells} – list of {@link Cell} objects in this column.</li>
 *  </ul>
 * </p>
 * Lombok generates {@code getters}, {@code setters}, {@code toString}, {@code equals} and {@code hashCode}.
 */
@Data
@AllArgsConstructor
public class Column {

    private UUID id;
    private UUID myTable;
    private int dataTypeId;
    private String name;
    private int columnIndex;
    private List<Cell> cells;
}
