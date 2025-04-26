package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.TableCardDto;
import com.github.bytestrick.tabula.model.TableCard;
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
    public ResponseEntity<List<TableCardDto>> getNextTableCard(@RequestParam UUID id, @RequestParam int quantity) {
        return ResponseEntity.ok().body(homeService.getNextTableCard(id, quantity));
    }

    @GetMapping("table-card")
    public ResponseEntity<List<TableCardDto>> getLastTableCard(@RequestParam int quantity) {
        return ResponseEntity.ok().body(homeService.getLastTableCard(quantity));
    }

    @PostMapping("table-card")
    public ResponseEntity<TableCardDto> createTableCard(@RequestBody TableCard tableCard) {
        return ResponseEntity.ok().body(homeService.createTableCard(tableCard));
    }

    @PutMapping("table-card")
    public ResponseEntity<String> updateTableCard(@RequestBody TableCard tableCard) {
        return ResponseEntity.ok().body(homeService.updateTableCard(tableCard));
    }

    @DeleteMapping("table-card")
    public ResponseEntity<String> deleteTableCard(@RequestParam UUID id) {
        return ResponseEntity.ok().body(homeService.deleteTableCard(id));
    }

    @GetMapping("search")
    public ResponseEntity<List<TableCardDto>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(homeService.fuzzySearch(pattern));
    }
}
