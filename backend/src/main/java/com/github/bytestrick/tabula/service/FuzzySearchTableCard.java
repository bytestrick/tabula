package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.TableCard;
import com.github.bytestrick.tabula.repository.HomeDao;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FuzzySearchTableCard {

    private final HomeDao homeDao;

    public FuzzySearchTableCard(HomeDao homeDao) {
        this.homeDao = homeDao;
    }

    public List<TableCard> fuzzySearch(String pattern) {
        List<TableCardWithSimilarity> result = new ArrayList<>();

        int page = 0;
        int pageSize = 50;
        List<TableCard> tableCards = homeDao.findTableCardPaginated(page, pageSize);

        while (!tableCards.isEmpty()) {
            for (TableCard tableCard : tableCards) {
                float threshold = (float) pattern.length() / tableCard.getTitle().length() * 0.749f;
                float similarity = FuzzySearch.similarity(pattern, tableCard.getTitle());

                if (similarity >= threshold) {
                    result.add(new TableCardWithSimilarity(tableCard, similarity));
                }
            }

            page += 1;
            tableCards = homeDao.findTableCardPaginated(page, pageSize);
        }

        result.sort(Comparator.comparingDouble(TableCardWithSimilarity::similarity));

        List<TableCard> sortedTableCards = new ArrayList<>();
        for (TableCardWithSimilarity entry : result) {
            sortedTableCards.add(entry.tableCard());
        }

        return sortedTableCards;
    }

    public record TableCardWithSimilarity(TableCard tableCard, float similarity) {}
}
