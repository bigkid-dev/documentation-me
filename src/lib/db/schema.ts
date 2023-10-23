

import {
    pgTable, 
    serial, 
    text, 
    timestamp, 
    varchar,
    integer,
    pgEnum   
} from 'drizzle-orm/pg-core'

export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']) 


export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfURl: text("pdf_url").notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userID: varchar("user_id", {length:250}).notNull(),
    fileKey: text('file_key').notNull(),

})

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(()=>chats.id). notNull(),
    pdfURl: text("pdf_url").notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    role: userSystemEnum('role').notNull()

})