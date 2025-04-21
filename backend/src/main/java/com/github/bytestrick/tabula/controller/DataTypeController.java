package com.github.bytestrick.tabula.controller;


import com.github.bytestrick.tabula.controller.dto.DataTypeDTO;
import com.github.bytestrick.tabula.model.table.DataType;
import com.github.bytestrick.tabula.service.DataTypeService;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedList;
import java.util.List;


@RestController
@RequestMapping(
        value = "/data-type",
        produces = MediaType.APPLICATION_JSON_VALUE
)
@RequiredArgsConstructor
public class DataTypeController {

    private final DataTypeService dataTypeService;


    @GetMapping
    public ResponseEntity<List<DataTypeDTO>> getDataType(
            @RequestParam(name = "term", required = false, defaultValue = "") String term) {

        List<DataTypeDTO> result;

        if (term.isBlank())
            result = dataTypeService.getAllDataTypes();
        else
            result = dataTypeService.fuzzySearchDataTypes(term);

        return ResponseEntity.ok(result);
    }
}
