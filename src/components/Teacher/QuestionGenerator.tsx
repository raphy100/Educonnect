import { useState } from 'react';
import { Sparkles, Plus, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'History', 'Computer Science', 'Agricultural Science'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_TYPES = ['multiple_choice', 'short_answer', 'essay'];

interface QuestionState {
  showAnswer: boolean;
  showExplanation: boolean;
}

export const QuestionGenerator = () => {
  const { profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [count, setCount] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !topic) {
      alert('Please fill in required fields');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, topic, difficulty, count, questionType }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      setQuestions(data.questions);
      setQuestionStates(data.questions.map(() => ({ showAnswer: false, showExplanation: false })));
      setShowAllAnswers(false);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[index] = { ...newStates[index], showAnswer: !newStates[index].showAnswer };
      return newStates;
    });
  };

  const toggleExplanation = (index: number) => {
    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[index] = { ...newStates[index], showExplanation: !newStates[index].showExplanation };
      return newStates;
    });
  };

  const toggleAllAnswers = () => {
    const newShowAll = !showAllAnswers;
    setShowAllAnswers(newShowAll);
    setQuestionStates(prev => prev.map(state => ({ ...state, showAnswer: newShowAll })));
  };

  const handleSaveAll = async () => {
    if (questions.length === 0) return;

    setSaving(true);
    try {
      const questionsToInsert = questions.map(q => ({
        teacher_id: profile!.id,
        question_text: q.question_text,
        question_type: q.question_type,
        subject,
        topic,
        difficulty: q.difficulty,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        ai_generated: true,
      }));

      const { error } = await supabase.from('questions').insert(questionsToInsert);

      if (error) throw error;

      alert('All questions saved successfully!');
      setQuestions([]);
      setQuestionStates([]);
      setSubject('');
      setTopic('');
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Question Generator</h2>
        <p className="text-gray-600">Generate intelligent questions with AI for any subject and topic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Questions
            </h3>
            <p className="text-sm text-green-700">
              Create test questions with real-time AI assistance
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quadratic Equations"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === d
                        ? d === 'easy' ? 'bg-green-600 text-white' :
                          d === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                {QUESTION_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Questions</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !subject || !topic}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{generating ? 'Generating Questions...' : 'Generate Questions'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {questions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Generated Questions ({questions.length})</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={toggleAllAnswers}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
                  >
                    {showAllAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showAllAnswers ? 'Hide All' : 'Show All'}</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save All'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-gray-900 text-lg leading-relaxed">{q.question_text}</h4>
                        </div>
                      </div>
                      <span className={`ml-3 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-300' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                        'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    </div>

                    {q.options && (
                      <div className="mb-4 space-y-2 bg-gray-50 rounded-lg p-4">
                        {q.options.map((opt: any, i: number) => (
                          <div key={i} className="flex items-start space-x-3 p-2 bg-white rounded-lg border border-gray-200">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center font-bold text-sm">
                              {opt.label}
                            </span>
                            <span className="text-gray-700 leading-relaxed">{opt.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all"
                      >
                        <span className="font-semibold text-blue-900 flex items-center">
                          {questionStates[idx]?.showAnswer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {questionStates[idx]?.showAnswer ? 'Hide Answer' : 'Show Answer'}
                        </span>
                        {questionStates[idx]?.showAnswer ? <ChevronUp className="w-5 h-5 text-blue-700" /> : <ChevronDown className="w-5 h-5 text-blue-700" />}
                      </button>

                      {questionStates[idx]?.showAnswer && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 animate-in fade-in duration-200">
                          <p className="text-sm font-semibold text-green-900 mb-2">Correct Answer:</p>
                          <p className="text-gray-800 font-medium">{q.correct_answer}</p>
                        </div>
                      )}

                      {q.explanation && (
                        <>
                          <button
                            onClick={() => toggleExplanation(idx)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition-all"
                          >
                            <span className="font-semibold text-purple-900 flex items-center">
                              <Sparkles className="w-4 h-4 mr-2" />
                              {questionStates[idx]?.showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                            </span>
                            {questionStates[idx]?.showExplanation ? <ChevronUp className="w-5 h-5 text-purple-700" /> : <ChevronDown className="w-5 h-5 text-purple-700" />}
                          </button>

                          {questionStates[idx]?.showExplanation && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 animate-in fade-in duration-200">
                              <p className="text-sm font-semibold text-purple-900 mb-2">Explanation:</p>
                              <p className="text-gray-700 leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center h-full flex items-center justify-center shadow-inner">
              <div>
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Questions Yet</h3>
                <p className="text-gray-600">Fill in the form and click generate to create AI-powered questions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
