CREATE_NEW_DESKTOP = """--sql
INSERT INTO desktops(name, ip, port, type) VALUES(?,?,?,?)

"""

GET_DESKTOPS = """--sql
SELECT id, name, ip, port, type, isAlive FROM desktops

"""

GET_DESKTOP_BY_NAME = """--sql
SELECT id, name, ip, port, type, isAlive FROM desktops WHERE name = ?
"""

GET_DESKTOP_BY_ID = """--sql
SELECT id, name, ip, port, type, isAlive FROM desktops WHERE id = ?
"""

SET_RESERVATION = """--sql
INSERT INTO reservations(reservedFrom, reservedUntil, reservedBy, reservedDesktop) VALUES(?,?,?,?)
"""


GET_RESERVATIONS = """--sql
SELECT id, reservedFrom, reservedBy, reservedDesktop, reservedUntil, started FROM reservations

"""

GET_RESERVATIONS_ON_DESKTOP = """--sql
SELECT id, reservedFrom, reservedBy, reservedDesktop, reservedUntil, started FROM reservations WHERE reservedDesktop = ?


"""
GET_RESERVATIONS_ON_DESKTOP = """--sql
SELECT id, reservedFrom, reservedBy, reservedDesktop, reservedUntil, started, (SELECT login FROM users WHERE users.id = reservedBy) as login FROM reservations WHERE reservedDesktop = ?


"""

DELETE_RESERVATION = """--sql
DELETE FROM reservations WHERE id = ?
"""

DELETE_DESKTOP = """--sql
DELETE FROM desktops WHERE name = ?
"""

UPDATE_STATUS = """--sql
UPDATE desktops SET isAlive = ? WHERE id = ?
"""


START_RESERVATION = """--sql
UPDATE reservation SET strarted = 1 WHERE id = ?
"""
