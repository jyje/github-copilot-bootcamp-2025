import React from "react";

// 댓글 목록 및 작성 폼
const CommentSection = ({ comments = [], onComment }) => {
  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold mb-2">댓글</h3>
      <form className="flex flex-col gap-2 mb-4" onSubmit={e => { e.preventDefault(); onComment && onComment(); }}>
        <input className="border rounded p-2" placeholder="작성자 이름" required />
        <textarea className="border rounded p-2" placeholder="댓글을 입력하세요" required rows={2} />
        <button type="submit" className="bg-blue-100 text-blue-700 rounded p-2 hover:bg-blue-200 transition">댓글 작성</button>
      </form>
      <div className="flex flex-col gap-2">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white rounded shadow p-2 text-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="font-semibold text-gray-800">{comment.userName}</span>
              <span>·</span>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-gray-900 whitespace-pre-line">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
