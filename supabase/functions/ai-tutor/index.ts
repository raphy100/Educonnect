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
    const { message, topic } = await req.json();

    const topicContext = topic ? ` regarding ${topic}` : '';
    
    let response = '';
    
    if (message.toLowerCase().includes('what') || message.toLowerCase().includes('define')) {
      response = `Great question${topicContext}! Let me break this down for you in simple terms:\n\n`;
      response += `**Key Points:**\n`;
      response += `1. The main concept here is about understanding the fundamental principles and how they apply.\n`;
      response += `2. Think of it as building blocks - each part connects to create a complete picture.\n`;
      response += `3. Real-world examples help make this clearer. For instance, you see this in everyday situations.\n\n`;
      response += `**Simplified Explanation:**\n`;
      response += `Imagine you're learning to ride a bicycle. First, you understand balance, then pedaling, then steering. Each skill builds on the previous one. That's how this concept works too!\n\n`;
      response += `Would you like me to explain any specific part in more detail?`;
    } else if (message.toLowerCase().includes('how')) {
      response = `Excellent question${topicContext}! Let me guide you through the process:\n\n`;
      response += `**Step-by-Step Approach:**\n\n`;
      response += `**Step 1:** Start by identifying what you already know. This creates a foundation.\n\n`;
      response += `**Step 2:** Look at the problem or concept systematically. Break it down into smaller, manageable parts.\n\n`;
      response += `**Step 3:** Apply the rules or principles you've learned. Don't rush - take your time to think through each step.\n\n`;
      response += `**Step 4:** Check your work. Does your answer make sense? Can you explain it to someone else?\n\n`;
      response += `**Pro Tip:** Practice makes perfect! The more you work with these concepts, the more natural they become.\n\n`;
      response += `Need help with a specific step? Just ask!`;
    } else if (message.toLowerCase().includes('why')) {
      response = `That's a thoughtful question${topicContext}! Understanding the 'why' is crucial:\n\n`;
      response += `**The Reasoning:**\n`;
      response += `This concept exists because it helps us solve important problems and understand our world better. Here's why it matters:\n\n`;
      response += `• **Practical Application:** You'll use this knowledge in real situations, not just exams.\n`;
      response += `• **Foundation Building:** This prepares you for more advanced topics later.\n`;
      response += `• **Problem-Solving Skills:** Learning this develops your critical thinking abilities.\n`;
      response += `• **Connection to Other Topics:** This links to many other areas of study.\n\n`;
      response += `Think of it like learning to cook - you learn basic techniques so you can create amazing dishes later!\n\n`;
      response += `Does this help clarify things?`;
    } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('understand')) {
      response = `I'm here to help${topicContext}! Let's work through this together:\n\n`;
      response += `**Understanding Made Easy:**\n\n`;
      response += `When something feels confusing, try these strategies:\n\n`;
      response += `1. **Read Slowly:** Don't rush. Take time to absorb each part.\n`;
      response += `2. **Use Examples:** Relate the concept to things you already know.\n`;
      response += `3. **Draw It Out:** Sometimes a simple diagram or sketch helps clarify ideas.\n`;
      response += `4. **Teach Someone:** Explaining to a friend (or even a pet!) helps you understand better.\n`;
      response += `5. **Ask Questions:** There's no such thing as a silly question!\n\n`;
      response += `**Remember:** Everyone learns at their own pace. What matters is that you keep trying and stay curious!\n\n`;
      response += `What specific aspect would you like to explore further?`;
    } else {
      response = `Thank you for your question${topicContext}! I'm here to support your learning journey.\n\n`;
      response += `Based on what you're asking, here are some helpful insights:\n\n`;
      response += `**Key Understanding:**\n`;
      response += `The most important thing to grasp is that learning is a process. Each concept builds on what you've learned before. Don't worry if something doesn't click immediately - that's completely normal!\n\n`;
      response += `**Study Tips:**\n`;
      response += `• Break complex topics into smaller pieces\n`;
      response += `• Review your notes regularly, not just before tests\n`;
      response += `• Practice with different types of problems\n`;
      response += `• Don't hesitate to ask your teacher for clarification\n\n`;
      response += `**Your Next Steps:**\n`;
      response += `Focus on understanding the 'why' behind concepts, not just memorizing facts. This deeper understanding will serve you well!\n\n`;
      response += `Feel free to ask me anything else - I'm here to help you succeed!`;
    }

    const data = {
      response,
      topic: topic || 'General',
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