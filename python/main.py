from fastapi import FastAPI, HTTPException, Path, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Set
from datetime import datetime
import sqlite3
from contextlib import contextmanager
import os

app = FastAPI(title="Simple SNS API")

DB_PATH = os.path.join(os.path.dirname(__file__), "sns.db")

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userName TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                postId INTEGER NOT NULL,
                userName TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS likes (
                postId INTEGER NOT NULL,
                userName TEXT NOT NULL,
                PRIMARY KEY(postId, userName),
                FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
            )
        ''')
        conn.commit()

@app.on_event("startup")
def on_startup():
    init_db()

# -------------------
# Pydantic Models
# -------------------
class Post(BaseModel):
    id: int
    userName: str
    content: str
    createdAt: datetime
    updatedAt: datetime
    likeCount: int
    commentCount: int

class CreatePostRequest(BaseModel):
    userName: str = Field(..., example="alice")
    content: str = Field(..., example="Hello, this is my first post!")

class UpdatePostRequest(BaseModel):
    content: str = Field(..., example="Updated content of the post")

class Comment(BaseModel):
    id: int
    postId: int
    userName: str
    content: str
    createdAt: datetime
    updatedAt: datetime

class CreateCommentRequest(BaseModel):
    userName: str = Field(..., example="bob")
    content: str = Field(..., example="Nice post!")

class UpdateCommentRequest(BaseModel):
    content: str = Field(..., example="Updated comment.")

class LikeRequest(BaseModel):
    userName: str = Field(..., example="charlie")

class ErrorResponse(BaseModel):
    message: str

# -------------------
# DB Util Functions
# -------------------
def post_row_to_model(row) -> Post:
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM likes WHERE postId=?", (row["id"],))
        like_count = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM comments WHERE postId=?", (row["id"],))
        comment_count = c.fetchone()[0]
    return Post(
        id=row["id"],
        userName=row["userName"],
        content=row["content"],
        createdAt=datetime.fromisoformat(row["createdAt"]),
        updatedAt=datetime.fromisoformat(row["updatedAt"]),
        likeCount=like_count,
        commentCount=comment_count,
    )

def comment_row_to_model(row) -> Comment:
    return Comment(
        id=row["id"],
        postId=row["postId"],
        userName=row["userName"],
        content=row["content"],
        createdAt=datetime.fromisoformat(row["createdAt"]),
        updatedAt=datetime.fromisoformat(row["updatedAt"]),
    )

def get_post_or_404_db(post_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM posts WHERE id=?", (post_id,))
        row = c.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
        return row

def get_comment_or_404_db(post_id: int, comment_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM comments WHERE id=? AND postId=?", (comment_id, post_id))
        row = c.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
        return row

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 204:
        return JSONResponse(status_code=204, content=None)
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})

# -------------------
# Posts Endpoints (DB)
# -------------------
@app.get("/api/posts", response_model=List[Post])
def get_posts():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM posts ORDER BY id DESC")
        rows = c.fetchall()
        return [post_row_to_model(row) for row in rows]

@app.post("/api/posts", response_model=Post, status_code=201)
def create_post(req: CreatePostRequest):
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO posts (userName, content, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
            (req.userName, req.content, now, now)
        )
        post_id = c.lastrowid
        conn.commit()
        c.execute("SELECT * FROM posts WHERE id=?", (post_id,))
        row = c.fetchone()
        return post_row_to_model(row)

@app.get("/api/posts/{postId}", response_model=Post)
def get_post(postId: int = Path(..., description="조회하려는 포스트의 ID")):
    row = get_post_or_404_db(postId)
    return post_row_to_model(row)

@app.patch("/api/posts/{postId}", response_model=Post)
def update_post(req: UpdatePostRequest, postId: int = Path(..., description="수정하려는 포스트의 ID")):
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE posts SET content=?, updatedAt=? WHERE id=?", (req.content, now, postId))
        if c.rowcount == 0:
            raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
        conn.commit()
        c.execute("SELECT * FROM posts WHERE id=?", (postId,))
        row = c.fetchone()
        return post_row_to_model(row)

@app.delete("/api/posts/{postId}", status_code=204)
def delete_post(postId: int = Path(..., description="삭제하려는 포스트의 ID")):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM posts WHERE id=?", (postId,))
        if c.rowcount == 0:
            raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
        conn.commit()
    return

# -------------------
# Comments Endpoints (DB)
# -------------------
@app.get("/api/posts/{postId}/comments", response_model=List[Comment])
def get_comments(postId: int = Path(..., description="댓글을 조회할 대상 포스트 ID")):
    get_post_or_404_db(postId)
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM comments WHERE postId=? ORDER BY id ASC", (postId,))
        rows = c.fetchall()
        return [comment_row_to_model(row) for row in rows]

@app.post("/api/posts/{postId}/comments", response_model=Comment, status_code=201)
def create_comment(req: CreateCommentRequest, postId: int = Path(..., description="댓글을 작성할 대상 포스트 ID")):
    get_post_or_404_db(postId)
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO comments (postId, userName, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
            (postId, req.userName, req.content, now, now)
        )
        comment_id = c.lastrowid
        conn.commit()
        c.execute("SELECT * FROM comments WHERE id=?", (comment_id,))
        row = c.fetchone()
        return comment_row_to_model(row)

@app.get("/api/posts/{postId}/comments/{commentId}", response_model=Comment)
def get_comment(postId: int, commentId: int):
    row = get_comment_or_404_db(postId, commentId)
    return comment_row_to_model(row)

@app.patch("/api/posts/{postId}/comments/{commentId}", response_model=Comment)
def update_comment(req: UpdateCommentRequest, postId: int, commentId: int):
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE comments SET content=?, updatedAt=? WHERE id=? AND postId=?", (req.content, now, commentId, postId))
        if c.rowcount == 0:
            raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
        conn.commit()
        c.execute("SELECT * FROM comments WHERE id=?", (commentId,))
        row = c.fetchone()
        return comment_row_to_model(row)

@app.delete("/api/posts/{postId}/comments/{commentId}", status_code=204)
def delete_comment(postId: int, commentId: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM comments WHERE id=? AND postId=?", (commentId, postId))
        if c.rowcount == 0:
            raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
        conn.commit()
    return

# -------------------
# Likes Endpoints (DB)
# -------------------
@app.post("/api/posts/{postId}/likes", status_code=201)
def like_post(req: LikeRequest, postId: int):
    get_post_or_404_db(postId)
    with get_db() as conn:
        c = conn.cursor()
        try:
            c.execute("INSERT INTO likes (postId, userName) VALUES (?, ?)", (postId, req.userName))
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="이미 좋아요를 눌렀습니다.")
    return

@app.delete("/api/posts/{postId}/likes", status_code=204)
def unlike_post(postId: int, userName: Optional[str] = None):
    if not userName:
        raise HTTPException(status_code=400, detail="userName 쿼리 파라미터가 필요합니다.")
    get_post_or_404_db(postId)
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM likes WHERE postId=? AND userName=?", (postId, userName))
        if c.rowcount == 0:
            raise HTTPException(status_code=400, detail="좋아요를 누르지 않았습니다.")
        conn.commit()
    return
