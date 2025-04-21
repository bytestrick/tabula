package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.TableDTO;
import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.model.table.Cell;
import com.github.bytestrick.tabula.model.table.Row;
import com.github.bytestrick.tabula.repository.TableDao;
import com.github.bytestrick.tabula.repository.UserDao;
import com.github.bytestrick.tabula.repository.proxy.table.TableProxy;
import com.github.bytestrick.tabula.repository.table.TableDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final UserDao userDao;
    private final TableDAO tableDAO;
    private final TableDao tableDao;
    private final FuzzySearchTable fuzzySearchTable;


    public User getAuthUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private TableDto toTableCardDto(Table table) {
        return new TableDto(
                table.getId(),
                table.getTitle(),
                table.getDescription(),
                table.getCreationDate(),
                table.getLastEditDate(),
                table.getTableId()
        );
    }

    public List<TableDto> getNextTables(UUID id, int quantity) {
        return tableDao.findByCreationDateAfter(id, quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public List<TableDto> getLastTables(int quantity) {
        return tableDao.findLast(quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public TableDto createTable(Table table) {
        return toTableCardDto(tableDao.save(table, getAuthUser().getId()));
    }

    public String updateTable(Table table) {
        tableDao.update(table);
        return "TableCard updated successfully";
    }

    public String deleteTable(UUID id) {
        tableDao.deleteById(id);
        return "TableCard deleted successfully";
    }

    public List<TableDto> fuzzySearch(String pattern) {
        return fuzzySearchTable.fuzzySearch(pattern, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }


    @Transactional
    public TableDTO createNewTable() {
        UUID id = UUID.randomUUID();

        tableDAO.saveTable(id);
        TableProxy table = tableDAO.findTable(id);

        return new TableDTO(table.getId(), null, null);
    }


    @Transactional
    public TableDTO getTable(UUID tableId) {
        TableProxy table = tableDAO.findTable(tableId);
        List<List<String>> content = new ArrayList<>();
        List<String> headers = tableDAO.getTableDataTypesNames(tableId);

        for (Row row : table.getRows()) {
            content.add(
                    row.getCells().stream().map(Cell::getValue).toList()
            );
        }

        return new TableDTO(table.getId(), headers, content);
    }
}
