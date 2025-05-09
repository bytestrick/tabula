package com.github.bytestrick.tabula.model.table;

import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Represents a database table with its metadata, columns, and rows.
 * <p>
 * Properties:
 * <ul>
 *     <li>{@code id} – the unique {@link UUID} identifying this table;</li>
 *     <li>{@code title} – the human-readable name of the table;</li>
 *     <li>{@code description} – an optional description of the table;</li>
 *     <li>{@code creationDate} – the timestamp when the table was first created;</li>
 *     <li>{@code lastEditDate} – the timestamp of the most recent modification;</li>
 *     <li>{@code userId} – the {@link UUID} of the user who owns or created the table;</li>
 *     <li>{@code columns} – a list of {@link ColumnProxy} instances representing each column in the table;</li>
 *     <li>{@code rows} – a list of {@link RowProxy} instances representing each row in the table.</li>
 * </ul>
 * </p>
 * <p>
 * Lombok annotations generate:
 * <ul>
 *     <li>Getters and setters for all non-final fields;</li>
 *     <li>{@code equals}, {@code hashCode}, and {@code toString} methods;</li>
 *     <li>A constructor accepting all fields because of {@link lombok.AllArgsConstructor}.</li>
 * </ul>
 * </p>
 */
@Data
@Builder
@AllArgsConstructor
public class Table {

    @NotNull
    private final UUID id;
    private String title;
    private String description;
    private LocalDateTime creationDate;
    private LocalDateTime lastEditDate;
    private UUID userId;

    private List<ColumnProxy> columns;
    private List<RowProxy> rows;
}
