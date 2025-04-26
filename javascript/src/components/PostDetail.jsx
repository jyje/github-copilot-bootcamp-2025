import React from "react";
import CommentSection from "./CommentSection";

// 게시글 상세 보기
const PostDetail = ({ post, comments = [], onLike, onComment }) => {
  if (!post) return null;
  return (
    <div className="max-w-xl mx-auto w-full p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{post.userName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-base text-gray-900 whitespace-pre-line">{post.content}</div>
        <div className="flex gap-4 text-sm text-gray-600 mt-2">
          <button className="hover:text-blue-500" onClick={onLike}>👍 {post.likeCount}</button>
          <span>💬 {post.commentCount}</span>
        </div>
      </div>
      <CommentSection comments={comments} onComment={onComment} />
    </div>
  );
};

export default PostDetail;
