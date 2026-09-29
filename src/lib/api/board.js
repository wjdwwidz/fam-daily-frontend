import { request } from './client.js'

// 가족 게시판 — 글은 가족 범위, 댓글은 글 범위.
// 댓글 주소가 일상 댓글(/comments/:id)과 겹치지 않게 /post-comments 를 쓴다.
export const boardApi = {
  posts: (groupId, limit = 30) =>
    request(`/groups/${groupId}/posts?limit=${limit}`),
  post: (postId) => request(`/posts/${postId}`),
  createPost: (groupId, text) =>
    request(`/groups/${groupId}/posts`, { method: 'POST', body: { text } }),
  updatePost: (postId, text) =>
    request(`/posts/${postId}`, { method: 'PATCH', body: { text } }),
  deletePost: (postId) => request(`/posts/${postId}`, { method: 'DELETE' }),
  // 글을 쓰는 동안 링크 카드 미리보기 (저장할 때는 서버가 다시 읽어 글에 붙인다)
  linkPreview: (url) => request(`/link-preview?url=${encodeURIComponent(url)}`),

  postComments: (postId) => request(`/posts/${postId}/comments`),
  addPostComment: (postId, text, parentId) =>
    request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: { text, ...(parentId ? { parentId } : {}) },
    }),
  editPostComment: (commentId, text) =>
    request(`/post-comments/${commentId}`, { method: 'PATCH', body: { text } }),
  deletePostComment: (commentId) =>
    request(`/post-comments/${commentId}`, { method: 'DELETE' }),
}
