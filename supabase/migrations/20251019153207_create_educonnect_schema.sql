/*
  # EduConnect AI Database Schema

  ## Overview
  This migration sets up the complete database schema for the EduConnect AI platform,
  a learning and teaching community connecting teachers and students.

  ## 1. New Tables

  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'teacher' or 'student'
  - `grade_level` (text) - For students: JSS1-SS3, for teachers: subjects they teach
  - `avatar_url` (text, optional) - Profile picture URL
  - `bio` (text, optional) - User biography
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lesson_notes`
  - `id` (uuid, primary key) - Unique lesson identifier
  - `teacher_id` (uuid, foreign key) - Reference to teacher's profile
  - `title` (text) - Lesson title
  - `subject` (text) - Subject area
  - `grade_level` (text) - Target grade level
  - `topic` (text) - Main topic
  - `subtopic` (text, optional) - Subtopic if applicable
  - `objectives` (text[]) - Learning objectives array
  - `introduction` (text) - Lesson introduction
  - `content` (text) - Main lesson content
  - `evaluation` (text) - Evaluation section
  - `conclusion` (text) - Lesson conclusion
  - `ai_generated` (boolean) - Whether AI generated this note
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `questions`
  - `id` (uuid, primary key) - Unique question identifier
  - `teacher_id` (uuid, foreign key) - Reference to teacher who created it
  - `lesson_id` (uuid, foreign key, optional) - Related lesson if any
  - `question_text` (text) - The question content
  - `question_type` (text) - 'multiple_choice', 'short_answer', or 'essay'
  - `subject` (text) - Subject area
  - `topic` (text) - Topic covered
  - `difficulty` (text) - 'easy', 'medium', or 'hard'
  - `options` (jsonb, optional) - For multiple choice: array of options
  - `correct_answer` (text) - The correct answer
  - `explanation` (text, optional) - Explanation of the answer
  - `ai_generated` (boolean) - Whether AI generated this question
  - `created_at` (timestamptz) - Creation timestamp

  ### `quizzes`
  - `id` (uuid, primary key) - Unique quiz identifier
  - `teacher_id` (uuid, foreign key) - Reference to teacher who created it
  - `title` (text) - Quiz title
  - `subject` (text) - Subject area
  - `grade_level` (text) - Target grade level
  - `description` (text, optional) - Quiz description
  - `time_limit` (integer, optional) - Time limit in minutes
  - `created_at` (timestamptz) - Creation timestamp
  - `published` (boolean) - Whether quiz is published

  ### `quiz_questions`
  - `id` (uuid, primary key) - Unique identifier
  - `quiz_id` (uuid, foreign key) - Reference to quiz
  - `question_id` (uuid, foreign key) - Reference to question
  - `order_index` (integer) - Order of question in quiz
  - `points` (integer) - Points for this question

  ### `quiz_attempts`
  - `id` (uuid, primary key) - Unique attempt identifier
  - `quiz_id` (uuid, foreign key) - Reference to quiz
  - `student_id` (uuid, foreign key) - Reference to student
  - `score` (numeric) - Score achieved
  - `max_score` (numeric) - Maximum possible score
  - `percentage` (numeric) - Percentage score
  - `answers` (jsonb) - Student's answers
  - `started_at` (timestamptz) - When student started
  - `completed_at` (timestamptz, optional) - When student finished
  - `time_taken` (integer, optional) - Time taken in seconds

  ### `performance_stats`
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - Reference to student
  - `subject` (text) - Subject area
  - `topic` (text) - Specific topic
  - `total_attempts` (integer) - Number of attempts
  - `correct_answers` (integer) - Total correct answers
  - `total_questions` (integer) - Total questions attempted
  - `average_score` (numeric) - Average score percentage
  - `weak_areas` (text[]) - Array of weak topic areas
  - `last_activity` (timestamptz) - Last activity timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `messages`
  - `id` (uuid, primary key) - Unique message identifier
  - `sender_id` (uuid, foreign key) - Reference to sender
  - `recipient_id` (uuid, foreign key) - Reference to recipient
  - `message_text` (text) - Message content
  - `read` (boolean) - Whether message has been read
  - `created_at` (timestamptz) - Message timestamp

  ### `ai_chat_history`
  - `id` (uuid, primary key) - Unique chat identifier
  - `student_id` (uuid, foreign key) - Reference to student
  - `message` (text) - Student's message
  - `response` (text) - AI's response
  - `topic` (text, optional) - Topic being discussed
  - `created_at` (timestamptz) - Chat timestamp

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with restrictive policies:

  ### Profiles
  - Users can view all profiles
  - Users can only update their own profile
  - Users can insert their own profile on signup

  ### Lesson Notes
  - Everyone can view published lesson notes
  - Teachers can create and manage their own lesson notes
  - Students can view all lesson notes

  ### Questions & Quizzes
  - Teachers can create and manage their own questions and quizzes
  - Students can view published quizzes and questions
  - Students can submit quiz attempts

  ### Performance Stats
  - Students can view only their own performance stats
  - Teachers can view performance stats of all students
  - System can update performance stats

  ### Messages
  - Users can view messages they sent or received
  - Users can send messages to others
  - Users can mark their received messages as read

  ### AI Chat History
  - Students can only view and create their own chat history

  ## 3. Indexes

  Performance indexes are created on:
  - Foreign key relationships
  - Frequently queried columns (subject, grade_level, topic)
  - Timestamp columns for sorting

  ## 4. Important Notes

  - All tables use UUIDs for primary keys
  - Timestamps default to current time
  - Boolean fields have appropriate defaults
  - Arrays and JSONB used for flexible data storage
  - Cascading deletes configured for referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  grade_level text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lesson_notes table
CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  grade_level text NOT NULL,
  topic text NOT NULL,
  subtopic text,
  objectives text[] DEFAULT '{}',
  introduction text NOT NULL,
  content text NOT NULL,
  evaluation text NOT NULL,
  conclusion text NOT NULL,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lesson_notes(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay')),
  subject text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  grade_level text NOT NULL,
  description text,
  time_limit integer,
  created_at timestamptz DEFAULT now(),
  published boolean DEFAULT false
);

-- Create quiz_questions junction table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  points integer DEFAULT 1,
  UNIQUE(quiz_id, question_id)
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL,
  percentage numeric NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_taken integer
);

-- Create performance_stats table
CREATE TABLE IF NOT EXISTS performance_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  total_attempts integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  weak_areas text[] DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject, topic)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create ai_chat_history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  topic text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_notes_teacher ON lesson_notes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_subject ON lesson_notes(subject);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_grade ON lesson_notes(grade_level);
CREATE INDEX IF NOT EXISTS idx_questions_teacher ON questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_performance_stats_student ON performance_stats(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_student ON ai_chat_history(student_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for lesson_notes
CREATE POLICY "Anyone can view lesson notes"
  ON lesson_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert own lesson notes"
  ON lesson_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update own lesson notes"
  ON lesson_notes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete own lesson notes"
  ON lesson_notes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view published quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (published = true OR auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update own quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can delete own quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- RLS Policies for quiz_attempts
CREATE POLICY "Students can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

CREATE POLICY "Students can update own attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for performance_stats
CREATE POLICY "Students can view own performance stats"
  ON performance_stats FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "System can manage performance stats"
  ON performance_stats FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- RLS Policies for ai_chat_history
CREATE POLICY "Students can view own chat history"
  ON ai_chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create own chat history"
  ON ai_chat_history FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );