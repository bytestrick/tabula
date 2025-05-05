package com.github.bytestrick.tabula.controller.dto.table;


import java.util.List;

public record MovedRowsOrColumnsDTO(
        List<Integer> indexes, // indici selezionati spostati o indice spostato
        int delta // di qunato deve essere spostata una riga o colonna
) {}
