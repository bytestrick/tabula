package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.TableCard;
import com.github.bytestrick.tabula.repository.HomeDao;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class FuzzySearchTableCard {

    private final HomeDao homeDao;

    public FuzzySearchTableCard(HomeDao homeDao) {
        this.homeDao = homeDao;
    }

    public List<TableCard> fuzzySearch(String pattern, int distance) {
        List<TableCard> result = new ArrayList<>();
        int page = 0;
        int pageSize = 50;
        List<TableCard> tableCards = homeDao.findTableCardPaginated(page, pageSize);

        while (!tableCards.isEmpty()) {
            Iterator<TableCard> iterator = tableCards.iterator();
            while (iterator.hasNext()) {
                TableCard tableCard = iterator.next();
                if (FuzzySearch.levenshtein(pattern, tableCard.getTitle(), distance)) {
                    TableCard element = iterator.next();
                    iterator.remove();
                    result.add(element);
                }
            }
            page += 1;
            tableCards = homeDao.findTableCardPaginated(page, pageSize);
        }
        return result;
    }
}
