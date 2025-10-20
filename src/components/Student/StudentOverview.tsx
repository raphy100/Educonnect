import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ClipboardCheck, Target, TrendingUp } from 'lucide-react';

export const StudentOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    lessonsRead: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    totalLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadStats();
    }
  }, [profile?.id]);

  const loadStats = async () => {
    try {
      const [attemptsRes, lessonsRes] = await Promise.all([
        supabase
          .from('quiz_attempts')
          .select('percentage')
          .eq('student_id', profile!.id)
          .not('completed_at', 'is', null),
        supabase.from('lesson_notes').select('id', { count: 'exact' }),
      ]);

      const attempts = attemptsRes.data || [];
      const avgScore = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length
        : 0;

      setStats({
        lessonsRead: 0,
        quizzesCompleted: attempts.length,
        averageScore: Math.round(avgScore),
        totalLessons: lessonsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Available Lessons', value: stats.totalLessons, icon: BookOpen, color: 'blue' },
    { label: 'Quizzes Completed', value: stats.quizzesCompleted, icon: ClipboardCheck, color: 'green' },
    { label: 'Average Score', value: `${stats.averageScore}%`, icon: Target, color: 'orange' },
    { label: 'Progress', value: 'Growing', icon: TrendingUp, color: 'purple' },
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
          Continue your learning journey - {profile?.grade_level}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Browse Lessons</h4>
              <p className="text-sm text-gray-600">Explore lesson notes created by your teachers</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <ClipboardCheck className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Take a Quiz</h4>
              <p className="text-sm text-gray-600">Test your knowledge with practice quizzes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <p className="text-sm text-gray-700">Review lesson notes before taking quizzes</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <p className="text-sm text-gray-700">Use the AI Tutor when you need help understanding topics</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <p className="text-sm text-gray-700">Practice regularly to improve your scores</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                4
              </div>
              <p className="text-sm text-gray-700">Message your teachers if you have questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
