// API 서비스 - 백엔드와의 통신을 담당

const API_URL = '/api';
const USE_REAL_API = true;

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`);
  if (!res.ok) throw new Error("포스트를 불러오는데 실패했습니다");
  return await res.json();
}

export async function getPost(id) {
  const res = await fetch(`${API_URL}/posts/${id}`);
  if (!res.ok) throw new Error("포스트를 불러오는데 실패했습니다");
  return await res.json();
}

export async function createPost(data) {
  console.log('[api.js] createPost fetch 시작', data);
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log('[api.js] fetch 응답', res);
  if (!res.ok) {
    const errText = await res.text();
    console.error('[api.js] fetch 실패', res.status, errText);
    throw new Error("포스트 작성에 실패했습니다");
  }
  return await res.json();
}

export async function updatePost(id, data) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("포스트 수정에 실패했습니다");
  return await res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${API_URL}/posts/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("포스트 삭제에 실패했습니다");
}