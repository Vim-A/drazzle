import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('postId').notNull().references(() => posts.id),
  content: text('content').notNull(),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});
