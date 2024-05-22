BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 0032d6aafea4

CREATE TABLE "user" (
    name VARCHAR, 
    email VARCHAR NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    UNIQUE (email)
);

INSERT INTO alembic_version (version_num) VALUES ('0032d6aafea4') RETURNING alembic_version.version_num;

-- Running upgrade 0032d6aafea4 -> 590d9e558d1d

CREATE TABLE organisation (
    name VARCHAR NOT NULL, 
    slug VARCHAR NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    UNIQUE (slug)
);

UPDATE alembic_version SET version_num='590d9e558d1d' WHERE alembic_version.version_num = '0032d6aafea4';

COMMIT;

