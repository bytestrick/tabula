package com.github.bytestrick.tabula.controller.dto.table;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;
import java.util.List;

/**
 * DTO for representing a request to delete rows on the server side.
 * <p>
 * Used to send to the back-end a list of unique identifiers (UUID)
 * of the rows to be removed.
 * </p>
 *
 * @param ids   Rows' ids that will be deleted. The list must not be empty or
 *              null; ids in the list cannot be null.
 */
public record RowsDeleteDTO(
        @NotEmpty @NotNull List<@NotNull UUID> ids
) {}
