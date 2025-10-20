import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'teacher' | 'student';
  grade_level: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonNote = {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  grade_level: string;
  topic: string;
  subtopic: string | null;
  objectives: string[];
  introduction: string;
  content: string;
  evaluation: string;
  conclusion: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  teacher_id: string;
  lesson_id: string | null;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer' | 'essay';
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: { label: string; value: string }[] | null;
  correct_answer: string;
  explanation: string | null;
  ai_generated: boolean;
  created_at: string;
};

export type Quiz = {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  grade_level: string;
  description: string | null;
  time_limit: number | null;
  created_at: string;
  published: boolean;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  max_score: number;
  percentage: number;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string | null;
  time_taken: number | null;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  read: boolean;
  created_at: string;
};

export type PerformanceStats = {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  total_attempts: number;
  correct_answers: number;
  total_questions: number;
  average_score: number;
  weak_areas: string[];
  last_activity: string;
  updated_at: string;
};
