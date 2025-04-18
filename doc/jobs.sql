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
