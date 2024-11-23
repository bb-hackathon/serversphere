CREATE_TABLE_USERS="""--sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL,
    sshKey TEXT NOT NULL
    
)
"""

CREATE_TABLE_DESKTOPS = """--sql
CREATE TABLE IF NOT EXISTS desktops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    ip TEXT NOT NULL,
    port INTEGER NOT NULL
)


"""

INIT_ADMIN = """--sql
INSERT INTO users(login, password, isAdmin, sshKey) VALUES(?,?,?,?)
"""