CREATE TABLE users
(
    id                UUID PRIMARY KEY,
    email             VARCHAR(255) NOT NULL UNIQUE,
    encoded_password  VARCHAR(60)  NOT NULL,
    roles             VARCHAR(255) NOT NULL,
    name              VARCHAR(255) NOT NULL,
    surname           VARCHAR(255) NOT NULL,
    country_name      VARCHAR(255) NOT NULL,
    country_flag      VARCHAR(4)   NOT NULL,
    country_code      CHAR(2)      NOT NULL,
    country_dial_code INT          NOT NULL
);

CREATE TABLE invalid_jwt
(
    token           VARCHAR(500) PRIMARY KEY,
    expiration_date TIMESTAMP NOT NULL
);

CREATE OR REPLACE FUNCTION delete_expired_jwt()
    RETURNS VOID AS
$$
BEGIN
    DELETE FROM invalid_jwt WHERE expiration_date < NOW();
END;
$$ LANGUAGE plpgsql;

--SELECT cron.schedule('delete-expired-jwt-daily', '0 0 * * *', 'SELECT delete_expired_jwt()');