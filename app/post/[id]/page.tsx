import { Suspense } from 'react';
import PostDetailClient from './PostDetailClient';

export const instant = false;

export default function PostDetailPage() {
  return (
    <Suspense fallback={<p className="container mt-4">Loading...</p>}>
      <PostDetailClient />
    </Suspense>
  );
}
