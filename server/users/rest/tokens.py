from fastapi import Request, Response
import jwt

def tokenize(_id: int):
    cookie = jwt.encode({"id": str(_id)}, "secret_key",algorithm="HS256")
    print(cookie)
    return cookie

def detokenize(cookie: str) -> int:
    res = jwt.decode(cookie.encode(), key = "secret_key", algorithms=["HS256"])
    res = res.get('id')
    try:
        res = int(res)
    except:
        res = None
    return res

    
    