import { useState } from 'react';
import { Sparkles, Save, Download } from 'lucide-react';
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Lesson Note Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate with AI
            </h3>
            <p className="text-sm text-blue-700">
              Enter the details below and let AI create a comprehensive lesson note for you.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level *
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select grade level</option>
              {GRADE_LEVELS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Cell Division"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtopic (Optional)
            </label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., Mitosis and Meiosis"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !subject || !gradeLevel || !topic}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>{generating ? 'Generating...' : 'Generate Lesson Note'}</span>
          </button>
        </div>

        <div>
          {generatedNote ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{generatedNote.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objectives</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedNote.objectives.map((obj: string, i: number) => (
                      <li key={i} className="text-gray-700 text-sm">{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{generatedNote.introduction}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{generatedNote.content}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Evaluation</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{generatedNote.evaluation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Conclusion</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{generatedNote.conclusion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Generated lesson note will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
