package com.github.bytestrick.tabula.model.table;

import com.github.bytestrick.tabula.repository.proxy.table.ColumnProxy;
import com.github.bytestrick.tabula.repository.proxy.table.RowProxy;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;


@Data
@AllArgsConstructor
public class Table {

    private UUID id;
    private List<ColumnProxy> columns;
    private List<RowProxy> rows;
}
