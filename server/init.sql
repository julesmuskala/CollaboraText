CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TYPE "access_level" AS ENUM ('ONLY_OWNER', 'READONLY', 'ANYONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "user" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "uid" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    UNIQUE("uid", "email") 
);

CREATE TABLE "document" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL DEFAULT 'Untitled document',
    "creator_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "access_level" "access_level" NOT NULL DEFAULT 'ONLY_OWNER',
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER "update_modified_time" BEFORE UPDATE ON "document" FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
