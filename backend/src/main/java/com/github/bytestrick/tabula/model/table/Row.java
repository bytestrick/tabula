package com.github.bytestrick.tabula.model.table;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Represents a row in a table.
 * <p>
 *  Properties:
 *  <ul>
 *      <li>{@code id} – unique UUID of the row.</li>
 *      <li>{@code myTable} – UUID of the parent table.</li>
 *      <li>{@code rowIndex} – zero-based position index of the row.</li>
 *      <li>{@code cells} – list of {@link Cell} objects in this row.</li>
 *  </ul>
 * </p>
 * Lombok generates {@code getters}, {@code setters}, {@code toString}, {@code equals} and {@code hashCode}.
 */
@Data
@AllArgsConstructor
public class Row {

    private UUID id;
    private UUID myTable;
    private int rowIndex;
    private List<Cell> cells;
}
