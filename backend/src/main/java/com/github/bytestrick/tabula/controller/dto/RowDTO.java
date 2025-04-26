package com.github.bytestrick.tabula.controller.dto;

import java.util.UUID;

public record RowDTO(
        UUID tableId,
        int rowIndex
) {}
