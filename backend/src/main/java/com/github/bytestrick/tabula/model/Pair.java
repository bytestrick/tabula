package com.github.bytestrick.tabula.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;


@AllArgsConstructor
@Getter
@Setter
public class Pair<T, U> {
    private T first;
    private U second;
}
