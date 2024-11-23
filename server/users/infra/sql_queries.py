CREATE_NEW_USER = """--sql
INSERT INTO users(login, password, isAdmin, sshKey) VALUES(?, ?, 0, ?) 
"""

GET_USER_BY_ID = """--sql
SELECT id, login, isAdmin, sshKey FROM users WHERE id = ?
"""

GET_USER_BY_LOGIN = """--sql
SELECT id, login, password, isAdmin FROM users WHERE login = ?

"""