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
