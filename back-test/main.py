from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from jwt.exceptions import ExpiredSignatureError
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT配置
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class LoginRequest(BaseModel):
    userName: str
    password: str

class Token(BaseModel):
    token: str
    refreshToken: str

class UserInfo(BaseModel):
    userId: str
    userName: str
    roles: List[str]
    buttons: List[str]

# OAuth2密码流
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

# 用户数据（示例）
USERS = {
    "Super": {
          "userName": "Super",
          "password": "123456",
          "userId": "2",
          "roles": ["super"],
          "buttons": ["btn.add", "btn.edit", "btn.delete"]
      },
    "Admin": {
        "userName": "Admin",
        "password": "123456",
        "userId": "1",
        "roles": ["admin"],
        "buttons": ["btn.add", "btn.edit", "btn.delete"]
    },
  "User": {
          "userName": "User",
          "password": "123456",
          "userId": "1",
          "roles": ["user"],
          "buttons": ["btn.add", "btn.edit", "btn.delete"]
      }
}

def create_token(data: dict, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_tokens(username: str) -> Token:
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_token(
        data={"sub": username, "type": "access"},
        expires_delta=access_token_expires
    )
    refresh_token = create_token(
        data={"sub": username, "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    return Token(token=access_token, refreshToken=refresh_token)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username or payload.get("type") != "access":
            return None
        user = USERS.get(username)
        if not user:
            return None
        return user
    except (ExpiredSignatureError, jwt.JWTError):
        return None

@app.post("/auth/login")
async def login(request: Request):
    logger.info("Received login request")
    try:
        # 读取原始请求体
        body = await request.body()
        logger.info(f"Raw request body: {body}")

        # 解析JSON数据
        json_data = await request.json()
        logger.info(f"Parsed JSON data: {json_data}")

        # 验证请求数据
        if not isinstance(json_data, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request format"
            )

        userName = json_data.get("userName")
        password = json_data.get("password")

        if not userName or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing username or password"
            )

        logger.info(f"Attempting login for user: {userName}")

        # 验证用户
        user = USERS.get(userName)
        if not user or password != user["password"]:
            logger.warning(f"Login failed for user: {userName}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        # 生成令牌
        tokens = create_tokens(userName)
        logger.info(f"Login successful for user: {userName}")

        # 返回响应
        return JSONResponse(
            content={"token": tokens.token, "refreshToken": tokens.refreshToken}
        )

    except HTTPException as he:
        logger.error(f"HTTP Exception during login: {str(he)}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/auth/refreshToken")
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌"
            )
        return create_tokens(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )

@app.get("/auth/getUserInfo")
async def get_user_info(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未授权"
        )
    return UserInfo(
        userId=current_user["userId"],
        userName=current_user["userName"],
        roles=current_user["roles"],
        buttons=current_user["buttons"]
    )

@app.get("/auth/error")
async def custom_error(code: str, msg: str):
    raise HTTPException(
        status_code=int(code),
        detail=msg
    )

@app.get("/")
async def root():
    logger.info("Test endpoint called")
    return {"message": "Hello World"}
