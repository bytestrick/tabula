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
    rec my_column%ROWTYPE;
BEGIN
    FOR rec IN
        SELECT *
        FROM my_column
        WHERE my_table = NEW.my_table
    LOOP
        INSERT INTO cell (id, my_row, my_column, value) VALUES (uuid_generate_v4(), NEW.id, rec.id, NULL);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS after_row_insertion ON my_row;
CREATE OR REPLACE TRIGGER after_row_insertion
AFTER INSERT ON my_row
FOR EACH ROW
EXECUTE FUNCTION create_cells_on_new_row_insertion();



CREATE OR REPLACE FUNCTION create_cells_on_new_column_insertion()
    RETURNS trigger AS
$$
DECLARE
    rec my_row%ROWTYPE;
BEGIN
    FOR rec IN
        SELECT *
        FROM my_row
        WHERE my_table = NEW.my_table
    LOOP
        INSERT INTO cell (id, my_row, my_column, value) VALUES (uuid_generate_v4(), rec.id, NEW.id, NULL);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS after_column_insertion ON my_column;
CREATE TRIGGER after_column_insertion
AFTER INSERT ON my_column
FOR EACH ROW
EXECUTE FUNCTION create_cells_on_new_column_insertion();
