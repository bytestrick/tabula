package com.github.bytestrick.tabula.controller.dto.table;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) sent by the frontend to update the value of a single cell.
 * Only the {@code value} field is used; all other cell properties remain unchanged.
 *
 * @param newValue
 *   The new content for the cell.
 */
// dto inteso per aggiornare solamente le celle chee rappresentano il contenuto della tabella. Per aggiornare
// i nomi delle colonne dell'header vedi tableAPI.changeColumnName.
// rowId, columnId se sono presenti entrambi aggiorna una singola cella, se è presente solo rowId aggiorna tutte le
// le celle lungo rowId, se e presente solo columnId aggiorna tutte le celle lungo columnId
public record CellPatchDTO(
        UUID rowId,
        UUID columnId,
        int dataTypeId,
        String newValue
) {}
