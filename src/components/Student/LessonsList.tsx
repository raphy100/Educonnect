import { useEffect, useState } from 'react';
import { supabase, LessonNote } from '../../lib/supabase';
import { BookOpen, Calendar, Sparkles, Target, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

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
          className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Lessons</span>
        </button>

        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedLesson.title}</h2>
                <div className="flex flex-wrap gap-3 text-blue-100 text-sm">
                  <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    {selectedLesson.subject}
                  </span>
                  <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                    {selectedLesson.grade_level}
                  </span>
                  <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {new Date(selectedLesson.created_at).toLocaleDateString()}
                  </span>
                  {selectedLesson.ai_generated && (
                    <span className="flex items-center bg-purple-500/80 px-3 py-1 rounded-full">
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      AI Generated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 p-2 rounded-lg mr-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">Learning Objectives</h3>
              </div>
              <ul className="space-y-2.5">
                {selectedLesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed text-base">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Introduction</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">{selectedLesson.introduction}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 p-2 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900">Main Content</h3>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base prose prose-sm max-w-none">
                {selectedLesson.content}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="bg-orange-600 p-2 rounded-lg mr-3">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-orange-900">Evaluation</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">{selectedLesson.evaluation}</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="bg-teal-600 p-2 rounded-lg mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-teal-900">Conclusion</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">{selectedLesson.conclusion}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Lessons</h2>
        <p className="text-gray-600">Explore lesson notes created by your teachers</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Subject</label>
          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Grade</label>
          <select
            value={filter.gradeLevel}
            onChange={(e) => setFilter({ ...filter, gradeLevel: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Grades</option>
            {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center shadow-inner">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lessons Available</h3>
          <p className="text-gray-600">Check back later for new lesson notes from your teachers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.topic}</p>
                </div>
                {lesson.ai_generated && (
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 ml-2" />
                )}
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                  {lesson.subject}
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                  {lesson.grade_level}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(lesson.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                  Read More →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
