import { pgTable, text, uuid, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users/Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  role: text("role").notNull(),
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
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Topics table
export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  assessment_id: uuid("assessment_id").notNull(),
  sequence_number: integer("sequence_number"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  type: text("type").notNull(), // 'multiple_choice', 'yes_no', 'free_text'
  topic_id: uuid("topic_id").notNull(),
  sequence_number: integer("sequence_number"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").notNull(),
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
  question_id: uuid("question_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Assessment assignments table
export const assessmentAssignments = pgTable("assessment_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessment_id: uuid("assessment_id").notNull(),
  user_id: uuid("user_id").notNull(),
  status: text("status").default("assigned"),
  scope: text("scope").default("full"),
  due_date: timestamp("due_date"),
  assigned_at: timestamp("assigned_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Assessment submissions table
export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessment_id: uuid("assessment_id").notNull(),
  user_id: uuid("user_id").notNull(),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  score: integer("score"),
  max_score: integer("max_score"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Topic assignments table
export const topicAssignments = pgTable("topic_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic_id: uuid("topic_id").notNull(),
  user_id: uuid("user_id").notNull(),
  assessment_assignment_id: uuid("assessment_assignment_id").notNull(),
  status: text("status").default("not_started"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Submitted answers table
export const submittedAnswers = pgTable("submitted_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  submission_id: uuid("submission_id").notNull(),
  question_id: uuid("question_id").notNull(),
  answer_id: uuid("answer_id"),
  text_answer: text("text_answer"),
  is_correct: boolean("is_correct"),
  marks: integer("marks"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  assessments: many(assessments),
  topics: many(topics),
  questions: many(questions),
  assignments: many(assessmentAssignments),
  submissions: many(assessmentSubmissions),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  creator: one(profiles, { fields: [assessments.created_by], references: [profiles.id] }),
  topics: many(topics),
  assignments: many(assessmentAssignments),
  submissions: many(assessmentSubmissions),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  assessment: one(assessments, { fields: [topics.assessment_id], references: [assessments.id] }),
  creator: one(profiles, { fields: [topics.created_by], references: [profiles.id] }),
  questions: many(questions),
  assignments: many(topicAssignments),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, { fields: [questions.topic_id], references: [topics.id] }),
  creator: one(profiles, { fields: [questions.created_by], references: [profiles.id] }),
  answers: many(answers),
  submittedAnswers: many(submittedAnswers),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  question: one(questions, { fields: [answers.question_id], references: [questions.id] }),
  submittedAnswers: many(submittedAnswers),
}));

export const assessmentAssignmentsRelations = relations(assessmentAssignments, ({ one, many }) => ({
  assessment: one(assessments, { fields: [assessmentAssignments.assessment_id], references: [assessments.id] }),
  user: one(profiles, { fields: [assessmentAssignments.user_id], references: [profiles.id] }),
  topicAssignments: many(topicAssignments),
}));

export const assessmentSubmissionsRelations = relations(assessmentSubmissions, ({ one, many }) => ({
  assessment: one(assessments, { fields: [assessmentSubmissions.assessment_id], references: [assessments.id] }),
  user: one(profiles, { fields: [assessmentSubmissions.user_id], references: [profiles.id] }),
  submittedAnswers: many(submittedAnswers),
}));

export const topicAssignmentsRelations = relations(topicAssignments, ({ one }) => ({
  topic: one(topics, { fields: [topicAssignments.topic_id], references: [topics.id] }),
  user: one(profiles, { fields: [topicAssignments.user_id], references: [profiles.id] }),
  assessmentAssignment: one(assessmentAssignments, { fields: [topicAssignments.assessment_assignment_id], references: [assessmentAssignments.id] }),
}));

export const submittedAnswersRelations = relations(submittedAnswers, ({ one }) => ({
  submission: one(assessmentSubmissions, { fields: [submittedAnswers.submission_id], references: [assessmentSubmissions.id] }),
  question: one(questions, { fields: [submittedAnswers.question_id], references: [questions.id] }),
  answer: one(answers, { fields: [submittedAnswers.answer_id], references: [answers.id] }),
}));

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssessmentAssignmentSchema = createInsertSchema(assessmentAssignments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssessmentSubmissionSchema = createInsertSchema(assessmentSubmissions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTopicAssignmentSchema = createInsertSchema(topicAssignments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSubmittedAnswerSchema = createInsertSchema(submittedAnswers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;

export type InsertAssessmentAssignment = z.infer<typeof insertAssessmentAssignmentSchema>;
export type AssessmentAssignment = typeof assessmentAssignments.$inferSelect;

export type InsertAssessmentSubmission = z.infer<typeof insertAssessmentSubmissionSchema>;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;

export type InsertTopicAssignment = z.infer<typeof insertTopicAssignmentSchema>;
export type TopicAssignment = typeof topicAssignments.$inferSelect;

export type InsertSubmittedAnswer = z.infer<typeof insertSubmittedAnswerSchema>;
export type SubmittedAnswer = typeof submittedAnswers.$inferSelect;

// Legacy user types for backward compatibility
export const users = profiles;
export const insertUserSchema = insertProfileSchema;
export type InsertUser = InsertProfile;
export type User = Profile;
