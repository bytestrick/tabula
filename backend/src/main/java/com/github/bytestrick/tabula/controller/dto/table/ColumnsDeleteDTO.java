package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * DTO for representing a request to delete columns on the server side.
 * <p>
 * Used to send to the back-end a list of unique identifiers (UUID)
 * of the columns to be removed.
 * </p>
 *
 * @param ids   Columns' ids that will be deleted. The list must not be empty or
 *              null; ids in the list cannot be null.
 */
public record ColumnsDeleteDTO(
        @NotEmpty @NotNull List<@NotNull UUID> ids
) {}
