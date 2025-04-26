import React from "react";

// 게시글 카드 (Material 스타일)
const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 hover:shadow-2xl transition border border-gray-100">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="font-semibold text-blue-700">{post.userName}</span>
        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <div className="text-base text-gray-900 whitespace-pre-line mb-2">{post.content}</div>
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <button className="flex items-center gap-1 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9l-3 3m0 0l-3-3m3 3V4m0 6a9 9 0 11-6.219 15.219" /></svg>
          <span>{post.likeCount}</span>
        </button>
        <span className="flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2" /></svg>
          {post.commentCount}
        </span>
      </div>
    </div>
  );
};

export default PostCard;
