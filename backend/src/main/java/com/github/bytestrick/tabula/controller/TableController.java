package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.InformativeResponse;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.controller.dto.CellDTO;
import com.github.bytestrick.tabula.controller.dto.ColumnDTO;
import com.github.bytestrick.tabula.controller.dto.RowDTO;
import com.github.bytestrick.tabula.controller.dto.TableDTO;
import com.github.bytestrick.tabula.controller.dto.*;
import com.github.bytestrick.tabula.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/table")
@RequiredArgsConstructor
public class TableController {
    private final TableService tableService;

    @GetMapping("table/next")
    public ResponseEntity<List<TableDto>> getNextTables(@RequestParam UUID id, @RequestParam int quantity) {
        return ResponseEntity.ok().body(tableService.getNextTables(id, quantity));
    }

    @GetMapping("table")
    public ResponseEntity<List<TableDto>> getLastTables(@RequestParam int quantity) {
        return ResponseEntity.ok().body(tableService.getLastTables(quantity));
    }

    @PostMapping(value = "table", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TableDto> createTable(@RequestBody Table table) {
        return ResponseEntity.ok().body(tableService.createTable(table));
    }

    @PutMapping(value = "table", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateTableCard(@RequestBody Table table) {
        return ResponseEntity.ok().body(new InformativeResponse(tableService.updateTable(table)));
    }

    @DeleteMapping("table")
    public ResponseEntity<?> deleteTableCard(@RequestParam UUID id) {
        return ResponseEntity.ok().body(new InformativeResponse(tableService.deleteTable(id)));
    }

    @GetMapping("search")
    public ResponseEntity<List<TableDto>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(tableService.fuzzySearch(pattern));
    }

    
    @PutMapping
    public ResponseEntity<?> createTable() {
        tableService.createNewTable();
        return ResponseEntity.ok().build();
    }


    @GetMapping
    public ResponseEntity<TableDTO> getTable(@RequestParam("table-id") UUID tableId) {

        return ResponseEntity.ok(tableService.getTable(tableId));
    }


    @PostMapping("/row")
    public ResponseEntity<Void> appendNewRow(@RequestParam("table-id") UUID tableId) {
        tableService.appendNewRow(tableId);

        return ResponseEntity.ok().build();
    }


    @PatchMapping("/row")
    public ResponseEntity<Void> updateRowsIndexes(@RequestBody List<UpdateRowIndexDTO> rowDTOList) {
        tableService.updateRowsIndexes(rowDTOList);

        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/row")
    public ResponseEntity<Void> deleteRows(
            @RequestBody List<RowDTO> rowDTOList) {

        tableService.deleteRows(rowDTOList);

        return ResponseEntity.ok().build();
    }


    @PostMapping("/column")
    public ResponseEntity<Void> appendNewColumn(@RequestBody ColumnDTO columnDTO) {
        tableService.appendNewColumn(columnDTO.tableId(), columnDTO.dataType());

        return ResponseEntity.ok().build();
    }


    @PatchMapping("column")
    public ResponseEntity<Void> updateColumnsIndexes(@RequestBody List<UpdateColumnIndexDTO> columnDTOList) {
        tableService.updateColumnsIndexes(columnDTOList);

        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/column")
    public ResponseEntity<Void> deleteColumns(
            @RequestBody List<ColumnDTO> columnDTOList) {

        tableService.deleteColumns(columnDTOList);

        return ResponseEntity.ok().build();
    }


    @PostMapping("/column-data-type")
    public ResponseEntity<Void> changeColumnDataType(@RequestBody ColumnDTO columnDTO) {
        tableService.changeColumnDataType(columnDTO.tableId(), columnDTO.columnIndex(), columnDTO.dataType());

        return ResponseEntity.ok().build();
    }


    @PostMapping("/cell")
    public ResponseEntity<Void> updateCellValue(@RequestBody CellDTO cellDTO) {
        tableService.updateCellValue(
                cellDTO.tableId(), cellDTO.rowIndex(), cellDTO.columnIndex(), cellDTO.value()
        );

        return ResponseEntity.ok().build();
    }
}
