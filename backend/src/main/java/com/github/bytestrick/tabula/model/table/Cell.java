package com.github.bytestrick.tabula.model.table;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * Represents a single cell within a table.
 * <p>
 *  Properties:
 *  <ul>
 *      <li>{@code id} – unique UUID of the cell.</li>
 *      <li>{@code columnId} – UUID of the column this cell belongs to.</li>
 *      <li>{@code rowId} – UUID of the row this cell belongs to.</li>
 *      <li>{@code value} – String content stored in the cell.</li>
 *  </ul>
 * </p>
 * Lombok generates {@code getters}, {@code setters}, {@code toString}, {@code equals} and {@code hashCode}.
 */
@Data
@AllArgsConstructor
public class Cell {

    UUID id;
    UUID columnId;
    UUID rowId;
    String value;
}
