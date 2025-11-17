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
    const { messages, vocabulary, phrases } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const vocabList = vocabulary.map((v: string) => `"${v}"`).join(', ');
    const phraseList = phrases.map((p: any) => `"${p.text}"`).join(', ');

    const systemPrompt = `You are a friendly English conversation coach helping Thai learners practice.

Your role:
1. Create realistic work/daily life scenarios
2. Encourage use of these phrases: ${phraseList}
3. Give constructive feedback in Thai when phrases are used correctly or incorrectly
4. Track which target phrases have been used
5. Keep responses short and encouraging

Target vocabulary: ${vocabList}
Target phrases to practice: ${phraseList}

When user uses a target phrase correctly, acknowledge it briefly.
When they finish using both phrases, provide a summary with:
- Number of target phrases used (out of 2)
- Number of vocabulary words used
- Grammar accuracy estimate
- Brief encouraging feedback in Thai`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
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
