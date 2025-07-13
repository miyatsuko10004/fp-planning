-- uuid-ossp extensionを有効にする
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- families テーブル (スキーマの定義が必要です)
-- CREATE TABLE families (
--   ...
-- );

-- family_members テーブル (スキーマの定義が必要です)
-- CREATE TABLE family_members (
--   ...
-- );

-- transactions テーブル
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    date TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'income' or 'expense'
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    category_id UUID, -- categoriesテーブルへの外部キー (NULLを許容)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- categories テーブル (スキーマの定義が必要です)
-- CREATE TABLE categories (
--   ...
-- );

-- goals テーブル (スキーマの定義が必要です)
-- CREATE TABLE goals (
--   ...
-- );
