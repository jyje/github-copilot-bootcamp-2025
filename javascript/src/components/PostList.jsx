import React from "react";
import PostCard from "./PostCard";

// 게시글 목록 (Material 스타일 카드)
const PostList = ({ posts = [] }) => {
  if (!posts.length) return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-400 mt-8">아직 게시글이 없습니다.</div>
  );
  return (
    <div className="flex flex-col gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
