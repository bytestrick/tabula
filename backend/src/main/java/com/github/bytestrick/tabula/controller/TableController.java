package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/")
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

    @PostMapping("table")
    public ResponseEntity<TableDto> createTable(@RequestBody Table table) {
        return ResponseEntity.ok().body(tableService.createTable(table));
    }

    @PutMapping("table")
    public ResponseEntity<String> updateTable(@RequestBody Table table) {
        return ResponseEntity.ok().body(tableService.updateTable(table));
    }

    @DeleteMapping("table")
    public ResponseEntity<String> deleteTable(@RequestParam UUID id) {
        return ResponseEntity.ok().body(tableService.deleteTable(id));
    }

    @GetMapping("search")
    public ResponseEntity<List<TableDto>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(tableService.fuzzySearch(pattern));
    }
}
