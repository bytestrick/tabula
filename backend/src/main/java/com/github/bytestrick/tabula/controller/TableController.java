package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.InformativeResponse;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
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
}
