import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignIn } from './components/Auth/SignIn';
import { SignUp } from './components/Auth/SignUp';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { TeacherOverview } from './components/Teacher/TeacherOverview';
import { LessonNoteGenerator } from './components/Teacher/LessonNoteGenerator';
import { QuestionGenerator } from './components/Teacher/QuestionGenerator';
import { StudentOverview } from './components/Student/StudentOverview';
import { LessonsList } from './components/Student/LessonsList';
import { AITutor } from './components/Student/AITutor';

function AuthenticatedApp() {
  const { user, profile, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return showSignUp ? (
      <SignUp onToggle={() => setShowSignUp(false)} />
    ) : (
      <SignIn onToggle={() => setShowSignUp(true)} />
    );
  }

  const renderContent = () => {
    if (profile.role === 'teacher') {
      switch (activeTab) {
        case 'overview':
          return <TeacherOverview />;
        case 'lessons':
          return <LessonNoteGenerator />;
        case 'questions':
          return <QuestionGenerator />;
        case 'quizzes':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Quiz Builder</h3>
              <p className="text-gray-600">Create and manage quizzes for your students</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        case 'students':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Student Analytics</h3>
              <p className="text-gray-600">View and track student performance</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        case 'messages':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Messages</h3>
              <p className="text-gray-600">Communicate with your students</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        default:
          return <TeacherOverview />;
      }
    } else {
      switch (activeTab) {
        case 'overview':
          return <StudentOverview />;
        case 'lessons':
          return <LessonsList />;
        case 'practice':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Practice Quizzes</h3>
              <p className="text-gray-600">Test your knowledge with practice quizzes</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        case 'ai-tutor':
          return <AITutor />;
        case 'performance':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">My Performance</h3>
              <p className="text-gray-600">Track your progress and scores</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        case 'messages':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Messages</h3>
              <p className="text-gray-600">Chat with your teachers</p>
              <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
            </div>
          );
        default:
          return <StudentOverview />;
      }
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
