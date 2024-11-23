CREATE_NEW_DESKTOP = """--sql
INSERT INTO desktops(name, ip, port, type) VALUES(?,?,?,?)

"""

GET_DESKTOPS = """--sql
SELECT id, name, ip, port, type FROM desktops

"""

GET_DESKTOP_BY_NAME = """--sql
SELECT id, name, ip, port, type FROM desktops WHERE name = ?
"""

SET_RESERVATION = """--sql
INSERT INTO reservations(reservedFrom, reservedUntil, reservedBy, reservedDesktop) VALUES(?,?,?,?)
"""


GET_RESERVATIONS = """--sql
SELECT id, reservedFrom, reservedBy, reservedDesktop, reservedUntil FROM reservations

"""

GET_RESERVATIONS_ON_DESKTOP = """--sql
SELECT id, reservedFrom, reservedBy, reservedDesktop, reservedUntil FROM reservations WHERE reservedDesktop = ?


"""

DELETE_RESERVATION = """--sql
DELETE FROM reservations WHERE id = ?
"""

DELETE_RESERVATION = """--sql
DELETE FROM desktops WHERE name = ?
"""