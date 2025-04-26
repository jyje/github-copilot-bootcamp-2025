from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

app = FastAPI()

# Pydantic Models
class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: str
    likes: int
    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: str
    post_id: str
    class Config:
        orm_mode = True

# In-memory storage
posts = {}
comments = {}
likes = {}

# Post Endpoints
@app.post("/posts", response_model=Post, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate):
    post_id = str(uuid4())
    posts[post_id] = {"id": post_id, "title": post.title, "content": post.content, "likes": 0}
    return posts[post_id]

@app.get("/posts", response_model=List[Post])
def list_posts():
    return list(posts.values())

@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: str):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    return posts[post_id]

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: str):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    # Delete related comments and likes
    to_delete = [cid for cid, c in comments.items() if c["post_id"] == post_id]
    for cid in to_delete:
        del comments[cid]
    likes.pop(post_id, None)
    del posts[post_id]
    return

# Comment Endpoints
@app.post("/posts/{post_id}/comments", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment(post_id: str, comment: CommentCreate):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    comment_id = str(uuid4())
    comments[comment_id] = {"id": comment_id, "post_id": post_id, "content": comment.content}
    return comments[comment_id]

@app.get("/posts/{post_id}/comments", response_model=List[Comment])
def list_comments(post_id: str):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    return [c for c in comments.values() if c["post_id"] == post_id]

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str):
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    del comments[comment_id]
    return

# Like Endpoints
@app.post("/posts/{post_id}/like", status_code=status.HTTP_200_OK)
def like_post(post_id: str):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    posts[post_id]["likes"] += 1
    return {"likes": posts[post_id]["likes"]}

@app.post("/posts/{post_id}/unlike", status_code=status.HTTP_200_OK)
def unlike_post(post_id: str):
    if post_id not in posts:
        raise HTTPException(status_code=404, detail="Post not found")
    if posts[post_id]["likes"] > 0:
        posts[post_id]["likes"] -= 1
    return {"likes": posts[post_id]["likes"]}
