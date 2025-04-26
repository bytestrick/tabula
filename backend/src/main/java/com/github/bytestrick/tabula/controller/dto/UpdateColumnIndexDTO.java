package com.github.bytestrick.tabula.controller.dto;

import java.util.UUID;

public record UpdateColumnIndexDTO(
        UUID tableId,
        int currentColumnIndex,
        int newColumnIndex
) {}
