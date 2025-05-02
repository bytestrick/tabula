#!/bin/sh

# Handy script to drop all tables, routines and sequences and reapply the schema

. ../../backend/src/main/resources/.env

export PGPASSWORD="$DATASOURCE_PASSWORD"
psql -U "$DATASOURCE_USERNAME" -d tabula -f drop_all.plsql
psql -U "$DATASOURCE_USERNAME" -d tabula -f schema.sql
