import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const questionTemplates = {
  Mathematics: {
    easy: [
      { q: (t) => `What is the basic definition of ${t}?`, opts: [`The mathematical operation involving ${t}`, `A numerical value`, `A geometric shape`, `None of the above`], ans: 'A' },
      { q: (t) => `Which of the following represents ${t}?`, opts: [`A correct representation of ${t}`, `An incorrect formula`, `A random equation`, `None of these`], ans: 'A' },
    ],
    medium: [
      { q: (t) => `How do you apply ${t} to solve real-world problems?`, opts: [`By understanding the principles and applying step-by-step methods`, `By guessing the answer`, `By memorizing formulas only`, `By avoiding the problem`], ans: 'A' },
      { q: (t) => `What is the relationship between ${t} and related mathematical concepts?`, opts: [`${t} connects to other concepts through common principles`, `They are completely unrelated`, `Only ${t} matters`, `There is no connection`], ans: 'A' },
    ],
    hard: [
      { q: (t) => `Analyze the complex applications of ${t} in advanced problem-solving scenarios.`, opts: [`${t} requires deep understanding and multi-step reasoning for complex applications`, `Simple memorization is sufficient`, `${t} cannot be applied to complex problems`, `Advanced applications are impossible`], ans: 'A' },
    ],
  },
  default: {
    easy: [
      { q: (t) => `What is ${t}?`, opts: [`The concept that explains ${t} and its basic principles`, `Something unrelated`, `A random term`, `Not applicable`], ans: 'A' },
      { q: (t) => `Identify the main characteristic of ${t}.`, opts: [`${t} is characterized by specific features and properties`, `It has no characteristics`, `It's undefined`, `None of the above`], ans: 'A' },
    ],
    medium: [
      { q: (t) => `How does ${t} relate to its practical applications?`, opts: [`${t} has direct applications in various real-world scenarios`, `It has no practical use`, `Only theoretical value`, `Cannot be applied`], ans: 'A' },
      { q: (t) => `What factors influence ${t}?`, opts: [`Multiple interconnected factors shape and affect ${t}`, `No factors influence it`, `Only one factor matters`, `It's completely random`], ans: 'A' },
    ],
    hard: [
      { q: (t) => `Critically evaluate the significance of ${t} in advanced contexts.`, opts: [`${t} plays a crucial role requiring deep analysis and comprehensive understanding`, `It has minimal significance`, `Basic knowledge is enough`, `Not important in advanced studies`], ans: 'A' },
    ],
  },
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
    const templates = questionTemplates[subject] || questionTemplates.default;
    const difficultyTemplates = templates[difficulty] || templates.easy;

    for (let i = 0; i < numQuestions; i++) {
      if (questionType === 'multiple_choice' || !questionType) {
        const template = difficultyTemplates[i % difficultyTemplates.length];
        const questionText = template.q(topic);
        const options = template.opts.map((opt, idx) => ({
          label: String.fromCharCode(65 + idx),
          value: opt,
        }));

        questions.push({
          question_text: questionText,
          question_type: 'multiple_choice',
          difficulty,
          options,
          correct_answer: template.ans,
          explanation: `The correct answer is ${template.ans}. ${difficulty === 'easy' ? 'This tests basic understanding of ' + topic + '.' : difficulty === 'medium' ? 'This requires applying knowledge of ' + topic + ' to practical scenarios.' : 'This demands critical analysis and deep understanding of ' + topic + ' in complex contexts.'}`,
        });
      } else if (questionType === 'short_answer') {
        const prompts = [
          `Explain the concept of ${topic} in ${subject}.`,
          `Describe how ${topic} is applied in practical situations.`,
          `What are the key principles underlying ${topic}?`,
          `Discuss the importance of ${topic} in ${subject}.`,
          `Compare and contrast different aspects of ${topic}.`,
        ];

        questions.push({
          question_text: prompts[i % prompts.length],
          question_type: 'short_answer',
          difficulty,
          options: null,
          correct_answer: `A comprehensive explanation should include: 1) Clear definition of ${topic}, 2) Key principles and concepts, 3) Practical examples demonstrating understanding, 4) Connections to broader themes in ${subject}.`,
          explanation: `Students should demonstrate thorough understanding by clearly explaining ${topic}, providing relevant examples, and showing how it connects to other concepts in ${subject}.`,
        });
      } else if (questionType === 'essay') {
        const essayPrompts = [
          `Write a detailed essay discussing ${topic} in ${subject}, including its importance, applications, and impact.`,
          `Analyze the role of ${topic} in ${subject} and its significance in real-world contexts.`,
          `Evaluate the key aspects of ${topic} and their implications in the field of ${subject}.`,
          `Discuss the evolution and current understanding of ${topic} in ${subject}.`,
        ];

        questions.push({
          question_text: essayPrompts[i % essayPrompts.length],
          question_type: 'essay',
          difficulty,
          options: null,
          correct_answer: `A strong essay should include:\n\n1. Introduction: Define ${topic} and state its significance\n2. Body Paragraphs: Explore key aspects, provide examples, analyze applications\n3. Critical Analysis: Evaluate strengths, limitations, and implications\n4. Conclusion: Synthesize main points and reflect on broader importance\n\nThe essay should demonstrate critical thinking, use specific examples, and show comprehensive understanding of ${topic} in the context of ${subject}.`,
          explanation: `Essays should demonstrate advanced writing skills, critical thinking, and deep subject knowledge. Include clear thesis, well-developed arguments, specific examples, and thoughtful analysis throughout.`,
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