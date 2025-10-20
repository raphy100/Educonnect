import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { subject, topic, difficulty, count, questionType } = await req.json();

    const questions = [];
    const numQuestions = parseInt(count) || 5;

    for (let i = 0; i < numQuestions; i++) {
      if (questionType === 'multiple_choice' || !questionType) {
        const options = [
          { label: 'A', value: `Option A related to ${topic}` },
          { label: 'B', value: `Option B explaining ${topic} concept` },
          { label: 'C', value: `Option C describing ${topic} principle` },
          { label: 'D', value: `Option D about ${topic} application` },
        ];

        questions.push({
          question_text: `Question ${i + 1}: Which of the following best describes ${topic} in ${subject}?`,
          question_type: 'multiple_choice',
          difficulty,
          options,
          correct_answer: 'A',
          explanation: `The correct answer relates to the fundamental understanding of ${topic}. ${difficulty === 'easy' ? 'This is a basic concept.' : difficulty === 'medium' ? 'This requires understanding of key principles.' : 'This demands critical thinking and deep analysis.'}`,
        });
      } else if (questionType === 'short_answer') {
        questions.push({
          question_text: `Question ${i + 1}: Explain the concept of ${topic} in ${subject}.`,
          question_type: 'short_answer',
          difficulty,
          options: null,
          correct_answer: `A comprehensive explanation of ${topic} including its key principles and applications.`,
          explanation: `Students should demonstrate understanding of ${topic} by explaining the main concepts clearly and providing relevant examples.`,
        });
      } else if (questionType === 'essay') {
        questions.push({
          question_text: `Question ${i + 1}: Write a detailed essay discussing ${topic} in ${subject}, including its importance, applications, and impact.`,
          question_type: 'essay',
          difficulty,
          options: null,
          correct_answer: `A well-structured essay covering the significance of ${topic}, providing detailed analysis and examples.`,
          explanation: `The essay should include an introduction, body paragraphs with clear arguments, and a conclusion. Students should demonstrate critical thinking and comprehensive knowledge.`,
        });
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});