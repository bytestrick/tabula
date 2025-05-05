-- note: SQL is case-insensitive, so prefer snake_case to camelCase for names

CREATE TABLE users
(
    id                UUID PRIMARY KEY,
    email             VARCHAR(512) NOT NULL UNIQUE,
    encoded_password  VARCHAR(60)  NOT NULL,
    roles             VARCHAR(256) NOT NULL,
    name              VARCHAR(100) NOT NULL,
    surname           VARCHAR(100) NOT NULL,
    country_name      VARCHAR(200) NOT NULL,
    country_flag      VARCHAR(4)   NOT NULL,
    country_code      CHAR(2)      NOT NULL,
    country_dial_code INT          NOT NULL,
    enabled           BOOLEAN DEFAULT FALSE,
    otp               VARCHAR(6)   NULL,
    otp_expiration    TIMESTAMP    NULL
);

CREATE TABLE invalid_jwts
(
    token           VARCHAR(500) PRIMARY KEY,
    expiration_date TIMESTAMP NOT NULL
);


CREATE TABLE data_type
(
    id   SMALLSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,

    UNIQUE (name)
);

INSERT INTO data_type (name)
VALUES ('Textual'),
       ('Numeric'),
       ('Monetary');

CREATE TABLE tbl_table
(
    id             UUID         DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title          VARCHAR(50)  DEFAULT ''                NOT NULL,
    description    VARCHAR(500) DEFAULT ''                NOT NULL,
    creation_date  TIMESTAMP    DEFAULT now()             NOT NULL,
    last_edit_date TIMESTAMP    DEFAULT NULL,
    user_id        UUID
        CONSTRAINT tbl_table_users__fk
            REFERENCES users ON DELETE CASCADE
);


CREATE TABLE tbl_column
(
    id           UUID PRIMARY KEY,
    tbl_table    UUID,
    data_type    SMALLSERIAL,
    column_index INT NOT NULL,

    FOREIGN KEY (tbl_table) REFERENCES tbl_table (id),
    FOREIGN KEY (data_type) REFERENCES data_type (id),
    UNIQUE (column_index, tbl_table)
);


CREATE TABLE tbl_row
(
    id        UUID PRIMARY KEY,
    tbl_table UUID,
    row_index INT NOT NULL,

    FOREIGN KEY (tbl_table) REFERENCES tbl_table (id),
    UNIQUE (row_index, tbl_table)
);


CREATE TABLE cell
(
    id         UUID PRIMARY KEY,
    tbl_row    UUID,
    tbl_column UUID,
    value      VARCHAR(1000),

    FOREIGN KEY (tbl_column) REFERENCES tbl_column (id),
    FOREIGN KEY (tbl_row) REFERENCES tbl_row (id)
);


CREATE OR REPLACE FUNCTION delete_column_cells_on_column_delete()
    RETURNS trigger AS
$$
BEGIN
    DELETE FROM cell WHERE tbl_column = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER onDeleteColumn
    AFTER DELETE
    ON tbl_column
    FOR EACH ROW
EXECUTE FUNCTION delete_column_cells_on_column_delete();


CREATE OR REPLACE FUNCTION delete_row_cells_on_row_delete()
    RETURNS trigger AS
$$
BEGIN
    DELETE FROM cell WHERE tbl_row = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER on_delete_row
    AFTER DELETE
    ON tbl_row
    FOR EACH ROW
EXECUTE FUNCTION delete_row_cells_on_row_delete();
