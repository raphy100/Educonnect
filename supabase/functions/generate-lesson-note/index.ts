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
    const { subject, gradeLevel, topic, subtopic } = await req.json();

    const title = subtopic ? `${topic}: ${subtopic}` : topic;

    const objectives = [
      `Understand the key concepts of ${topic}`,
      `Identify and explain the main components of ${topic}`,
      `Apply knowledge of ${topic} to solve practical problems`,
      `Analyze the significance and applications of ${topic}`,
    ];

    const introduction = `This lesson introduces students to ${topic}, a fundamental concept in ${subject}. ${subtopic ? `We will focus specifically on ${subtopic}. ` : ''}Understanding ${topic} is essential for ${gradeLevel} students as it forms the foundation for more advanced studies in ${subject}.\n\nBy the end of this lesson, students will have a comprehensive understanding of the key principles and practical applications of ${topic}.`;

    const content = `**Overview**\n\n${topic} is a crucial area of study in ${subject} that helps students develop critical thinking and analytical skills. Let's explore this topic in detail.\n\n**Key Concepts**\n\n1. **Definition and Importance**: ${topic} refers to the study and understanding of specific principles and relationships within ${subject}. It is important because it helps us comprehend how different elements interact and influence outcomes.\n\n2. **Main Components**: The topic consists of several interconnected parts that work together. Understanding each component individually helps build a complete picture of the subject matter.\n\n3. **Practical Applications**: ${topic} has real-world applications in various fields. Students encounter these concepts in everyday situations, making the learning relevant and engaging.\n\n4. **Examples and Illustrations**: Through carefully selected examples, we can see how ${topic} manifests in different contexts. These examples help solidify understanding and demonstrate the practical value of theoretical knowledge.\n\n**Detailed Explanation**\n\nFor ${gradeLevel} students, it's essential to approach ${topic} systematically. Start by identifying the fundamental principles, then build upon them with more complex ideas. ${subtopic ? `Focusing on ${subtopic} allows us to examine specific aspects in greater depth. ` : ''}\n\nThe relationship between different elements of ${topic} demonstrates how knowledge in ${subject} is interconnected. This interconnectedness is what makes ${subject} both challenging and rewarding to study.`;

    const evaluation = `**Assessment Questions**\n\n1. Define ${topic} in your own words and explain its significance in ${subject}.\n\n2. List and explain three key components or principles of ${topic}.\n\n3. Provide at least two practical examples of how ${topic} is applied in real-world situations.\n\n4. Compare and contrast different aspects of ${topic}, highlighting similarities and differences.\n\n5. Critical thinking: How does understanding ${topic} help you in other areas of ${subject}?\n\n**Class Activity**\n\nStudents should work in small groups to discuss and present their understanding of ${topic}. Each group will identify one unique application of the concept and share with the class.`;

    const conclusion = `In this lesson, we have explored ${topic} in ${subject} for ${gradeLevel} students. We covered the fundamental concepts, key principles, and practical applications that make this topic essential for your educational journey.\n\nRemember that mastering ${topic} requires practice and application. Continue to review the material, work through examples, and ask questions when concepts are unclear. ${subtopic ? `Our focus on ${subtopic} has provided deeper insight into specific aspects of the broader topic. ` : ''}\n\nAs you progress in your studies, the knowledge gained from understanding ${topic} will serve as a foundation for more advanced concepts in ${subject}. Keep practicing and stay curious!`;

    const data = {
      title,
      objectives,
      introduction,
      content,
      evaluation,
      conclusion,
    };

    return new Response(JSON.stringify(data), {
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