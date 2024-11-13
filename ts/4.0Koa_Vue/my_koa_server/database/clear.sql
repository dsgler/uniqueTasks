DELETE FROM users;
DELETE FROM sqlite_sequence WHERE name = 'users';
VACUUM;