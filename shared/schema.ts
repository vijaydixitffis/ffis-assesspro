import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (profiles)
export const users = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("client"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Assessments table
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Topics table
export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  assessment_id: uuid("assessment_id").references(() => assessments.id),
  sequence_number: integer("sequence_number"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  type: text("type").notNull(), // 'multiple_choice', 'yes_no', 'free_text'
  topic_id: uuid("topic_id").references(() => topics.id),
  sequence_number: integer("sequence_number"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Answers table
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  is_correct: boolean("is_correct"),
  marks: text("marks"),
  comment: text("comment"),
  question_id: uuid("question_id").references(() => questions.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Assessment assignments table
export const assessmentAssignments = pgTable("assessment_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessment_id: uuid("assessment_id").references(() => assessments.id),
  user_id: uuid("user_id").references(() => users.id),
  status: text("status").default("ASSIGNED"),
  scope: text("scope").default(""),
  due_date: timestamp("due_date"),
  assigned_at: timestamp("assigned_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Topic assignments table
export const topicAssignments = pgTable("topic_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic_id: uuid("topic_id").references(() => topics.id),
  user_id: uuid("user_id").references(() => users.id),
  assessment_assignment_id: uuid("assessment_assignment_id").references(() => assessmentAssignments.id),
  status: text("status").default("ASSIGNED"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Assessment submissions table
export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessment_id: uuid("assessment_id").references(() => assessments.id),
  user_id: uuid("user_id").references(() => users.id),
  score: integer("score"),
  max_score: integer("max_score"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Submitted answers table
export const submittedAnswers = pgTable("submitted_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  submission_id: uuid("submission_id").references(() => assessmentSubmissions.id),
  question_id: uuid("question_id").references(() => questions.id),
  answer_id: uuid("answer_id").references(() => answers.id),
  text_answer: text("text_answer"),
  is_correct: boolean("is_correct"),
  marks: integer("marks"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  first_name: true,
  last_name: true,
  password_hash: true,
  role: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  title: true,
  description: true,
  is_active: true,
  created_by: true,
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  title: true,
  description: true,
  assessment_id: true,
  sequence_number: true,
  is_active: true,
  created_by: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  question: true,
  type: true,
  topic_id: true,
  sequence_number: true,
  is_active: true,
  created_by: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  text: true,
  is_correct: true,
  marks: true,
  comment: true,
  question_id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type AssessmentAssignment = typeof assessmentAssignments.$inferSelect;
export type TopicAssignment = typeof topicAssignments.$inferSelect;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;
export type SubmittedAnswer = typeof submittedAnswers.$inferSelect;
