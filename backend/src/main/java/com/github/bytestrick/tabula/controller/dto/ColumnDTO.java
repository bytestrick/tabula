package com.github.bytestrick.tabula.controller.dto;

import java.util.UUID;

public record ColumnDTO(
        UUID tableId,
        int dataType,
        String columnName,
        int columnIndex
) {}
