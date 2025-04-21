package com.github.bytestrick.tabula.controller.dto;

import java.util.List;
import java.util.UUID;

public record TableDTO(
        UUID id,
        List<String> header,
        List<List<String>> content
) {}
