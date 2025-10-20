import { useEffect, useState } from 'react';
import { supabase, LessonNote } from '../../lib/supabase';
import { BookOpen, User, Calendar, Sparkles } from 'lucide-react';

export const LessonsList = () => {
  const [lessons, setLessons] = useState<LessonNote[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', gradeLevel: '' });

  useEffect(() => {
    loadLessons();
  }, [filter]);

  const loadLessons = async () => {
    try {
      let query = supabase.from('lesson_notes').select('*').order('created_at', { ascending: false });

      if (filter.subject) query = query.eq('subject', filter.subject);
      if (filter.gradeLevel) query = query.eq('grade_level', filter.gradeLevel);

      const { data, error } = await query;

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjects = [...new Set(lessons.map(l => l.subject))];
  const gradeLevels = [...new Set(lessons.map(l => l.grade_level))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <div>
        <button
          onClick={() => setSelectedLesson(null)}
          className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Lessons
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
              {selectedLesson.ai_generated && (
                <span className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Generated</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {selectedLesson.subject}
              </span>
              <span>{selectedLesson.grade_level}</span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(selectedLesson.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
            <ul className="list-disc list-inside space-y-2">
              {selectedLesson.objectives.map((obj, i) => (
                <li key={i} className="text-gray-700">{obj}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Introduction</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedLesson.introduction}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Main Content</h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedLesson.content}</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Evaluation</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedLesson.evaluation}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Conclusion</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedLesson.conclusion}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Lessons</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter.subject}
          onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filter.gradeLevel}
          onChange={(e) => setFilter({ ...filter, gradeLevel: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Grades</option>
          {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No lessons available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{lesson.title}</h3>
                {lesson.ai_generated && (
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{lesson.topic}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{lesson.subject} - {lesson.grade_level}</span>
                <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
