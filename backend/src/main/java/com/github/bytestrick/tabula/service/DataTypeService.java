package com.github.bytestrick.tabula.service;


import com.github.bytestrick.tabula.controller.dto.table.DataTypeDTO;
import com.github.bytestrick.tabula.model.Pair;
import com.github.bytestrick.tabula.model.table.DataType;
import com.github.bytestrick.tabula.repository.table.DataTypeDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataTypeService {

    private final DataTypeDAO dataTypeDAO;


    private DataTypeDTO convertToDataTypeDTO(DataType dataType) {
        return new DataTypeDTO(dataType.id(), dataType.name());
    }


    public List<DataTypeDTO> getAllDataTypes() {
        return dataTypeDAO.findAll().stream().map(this::convertToDataTypeDTO).toList();
    }


    public List<DataTypeDTO> fuzzySearchDataTypes(String name) {
        List<DataType> dataTypes = dataTypeDAO.findAll();
        List<Pair<DataType, Float>> fuzzySearchDataTypes = new LinkedList<>();

        for (DataType dataType : dataTypes) {
            float threshold = (float) name.length() / dataType.name().length() * 0.749f;
            float similarity = FuzzySearch.similarity(name, dataType.name());

            if (similarity >= threshold) {
                fuzzySearchDataTypes.add(new Pair<>(dataType, similarity));
            }
        }

        fuzzySearchDataTypes.sort(
                (o1, o2) -> Float.compare(o2.getSecond(), o1.getSecond())
        );

        return fuzzySearchDataTypes
                .stream()
                .map(Pair::getFirst)
                .map(this::convertToDataTypeDTO)
                .toList();
    }


    public int getDefaultDataTypeId() {
        return dataTypeDAO.findByName("Textual").id();
    }
}
