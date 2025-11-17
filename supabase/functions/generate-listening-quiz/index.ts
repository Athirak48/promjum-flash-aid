import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vocabulary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const vocabList = vocabulary.map((v: string) => `"${v}"`).join(', ');
    
    const systemPrompt = `You are creating listening comprehension quizzes for English learners.
Create 5 quiz questions based on short stories using the vocabulary words.

Each question should have:
- A short story (2-3 sentences) using 2-3 vocabulary words
- Thai translation of the story
- A comprehension question
- 4 multiple choice options
- Correct answer index (0-3)
- Brief Thai explanation of the answer

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "story": "English story here",
      "storyThai": "คำแปลเรื่องราว",
      "question": "Comprehension question?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 0,
      "explanation": "คำอธิบายสั้นๆ ว่าทำไมเป็นคำตอบที่ถูก"
    }
  ]
}`;

    const userPrompt = `Vocabulary: ${vocabList}\n\nCreate 5 listening quiz questions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
