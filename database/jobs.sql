CREATE OR REPLACE FUNCTION purge_expired_jwts()
    RETURNS VOID AS
$$
BEGIN
    DELETE FROM invalid_jwts WHERE expiration_date > NOW();
END;
$$ LANGUAGE plpgsql;

--SELECT cron.schedule('purge-expired-jwts-daily', '0 0 * * *', 'SELECT purge_expired_jwts()');

CREATE OR REPLACE FUNCTION purge_unverified_users()
    RETURNS VOID AS
$$
BEGIN
    DELETE FROM users WHERE NOT enabled AND otp_expiration::date <= NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

--SELECT cron.schedule('purge-unverified-users-daily', '0 0 * * *', 'SELECT purge_unverified_users()');



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
CREATE OR REPLACE TRIGGER after_row_insertion
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
