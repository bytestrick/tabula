package com.github.bytestrick.tabula.model.table;

import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Represents an entire table.
 * <p>
 *  Properties:
 *  <ul>
 *      <li>{@code id} – unique UUID of the table.</li>
 *      <li>{@code columns} – list of {@link ColumnProxy} objects representing each column.</li>
 *      <li>{@code rows} – list of {@link RowProxy} objects representing each row.</li>
 *  </ul>
 * </p>
 * Lombok generates {@code getters}, {@code setters}, {@code toString}, {@code equals} and {@code hashCode}.
 */
@Data
@AllArgsConstructor
public class Table {

    private UUID id;
    private List<ColumnProxy> columns;
    private List<RowProxy> rows;
}
