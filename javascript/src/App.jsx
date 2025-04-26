import React, { useState, useEffect } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import NewPostForm from './components/NewPostForm';
import { getPosts, deletePost, createPost } from './services/api';
import './App.css';
import { UserCircleIcon, BellIcon, MenuIcon } from '@heroicons/react/outline';

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError('포스트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) return;
    try {
      await deletePost(postId);
      await fetchPosts();
    } catch (err) {
      alert('포스트 삭제에 실패했습니다.');
    }
  };

  const handleCreate = async (postData) => {
    console.log('[App] handleCreate 호출', postData);
    try {
      await createPost(postData);
      console.log('[App] 게시글 작성 성공');
      await fetchPosts();
    } catch (e) {
      console.error('[App] 게시글 작성 실패:', e);
      alert("게시글 작성 실패: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* AppBar */}
      <header className="bg-white shadow flex items-center justify-between px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <MenuIcon className="h-7 w-7 text-blue-600" />
          <span className="text-2xl font-bold text-blue-700 tracking-tight">SNS Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <BellIcon className="h-6 w-6 text-gray-500 hover:text-blue-600" />
            {/* 알림 뱃지 샘플 */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
          </button>
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        </div>
      </header>
      <div className="flex-1 flex flex-row w-full max-w-screen-2xl mx-auto">
        {/* Drawer(좌측 메뉴) */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r shadow-sm py-6 px-4 gap-4 min-h-[calc(100vh-56px)]">
          <nav className="flex flex-col gap-2">
            <button className="text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-semibold">피드</button>
            <button className="text-left px-3 py-2 rounded-lg hover:bg-blue-50">내 글</button>
            <button className="text-left px-3 py-2 rounded-lg hover:bg-blue-50">알림</button>
            <button className="text-left px-3 py-2 rounded-lg hover:bg-blue-50">설정</button>
          </nav>
          <div className="mt-auto text-xs text-gray-400">© 2025 SNS App</div>
        </aside>
        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col md:px-8 px-2 py-8 gap-6 bg-white min-h-[calc(100vh-56px)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">피드</h1>
            <button
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center gap-2 font-semibold"
              onClick={() => setShowModal(true)}
            >
              <span>새 게시물</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl text-gray-900 relative">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-xl font-bold mb-4">새 게시글 작성</h2>
                <NewPostForm onCreate={handleCreate} onClose={() => setShowModal(false)} />
              </div>
            </div>
          )}
          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            userName={userName}
            onPostClick={setSelectedPostId}
            onDeletePost={handleDeletePost}
          />
          {selectedPostId && (
            <PostDetail
              postId={selectedPostId}
              userName={userName}
              onClose={() => setSelectedPostId(null)}
              onDeleteSuccess={fetchPosts}
            />
          )}
        </main>
        {/* 우측 위젯/트렌드 */}
        <aside className="hidden lg:flex flex-col w-72 bg-gray-50 border-l shadow-sm py-6 px-4 gap-6 min-h-[calc(100vh-56px)]">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">트렌드</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>#캠핑</li>
              <li>#등산</li>
              <li>#트레킹</li>
              <li>#아웃도어</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">추천 유저</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>alice</li>
              <li>mountain_lover</li>
              <li>hiker_girl</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">공지</h3>
            <div className="bg-blue-50 text-blue-800 rounded-lg p-3 text-xs">SNS 서비스가 5월 1일 점검 예정입니다.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
