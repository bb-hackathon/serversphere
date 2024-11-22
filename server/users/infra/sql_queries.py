CREATE_NEW_USER = """--sql
INSERT INTO users(login, password, isAdmin) VALUES(?, ?, ?) 
"""

GET_USER_BY_ID = """--sql
SELECT id, login, isAdmin FROM users WHERE id = ?
"""

GET_USER_BY_LOGIN = """--sql
SELECT id, login, password, isAdmin FROM users WHERE login = ?

"""