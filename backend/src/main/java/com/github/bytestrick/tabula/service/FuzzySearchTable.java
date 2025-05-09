package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.model.table.Table;
import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import com.github.bytestrick.tabula.repository.table.TableDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FuzzySearchTable {

    private final TableDAO tableDao;


    public List<Table> fuzzySearch(String pattern, UUID userId) {
        List<TableCardWithSimilarity> result = new ArrayList<>();

        int page = 0;
        int pageSize = 50;
        List<TableProxy> tables = tableDao.findPaginated(page, pageSize, userId);

        while (!tables.isEmpty()) {
            for (Table table : tables) {
                float threshold = (float) pattern.length() / table.getTitle().length() * 0.749f;
                float similarity = FuzzySearch.similarity(pattern, table.getTitle());

                if (similarity >= threshold) {
                    result.add(new TableCardWithSimilarity(table, similarity));
                }
            }
            page += 1;
            tables = tableDao.findPaginated(page, pageSize, userId);
        }

        result.sort(
                (t1, t2) -> Float.compare(t2.similarity(), t1.similarity()));
        return result.stream().map(TableCardWithSimilarity::table).toList();
    }

    public record TableCardWithSimilarity(Table table, float similarity) {
    }
}
