-- NOTE: Sample shit, needs to be advanced after.
CREATE TABLE IF NOT EXISTS virtual_machines (
    id      INTEGER PRIMARY KEY NOT NULL,
    name    TEXT                NOT NULL,
    powered BOOLEAN             NOT NULL DEFAULT 0
);
