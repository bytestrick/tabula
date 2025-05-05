DO $$ DECLARE
    r RECORD;
BEGIN
    -- Drop Tables
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop Sequences
    FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
    END LOOP;

    -- Drop Functions
    FOR r IN SELECT proname, pg_catalog.pg_get_function_arguments(oid) as args
             FROM pg_proc
             WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
               AND proname <> 'plpgsql_call_handler'
               AND proname <> 'plpgsql_validator'
               AND proname <> 'plpgsql_inline_handler'
               AND prokind = 'f'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;

    -- Drop Procedures
    FOR r IN SELECT proname, pg_catalog.pg_get_function_arguments(oid) as args
             FROM pg_proc
             WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
               AND prokind = 'p'
    LOOP
        EXECUTE 'DROP PROCEDURE IF EXISTS ' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;

    RAISE NOTICE 'All tables, sequences, and routines in the public schema have been dropped (if they existed).';

END $$;
