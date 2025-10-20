import { useState } from 'react';
import { Sparkles, Save, Download, BookOpen, Target, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'Geography', 'History',
  'Computer Science', 'Agricultural Science', 'Civic Education'
];

const GRADE_LEVELS = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

export const LessonNoteGenerator = () => {
  const { profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  const handleGenerate = async () => {
    if (!subject || !gradeLevel || !topic) {
      alert('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson-note`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, gradeLevel, topic, subtopic }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate lesson note');

      const data = await response.json();
      setGeneratedNote(data);
    } catch (error) {
      console.error('Error generating lesson note:', error);
      alert('Failed to generate lesson note. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNote) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('lesson_notes').insert({
        teacher_id: profile!.id,
        title: generatedNote.title,
        subject,
        grade_level: gradeLevel,
        topic,
        subtopic: subtopic || null,
        objectives: generatedNote.objectives,
        introduction: generatedNote.introduction,
        content: generatedNote.content,
        evaluation: generatedNote.evaluation,
        conclusion: generatedNote.conclusion,
        ai_generated: true,
      });

      if (error) throw error;

      alert('Lesson note saved successfully!');
      setGeneratedNote(null);
      setSubject('');
      setGradeLevel('');
      setTopic('');
      setSubtopic('');
    } catch (error) {
      console.error('Error saving lesson note:', error);
      alert('Failed to save lesson note');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedNote) return;

    const content = `
LESSON NOTE

Title: ${generatedNote.title}
Subject: ${subject}
Grade Level: ${gradeLevel}
Topic: ${topic}
${subtopic ? `Subtopic: ${subtopic}` : ''}

OBJECTIVES:
${generatedNote.objectives.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

INTRODUCTION:
${generatedNote.introduction}

CONTENT:
${generatedNote.content}

EVALUATION:
${generatedNote.evaluation}

CONCLUSION:
${generatedNote.conclusion}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_lesson_note.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Lesson Note Generator</h2>
        <p className="text-gray-600">Create comprehensive, well-structured lesson notes instantly with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate with AI
            </h3>
            <p className="text-sm text-blue-700">
              Enter the details below and let AI create a comprehensive lesson note for you.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select grade level</option>
                {GRADE_LEVELS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Cell Division"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtopic (Optional)
              </label>
              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g., Mitosis and Meiosis"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !subject || !gradeLevel || !topic}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{generating ? 'Generating...' : 'Generate Lesson Note'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {generatedNote ? (
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{generatedNote.title}</h3>
                    <div className="flex items-center space-x-3 text-blue-100 text-sm">
                      <span>{subject}</span>
                      <span>•</span>
                      <span>{gradeLevel}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="p-2.5 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors font-semibold shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-green-900">Learning Objectives</h4>
                  </div>
                  <ul className="space-y-2">
                    {generatedNote.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-blue-900">Introduction</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedNote.introduction}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-600 p-2 rounded-lg mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-purple-900">Main Content</h4>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                    {generatedNote.content}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-600 p-2 rounded-lg mr-3">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-orange-900">Evaluation</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedNote.evaluation}</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-teal-600 p-2 rounded-lg mr-3">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-teal-900">Conclusion</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedNote.conclusion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center h-full flex items-center justify-center shadow-inner">
              <div>
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lesson Note Yet</h3>
                <p className="text-gray-600">Fill in the form and click generate to create your lesson note</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
