import React, { useState } from "react";

// Material 스타일 새 게시글 작성 폼
const NewPostForm = ({ onCreate, onClose }) => {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !content.trim()) return;
    onCreate && onCreate({ userName, content });
    setUserName("");
    setContent("");
    if (onClose) onClose();
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
        placeholder="작성자 이름"
        value={userName}
        onChange={e => setUserName(e.target.value)}
        required
      />
      <textarea
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
        placeholder="내용을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={4}
      />
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition flex-1 font-semibold shadow">
          게시
        </button>
        {onClose && (
          <button type="button" className="bg-gray-200 text-gray-700 rounded-lg p-3 flex-1 font-semibold" onClick={onClose}>
            닫기
          </button>
        )}
      </div>
    </form>
  );
};

export default NewPostForm;
