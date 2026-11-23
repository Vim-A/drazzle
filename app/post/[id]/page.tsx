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
 
export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
 
  const loadPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}`);
    if (res.status === 404) {
      router.push('/not-found');
      return;
    }

    const data = await res.json();
    setPost(data.post);
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
 
  const handleDelete = async () => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.push('/');
  };
 
  if (!post) return <p className="container mt-4">Loading...</p>;
 
  return (
    <main className="container mt-4">
      <h1>{post.title}</h1>
      <p className="text-muted">{new Date(post.createdAt).toLocaleDateString('id-ID')}</p>
      <p>{post.content}</p>
      <button onClick={handleDelete} className="btn btn-danger">
        Delete
      </button>

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
