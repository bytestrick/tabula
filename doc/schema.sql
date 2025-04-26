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
    otp               VARCHAR(6) NULL,
    otp_expiration    TIMESTAMP NULL
);

CREATE TABLE invalid_jwts
(
    token           VARCHAR(500) PRIMARY KEY,
    expiration_date TIMESTAMP NOT NULL
);


CREATE OR REPLACE FUNCTION delete_expired_jwt()
    RETURNS VOID AS
$$
BEGIN
    DELETE FROM invalid_jwts WHERE expiration_date < NOW();
END;
$$ LANGUAGE plpgsql;

--SELECT cron.schedule('delete-expired-jwt-daily', '0 0 * * *', 'SELECT delete_expired_jwt()');

--TODO: cron job to delete all users that are not verified and have an expired OTP


CREATE TABLE data_type 
(
    id              SMALLSERIAL PRIMARY KEY,
    name            VARCHAR(500) NOT NULL,

    UNIQUE (name)
);

INSERT INTO data_type (name)
VALUES
    ('Textual'),
    ('Numeric'),
    ('Monetary');


CREATE TABLE my_table 
(
    id              UUID PRIMARY KEY
);


CREATE TABLE my_column
(
    id              UUID PRIMARY KEY,
    my_table        UUID,
    data_type       SMALLSERIAL,
    column_index    INT NOT NULL,
    column_name     VARCHAR(300),

    FOREIGN KEY (my_table) REFERENCES my_table (id) ON DELETE CASCADE,
    FOREIGN KEY (data_type) REFERENCES data_type (id),
    UNIQUE(column_index, my_table) DEFERRABLE INITIALLY DEFERRED
);


CREATE TABLE my_row
(
    id UUID         PRIMARY KEY,
    my_table        UUID,
    row_index       INT NOT NULL,

    FOREIGN KEY (my_table) REFERENCES my_table (id) ON DELETE CASCADE,
    UNIQUE(row_index, my_table) DEFERRABLE INITIALLY DEFERRED
);


CREATE TABLE cell
(
    id              UUID PRIMARY KEY,
    my_row          UUID,
    my_column       UUID,
    value           VARCHAR(1000),

    FOREIGN KEY (my_column) REFERENCES my_column(id) ON DELETE CASCADE,
    FOREIGN KEY (my_row) REFERENCES my_row(id) ON DELETE CASCADE,
    UNIQUE(my_row, my_column)
);



create table table_card
(
    id             uuid         default gen_random_uuid() not null primary key,
    title          varchar(50)  default ''                not null,
    description    varchar(500) default ''                not null,
    creation_date  timestamp    default now()             not null,
    last_edit_date timestamp,
    user_id        uuid
        constraint table_card_users__fk
            references users,
    table_id       uuid
        constraint table_card_my_table__fk
            references my_table
);

