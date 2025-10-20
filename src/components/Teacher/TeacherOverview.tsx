import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, FileText, Users, ClipboardList } from 'lucide-react';

export const TeacherOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    lessons: 0,
    questions: 0,
    quizzes: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadStats();
    }
  }, [profile?.id]);

  const loadStats = async () => {
    try {
      const [lessonsRes, questionsRes, quizzesRes, studentsRes] = await Promise.all([
        supabase.from('lesson_notes').select('id', { count: 'exact' }).eq('teacher_id', profile!.id),
        supabase.from('questions').select('id', { count: 'exact' }).eq('teacher_id', profile!.id),
        supabase.from('quizzes').select('id', { count: 'exact' }).eq('teacher_id', profile!.id),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      ]);

      setStats({
        lessons: lessonsRes.count || 0,
        questions: questionsRes.count || 0,
        quizzes: quizzesRes.count || 0,
        students: studentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Lesson Notes', value: stats.lessons, icon: BookOpen, color: 'blue' },
    { label: 'Questions', value: stats.questions, icon: FileText, color: 'green' },
    { label: 'Quizzes', value: stats.quizzes, icon: ClipboardList, color: 'orange' },
    { label: 'Total Students', value: stats.students, icon: Users, color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h2>
        <p className="text-gray-600">
          Here's an overview of your teaching activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-700',
            green: 'bg-green-100 text-green-700',
            orange: 'bg-orange-100 text-orange-700',
            purple: 'bg-purple-100 text-purple-700',
          }[stat.color];

          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Generate Lesson Note</h4>
            <p className="text-sm text-gray-600">Use AI to create structured lesson notes instantly</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Create Questions</h4>
            <p className="text-sm text-gray-600">Generate test questions with different difficulty levels</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <ClipboardList className="w-8 h-8 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Build Quiz</h4>
            <p className="text-sm text-gray-600">Compile questions into comprehensive quizzes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
