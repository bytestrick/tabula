package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.TableCard;
import com.github.bytestrick.tabula.repository.HomeDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FuzzySearchTableCard {

    private final HomeDao homeDao;


    public List<TableCard> fuzzySearch(String pattern, UUID userId) {
        List<TableCardWithSimilarity> result = new ArrayList<>();

        int page = 0;
        int pageSize = 50;
        List<TableCard> tableCards = homeDao.findTableCardPaginated(page, pageSize, userId);

        while (!tableCards.isEmpty()) {
            for (TableCard tableCard : tableCards) {
                float threshold = (float) pattern.length() / tableCard.getTitle().length() * 0.749f;
                float similarity = FuzzySearch.similarity(pattern, tableCard.getTitle());

                if (similarity >= threshold) {
                    result.add(new TableCardWithSimilarity(tableCard, similarity));
                }
            }
            page += 1;
            tableCards = homeDao.findTableCardPaginated(page, pageSize, userId);
        }

        result.sort(
                (t1, t2) -> Float.compare(t2.similarity(), t1.similarity()));
        return result.stream().map(TableCardWithSimilarity::tableCard).toList();
    }

    public record TableCardWithSimilarity(TableCard tableCard, float similarity) {}
}
