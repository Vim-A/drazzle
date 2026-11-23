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
  const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const postComments = await db.select().from(comments).where(eq(comments.postId, postId));
  return NextResponse.json({ post, comments: postComments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
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
