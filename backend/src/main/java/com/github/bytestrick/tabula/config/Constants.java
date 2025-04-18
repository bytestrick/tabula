package com.github.bytestrick.tabula.config;

public class Constants {
    /**
     * Regular expression used to validate passwords.
     * <p>It is duplicated in the frontend.
     */
    public static final String PASSWORD_REGEXP =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!#$%&'()*+,\\-./:;<=>?@\\[\\\\\\]^_`{|}~]).{10,}$";
}
