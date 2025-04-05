package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.model.TableCard;
import com.github.bytestrick.tabula.repository.HomeDao;
import com.github.bytestrick.tabula.service.FuzzySearchTableCard;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/")
public class HomeController {

    private final HomeDao homeDao;
    private final FuzzySearchTableCard fuzzySearchTableCard;


    public HomeController(HomeDao homeDao, FuzzySearchTableCard fuzzySearchTableCard) {
        this.homeDao = homeDao;
        this.fuzzySearchTableCard = fuzzySearchTableCard;
    }


    @GetMapping("table-card")
    public ResponseEntity<List<TableCard>> getTableCardsPaginated(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(homeDao.findTableCardPaginated(page, size));
    }

    @PostMapping("table-card")
    public ResponseEntity<TableCard> createTableCard(@RequestBody TableCard tableCard) {
        return ResponseEntity.ok().body(homeDao.saveTableCard(tableCard));
    }

    @PutMapping("table-card")
    public ResponseEntity<String> updateTableCard(@RequestBody TableCard tableCard) {
        homeDao.updateTableCard(tableCard);
        return ResponseEntity.ok().body("TableCard updated successfully");
    }

    @DeleteMapping("table-card")
    public ResponseEntity<String> deleteTableCard(@RequestParam UUID id) {
        homeDao.deleteTableCardById(id);
        return ResponseEntity.ok().body("TableCard deleted successfully");
    }

    @GetMapping("search")
    public ResponseEntity<List<TableCard>> fuzzySearch(@RequestParam String pattern) {
        return ResponseEntity.ok(fuzzySearchTableCard.fuzzySearch(pattern));
    }
}
