'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Post = {
  title: string;
  content: string;
  createdAt: string;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
};

export default function PostDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [error, setError] = useState('');

  const loadPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}`);
    if (res.status === 404) {
      router.push('/not-found');
      return;
    }

    const data = await res.json();
    setPost(data.post);
    setTitle(data.post.title);
    setPostContent(data.post.content);
    setComments(data.comments);
  }, [id, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPost();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPost]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const res = await fetch(`/api/posts/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to add comment');
      return;
    }

    setContent('');
    await loadPost();
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: postContent }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to update post');
      return;
    }

    setEditing(false);
    await loadPost();
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/');
  };

  if (!post) return <p className="container mt-4">Loading...</p>;

  return (
    <main className="container mt-4">
      {editing ? (
        <form onSubmit={handleUpdate}>
          <h1>Edit Post</h1>
          <label htmlFor="title" className="form-label">Title</label>
          <input id="title" className="form-control mb-3" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <label htmlFor="post-content" className="form-label">Content</label>
          <textarea id="post-content" className="form-control mb-3" rows={6} value={postContent} onChange={(event) => setPostContent(event.target.value)} required />
          <button className="btn btn-primary me-2">Save changes</button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
        </form>
      ) : (
        <>
          <h1>{post.title}</h1>
          <p className="text-muted">{new Date(post.createdAt).toLocaleDateString('id-ID')}</p>
          <p>{post.content}</p>
          <button onClick={() => setEditing(true)} className="btn btn-warning me-2">Edit</button>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </>
      )}
      {error && <p className="text-danger mt-3">{error}</p>}

      <section className="mt-4">
        <h2>Comments</h2>
        {comments.length === 0 ? <p>No comments yet.</p> : comments.map((comment) => (
          <p key={comment.id}>{comment.content}</p>
        ))}

        <form onSubmit={handleSubmit} className="mt-3">
          <label htmlFor="comment" className="form-label">Add comment</label>
          <textarea
            id="comment"
            className="form-control"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-primary mt-2">Post comment</button>
        </form>
      </section>
    </main>
  );
}
