import { db } from '@/db';
import { comments, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
 
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }
  const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const postComments = await db.select().from(comments).where(eq(comments.postId, postId));
  return NextResponse.json({ post, comments: postComments });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  const { title, content } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const updatedPost = await db
    .update(posts)
    .set({ title: title.trim(), content: content.trim() })
    .where(eq(posts.id, postId))
    .returning();

  if (updatedPost.length === 0) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(updatedPost[0]);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }
  const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
  }

  const newComment = await db.insert(comments).values({ postId, content }).returning();
  return NextResponse.json(newComment[0], { status: 201 });
}
 
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
 
  await db.delete(posts).where(eq(posts.id, Number(id)));
 
  return new NextResponse(null, { status: 204 });
}
