from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.requests import Request
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
import requests

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_IDENTIFIER = os.getenv("AUTH0_AUDIENCE")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_token(request: Request):
    try:
        token = request.headers.get("Authorization")
        if token is None or not token.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header (No token/bearer)",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token
    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authorization header ({e})",
                headers={"WWW-Authenticate": "Bearer"},
            )

def get_jwks():
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url)
        return response.json()
    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unable to retrieve keystore ({e})",
                headers={"WWW-Authenticate": "Bearer"},
            )

def validate_token(token: str = Depends(oauth2_scheme)):
    jwks = get_jwks()
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token ({e})",
                headers={"WWW-Authenticate": "Bearer"},
            )
    rsa_key = {}

    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }

    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=API_IDENTIFIER,
                issuer=f"https://{AUTH0_DOMAIN}/",
            )
            return payload
        except jwt.ExpiredSignatureError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token Expired ({e})",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTClaimsError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid claims ({e})",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Uncaught Exception: " + e,
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid key pair",
                headers={"WWW-Authenticate": "Bearer"},
            )

