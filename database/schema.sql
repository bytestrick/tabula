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
       ('Monetary'),
       ('Map');

CREATE TABLE tbl_table
(
    id             UUID         PRIMARY KEY,
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
    id              UUID PRIMARY KEY,
    tbl_table       UUID,
    data_type       SMALLINT,
    column_index    INT NOT NULL,
    column_name     VARCHAR(300),

    FOREIGN KEY (tbl_table) REFERENCES tbl_table (id) ON DELETE CASCADE,
    FOREIGN KEY (data_type) REFERENCES data_type (id),
    UNIQUE(column_index, tbl_table) DEFERRABLE INITIALLY DEFERRED
);


CREATE TABLE tbl_row
(
    id UUID         PRIMARY KEY,
    tbl_table       UUID,
    row_index       INT NOT NULL,

    FOREIGN KEY (tbl_table) REFERENCES tbl_table (id) ON DELETE CASCADE,
    UNIQUE(row_index, tbl_table) DEFERRABLE INITIALLY DEFERRED
);


CREATE TABLE cell
(
    id              UUID PRIMARY KEY,
    tbl_row         UUID,
    tbl_column      UUID,
    value           VARCHAR(1000) NOT NULL DEFAULT '',

    FOREIGN KEY (tbl_column) REFERENCES tbl_column(id) ON DELETE CASCADE,
    FOREIGN KEY (tbl_row) REFERENCES tbl_row(id) ON DELETE CASCADE,
    UNIQUE(tbl_row, tbl_column)
);

------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION delete_column_cells_on_column_delete()
    RETURNS trigger AS
$$
BEGIN
    DELETE FROM cell WHERE tbl_column = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS onDeleteColumn ON tbl_column;
CREATE TRIGGER onDeleteColumn
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


DROP TRIGGER IF EXISTS on_delete_row ON tbl_row;
CREATE TRIGGER on_delete_row
    AFTER DELETE
    ON tbl_row
    FOR EACH ROW
EXECUTE FUNCTION delete_row_cells_on_row_delete();


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE OR REPLACE FUNCTION create_cells_on_new_row_insertion()
    RETURNS trigger AS
$$
DECLARE
    rec tbl_column%ROWTYPE;
BEGIN
    FOR rec IN
        SELECT *
        FROM tbl_column
        WHERE tbl_table = NEW.tbl_table
    LOOP
        INSERT INTO cell (id, tbl_row, tbl_column, value) VALUES (uuid_generate_v4(), NEW.id, rec.id, '');
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS after_row_insertion ON tbl_row;
CREATE TRIGGER after_row_insertion
AFTER INSERT ON tbl_row
FOR EACH ROW
EXECUTE FUNCTION create_cells_on_new_row_insertion();



CREATE OR REPLACE FUNCTION create_cells_on_new_column_insertion()
    RETURNS trigger AS
$$
DECLARE
    rec tbl_row%ROWTYPE;
BEGIN
    FOR rec IN
        SELECT *
        FROM tbl_row
        WHERE tbl_table = NEW.tbl_table
    LOOP
        INSERT INTO cell (id, tbl_row, tbl_column, value) VALUES (uuid_generate_v4(), rec.id, NEW.id, '');
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS after_column_insertion ON tbl_column;
CREATE TRIGGER after_column_insertion
AFTER INSERT ON tbl_column
FOR EACH ROW
EXECUTE FUNCTION create_cells_on_new_column_insertion();

