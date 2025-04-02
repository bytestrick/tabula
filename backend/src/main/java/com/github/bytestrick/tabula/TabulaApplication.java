package com.github.bytestrick.tabula;

import com.github.bytestrick.tabula.repository.HomeDao;
import com.github.bytestrick.tabula.service.FuzzySearchTableCard;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TabulaApplication {
    public static void main(String[] args) {
        SpringApplication.run(TabulaApplication.class, args);
    }
}
