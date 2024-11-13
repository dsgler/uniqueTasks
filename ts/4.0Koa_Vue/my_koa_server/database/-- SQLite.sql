-- SQLite
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(63) NOT NULL UNIQUE,
    email VARCHAR(63) NOT NULL,
    passwd CHAR(64) NOT NULL,
    salt INT NOT NULL
);
CREATE INDEX idx_username ON users(username);

SELECT * FROM users;

INSERT INTO users VALUES (NULL,"111","22@qq.com","123",111222333);

DROP TABLE users;

PRAGMA index_list('users');

PRAGMA table_info('users');

PRAGMA index_list('users');