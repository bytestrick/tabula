package com.github.bytestrick.tabula.controller.dto;

public record CellDTO(
        String tableId,
        int rowIndex,
        int columnIndex,
        String value
) {}
