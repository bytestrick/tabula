package com.github.bytestrick.tabula.service;

import com.github.bytestrick.tabula.controller.dto.TableDto;
import com.github.bytestrick.tabula.model.Table;
import com.github.bytestrick.tabula.model.User;
import com.github.bytestrick.tabula.repository.HomeDao;
import com.github.bytestrick.tabula.repository.UserDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final UserDao userDao;
    private final HomeDao homeDao;
    private final FuzzySearchTable fuzzySearchTableCard;
    private final TableService tableService;


    public User getAuthUser() {
        Authentication authentication = isAuthenticate();
        String email = authentication.getName();

        return userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Authentication isAuthenticate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null)
            if (!authentication.isAuthenticated()) {
                String email = authentication.getName();
                throw new UsernameNotFoundException("User not found: " + email);
            }

        return authentication;
    }

    private TableDto toTableCardDto(Table tableCard) {
        return new TableDto(
                tableCard.getId(),
                tableCard.getTitle(),
                tableCard.getDescription(),
                tableCard.getCreationDate(),
                tableCard.getLastEditDate(),
                tableCard.getTableId()
        );
    }

    public List<TableDto> getNextTableCard(UUID id, int quantity) {
        return homeDao.findByCreationDateAfter(id, quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    public List<TableDto> getLastTableCard(int quantity) {
        return homeDao.findLast(quantity, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }

    @Transactional
    public TableDto createTableCard(Table tableCard) {
        return toTableCardDto(
                homeDao.saveTableCard(tableCard, getAuthUser().getId(), tableService.createNewTable().id())
        );
    }

    public String updateTableCard(Table tableCard) {
        isAuthenticate();
        homeDao.updateTableCard(tableCard);
        return "TableCard updated successfully";
    }

    @Transactional
    public String deleteTableCard(UUID id) {
        isAuthenticate();
        UUID tableId = homeDao.findTableCardById(id).getTableId();
        homeDao.deleteTableCardById(id);
        tableService.deleteTable(tableId);
        return "TableCard deleted successfully";
    }

    public List<TableDto> fuzzySearch(String pattern) {
        return fuzzySearchTableCard.fuzzySearch(pattern, getAuthUser().getId())
                .stream().map(this::toTableCardDto).toList();
    }


    public boolean currentUserHasTable(UUID tableId) {
        return homeDao.userHasTable(getAuthUser().getId(), tableId);
    }
}
