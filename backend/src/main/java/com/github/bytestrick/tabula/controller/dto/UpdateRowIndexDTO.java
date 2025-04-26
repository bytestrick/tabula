package com.github.bytestrick.tabula.controller.dto;

import java.util.UUID;

public record UpdateRowIndexDTO(
        UUID tableId,
        int currentRowIndex,
        int newRowIndex
) {}
