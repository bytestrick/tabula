package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.InformativeResponse;
import com.github.bytestrick.tabula.controller.dto.table.TableContentDTO;
import com.github.bytestrick.tabula.controller.dto.table.*;
import com.github.bytestrick.tabula.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;


    @GetMapping("after/{tableId}")
    public ResponseEntity<List<TableCreatedDTO>> getTablesAfter(@PathVariable UUID tableId,
                                                                @RequestParam int quantity) {

        return ResponseEntity.ok().body(tableService.getNextTables(tableId, quantity));
    }


    @GetMapping("last")
    public ResponseEntity<List<TableCreatedDTO>> getTablesFromEnd(@RequestParam int quantity) {
        return ResponseEntity.ok().body(tableService.getLastTables(quantity));
    }


    @PostMapping
    public ResponseEntity<TableCreatedDTO> createTable(@RequestBody TableCreateDTO tableCreateDTO) {
        return ResponseEntity.ok().body(tableService.createNewTable(tableCreateDTO));
    }


    @PutMapping("/{tableId}")
    public ResponseEntity<InformativeResponse> updateTableCard(@PathVariable UUID tableId,
                                             @Valid @RequestBody TablePutDTO tablePutDTO) {

        return ResponseEntity.ok().body(new InformativeResponse(tableService.updateTable(tableId, tablePutDTO)));
    }


    @DeleteMapping("/{tableId}")
    public ResponseEntity<InformativeResponse> deleteTable(@PathVariable UUID tableId) {
        return ResponseEntity.ok().body(new InformativeResponse(tableService.deleteTable(tableId)));
    }


    @GetMapping
    public ResponseEntity<List<TableCreatedDTO>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(tableService.fuzzySearch(pattern));
    }


    /**
     * REST controller endpoint for retrieving a complete table.
     *
     * @param tableId UUID of the table to fetch.
     * @return HTTP 200 OK with a {@link TableContentDTO} containing the table’s metadata and content.
     */
    @GetMapping("/{tableId}/content")
    public ResponseEntity<TableContentDTO> getTableContent(@PathVariable UUID tableId) {
        return ResponseEntity.ok(tableService.getTable(tableId));
    }


    /**
     * REST controller endpoint for creating a new row in the specified table.
     *
     * <p>If {@code rowCreateDTO.rowIndex} is null, the new row is appended at the end;
     * otherwise it is inserted at the given zero-based index.</p>
     *
     * @param tableId      UUID of the table in which to insert the row.
     * @param rowCreateDTO Payload containing the optional insertion index.
     * @return HTTP 201 Created with a {@link RowCreatedDTO} describing the new row.
     */
    @PostMapping("/{tableId}/content/rows")
    public ResponseEntity<RowCreatedDTO> addNewRow(
            @PathVariable UUID tableId, @Valid @RequestBody RowCreateDTO rowCreateDTO) {

        RowCreatedDTO rowCreatedDTO = tableService.addNewRow(tableId, rowCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(rowCreatedDTO);
    }


    /**
     * REST controller endpoint for moving rows within a table.
     *
     * @param tableId     UUID of the table to modify.
     * @param moveRowsDTO Payload containing the list of row UUIDs to move, plus source and target indices.
     * @return HTTP 200 OK with a {@link MovedRowsOrColumnsDTO} listing the original indexes
     * and the shift delta.
     */
    @PatchMapping("/{tableId}/content/rows")
    public ResponseEntity<MovedRowsOrColumnsDTO> moveRowsIndexes(
            @PathVariable UUID tableId, @Valid @RequestBody MovesRowsOrColumnsDTO moveRowsDTO) {

        MovedRowsOrColumnsDTO movedRowsOrColumnsDTO = tableService.moveRowsIndexes(tableId, moveRowsDTO);
        return ResponseEntity.ok(movedRowsOrColumnsDTO);
    }


    /**
     * REST controller endpoint for deleting one or more rows from a specified table.
     *
     * @param tableId       UUID of the table from which the rows will be deleted.
     * @param rowsDeleteDTO DTO containing a non-null, non-empty list of row UUIDs to delete.
     * @return {@code ResponseEntity<RowsDeletedDTO>} containing the indexes
     * of the rows that were deleted; returns HTTP 200 OK.
     */
    @DeleteMapping("{tableId}/content/rows")
    public ResponseEntity<RowsDeletedDTO> deleteRows(
            @PathVariable UUID tableId, @Valid @RequestBody RowsDeleteDTO rowsDeleteDTO) {

        RowsDeletedDTO deletedRowsDTO = tableService.deleteRows(tableId, rowsDeleteDTO);
        return ResponseEntity.ok(deletedRowsDTO);
    }


    /**
     * REST controller endpoint for creating a new column in the specified table.
     *
     * <p>If {@code columnDTO.columnIndex} is null, the new column is appended at the end;
     * otherwise it is inserted at the given zero-based index.</p>
     *
     * @param tableId   UUID of the table in which to insert the column.
     * @param columnDTO Payload containing dataTypeId and optional columnIndex.
     * @return HTTP 201 Created with a {@link ColumnCreatedDTO} describing the new column.
     */
    @PostMapping("/{tableId}/content/columns")
    public ResponseEntity<ColumnCreatedDTO> addNewColumn(
            @PathVariable UUID tableId, @Valid @RequestBody ColumnCreateDTO columnDTO) {

        ColumnCreatedDTO columnCreatedDTO = tableService.addNewColumn(tableId, columnDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(columnCreatedDTO);
    }


    /**
     * REST controller endpoint for deleting one or more columns from a specified table.
     *
     * @param tableId          UUID of the table from which the columns will be deleted.
     * @param columnsDeleteDTO DTO containing a non-null, non-empty list of column UUIDs to delete.
     * @return HTTP 200 Created with a {@link ColumnsDeletedDTO} containing the indexes
     * of the columns that were deleted.
     */
    @DeleteMapping("{tableId}/content/columns")
    public ResponseEntity<ColumnsDeletedDTO> deleteColumns(
            @PathVariable UUID tableId, @Valid @RequestBody ColumnsDeleteDTO columnsDeleteDTO) {

        ColumnsDeletedDTO columnsDeletedDTO = tableService.deleteColumns(tableId, columnsDeleteDTO);
        return ResponseEntity.ok(columnsDeletedDTO);
    }


    /**
     * REST controller endpoint for updating a column’s properties: name, position, and/or data type.
     * Only the non-null fields in the request body will be applied.
     *
     * @param tableId        UUID of the parent table.
     * @param columnId       UUID of the column to update.
     * @param columnPatchDTO Payload containing the fields to change. ( see {@link ColumnPatchDTO})
     * @return HTTP 204 No Content on success.
     */
    @PatchMapping("/{tableId}/content/columns/{columnId}")
    public ResponseEntity<ColumnPatchedDTO> patchColumn(
            @PathVariable UUID tableId, @PathVariable UUID columnId,
            @Valid @RequestBody ColumnPatchDTO columnPatchDTO) {

        ColumnPatchedDTO columnPatchedDTO = tableService.patchHeaderColumn(tableId, columnId, columnPatchDTO);
        return ResponseEntity.ok(columnPatchedDTO);
    }


    /**
     * REST controller endpoint for moving columns within a table.
     * The shift is computed as {@code toIndex - fromIndex} and applied to each moved column.
     *
     * @param tableId        UUID of the table to modify.
     * @param moveColumnsDTO Payload containing the list of column UUIDs to move, plus source and target indices.
     * @return HTTP 200 OK with a {@link MovedRowsOrColumnsDTO} listing the original indexes
     * and the shift delta.
     */
    @PatchMapping("/{tableId}/content/columns")
    public ResponseEntity<MovedRowsOrColumnsDTO> moveColumnsIndexes(
            @PathVariable UUID tableId, @Valid @RequestBody MovesRowsOrColumnsDTO moveColumnsDTO) {

        MovedRowsOrColumnsDTO movedColumnsDTO = tableService.moveColumnsIndexes(tableId, moveColumnsDTO);
        return ResponseEntity.ok(movedColumnsDTO);
    }


    /**
     * REST controller endpoint for updating one or more cell values in a single request.
     * Each {@code CellPatchDTO} may target a single cell, entire row, or entire column
     * depending on which UUIDs are provided. ( See {@link CellPatchDTO})
     *
     * @param tableId       UUID of the table containing the cells.
     * @param cellsPatchDTO List of {@link CellPatchDTO} objects carrying rowId, columnId, dataTypeId, and newValue.
     * @return HTTP 200 OK with a list of {@link CellPatchedDTO}, each describing the updated cell’s
     * zero-based row & column indexes and new value.
     */
    @PatchMapping("/{tableId}/content/cells")
    public ResponseEntity<List<CellPatchedDTO>> patchCellByCoords(
            @PathVariable UUID tableId,
            @Valid @RequestBody List<CellPatchDTO> cellsPatchDTO) {

        List<CellPatchedDTO> cellPatchedDTO = tableService.updateCellValue(tableId, cellsPatchDTO);
        return ResponseEntity.ok(cellPatchedDTO);
    }
}
