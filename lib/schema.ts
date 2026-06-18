import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const dogs = pgTable('dogs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  breed: text('breed').notNull().default('Vira-lata'),
  age: text('age').notNull(),
  weight: text('weight'),
  description: text('description').notNull().default(''),
  observations: text('observations'),
  imageUrl: text('image_url').notNull().default(''),
  color: text('color').notNull().default('#F97316'),
  images: text('images').array().default([]),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Dog = typeof dogs.$inferSelect
export type NewDog = typeof dogs.$inferInsert

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  content: text('content').notNull().default(''),
  coverImageUrl: text('cover_image_url').notNull().default(''),
  published: boolean('published').notNull().default(true),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type News = typeof news.$inferSelect
export type NewNews = typeof news.$inferInsert