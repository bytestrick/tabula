package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;


    @GetMapping("table-card/next")
    public ResponseEntity<List<TableDto>> getNextTableCard(@RequestParam UUID id, @RequestParam int quantity) {
        return ResponseEntity.ok().body(homeService.getNextTableCard(id, quantity));
    }

    @GetMapping("table-card")
    public ResponseEntity<List<TableDto>> getLastTableCard(@RequestParam int quantity) {
        return ResponseEntity.ok().body(homeService.getLastTableCard(quantity));
    }

    @PostMapping("table-card")
    public ResponseEntity<TableDto> createTableCard(@RequestBody Table tableCard) {
        return ResponseEntity.ok().body(homeService.createTableCard(tableCard));
    }

    @PutMapping("table-card")
    public ResponseEntity<String> updateTableCard(@RequestBody Table tableCard) {
        return ResponseEntity.ok().body(homeService.updateTableCard(tableCard));
    }

    @DeleteMapping("table-card")
    public ResponseEntity<String> deleteTableCard(@RequestParam UUID id) {
        return ResponseEntity.ok().body(homeService.deleteTableCard(id));
    }

    @GetMapping("search")
    public ResponseEntity<List<TableDto>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(homeService.fuzzySearch(pattern));
    }

    @GetMapping("user-table")
    public ResponseEntity<Boolean> getTable(@RequestParam("table-id") String tableId) {
        if (homeService.currentUserHasTable(UUID.fromString(tableId))) {
            return ResponseEntity.ok(Boolean.TRUE);
        }

        return ResponseEntity.notFound().build();
    }
}
