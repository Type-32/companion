import {integer, sqliteTable, text, relations, boolean} from "@type32/tauri-sqlite-orm";
import type {UIMessage} from "ai";

export const characters = sqliteTable('characters', {
    id: text('id').unique().primaryKey().default(crypto.randomUUID()).$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    data: text('data', { mode: "json" }).$type<CharacterData>(),
    createdAt: integer('createdAt', { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const conversations = sqliteTable('conversations', {
    id: text('id').unique().primaryKey().default(crypto.randomUUID()).$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    createdAt: integer('createdAt', { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const charactersConversations = sqliteTable('characters_conversations', {
    characterId: text('character_id').notNull().references(characters, characters._.columns.id),
    conversationId: text('conversation_id').notNull().references(conversations, conversations._.columns.id)
})

export const messages = sqliteTable('messages', {
    id: integer('id').unique().primaryKey().autoincrement(),
    text: text('text').notNull(),
    conversationId: text('conversationId'),
    senderId: text('senderId'),
    createdAt: integer('createdAt', { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const aiMessages = sqliteTable('aiMessages', {
    id: integer('id').unique().primaryKey().autoincrement(),
    data: text('data', {mode: 'json'}).notNull().$type<UIMessage>(),
    conversationId: text('conversationId').notNull(),
    createdAt: integer('createdAt', { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const files = sqliteTable('files', {
    id: text('id').unique().primaryKey().default(crypto.randomUUID()).$defaultFn(() => crypto.randomUUID()),
    isFolder: boolean('isFolder').default(false).notNull(),
    absolutePath: text('absolutePath').unique(),
    messageId: integer('messageId'),
    conversationId: text('conversationId'),
    createdAt: integer('createdAt', { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// relations

export const charactersRelations = relations(characters, ({manyToMany}) => ({
    conversations: manyToMany(conversations, {
        junctionTable: charactersConversations,
        junctionFields: [charactersConversations._.columns.characterId],
        junctionReferences: [charactersConversations._.columns.conversationId]
    })
}))

export const conversationsRelations = relations(conversations, ({manyToMany, many}) => ({
    characters: manyToMany(characters, {
        junctionTable: charactersConversations,
        junctionFields: [charactersConversations._.columns.conversationId],
        junctionReferences: [charactersConversations._.columns.characterId]
    }),
    attachments: many(files),      // ✅ Now files is defined
    aiMessages: many(aiMessages),  // ✅ Now aiMessages is defined
    messages: many(messages)       // ✅ Now messages is defined
}))

export const messagesRelations = relations(messages, ({one, many}) => ({
    conversation: one(conversations, {
        fields: [messages._.columns.conversationId],
        references: [conversations._.columns.id]
    }),
    sender: one(characters, {
        fields: [messages._.columns.senderId],
        references: [characters._.columns.id]
    }),
    attachments: many(files)
}))

export const aiMessagesRelations = relations(aiMessages, ({one}) => ({
    conversation: one(conversations, {
        fields: [aiMessages._.columns.conversationId],
        references: [conversations._.columns.id]
    })
}))

export const filesRelations = relations(files, ({one}) => ({
    message: one(messages, {
        fields: [files._.columns.messageId],
        references: [messages._.columns.id]
    }),
    conversation: one(conversations, {
        fields: [files._.columns.conversationId],
        references: [conversations._.columns.id]
    })
}))