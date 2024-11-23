CREATE_NEW_DESKTOP = """--sql
INSERT INTO desktops(name, ip, port, type) VALUES(?,?,?,?)

"""

GET_DESKTOPS = """--sql
SELECT id, name, ip, port, type FROM desktops

"""