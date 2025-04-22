package com.github.bytestrick.tabula.controller.dto;

import java.util.List;
import java.util.UUID;

public record TableDTO(
        UUID id,
        List<ColumnDTO> header,
        List<List<String>> content
) {}
