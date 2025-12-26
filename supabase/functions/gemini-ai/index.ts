import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: track requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role key for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`Request from user: ${userId}`);

    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const body = await req.json();
    
    // Validate request structure
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, vocabList, level, count } = body;

    // Validate action
    const allowedActions = ['generateListeningStories', 'generateReadingStories'];
    if (!action || !allowedActions.includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate vocabList
    if (!Array.isArray(vocabList) || vocabList.length === 0 || vocabList.length > 50) {
      return new Response(JSON.stringify({ error: 'vocabList must be an array with 1-50 items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate each vocab item
    for (const item of vocabList) {
      if (!item.word || typeof item.word !== 'string' || item.word.length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid vocab item: word must be a string <= 100 chars' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!item.meaning || typeof item.meaning !== 'string' || item.meaning.length > 500) {
        return new Response(JSON.stringify({ error: 'Invalid vocab item: meaning must be a string <= 500 chars' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean word function
    const cleanWord = (word: string): string => {
      return word.replace(/\s*\([a-zA-Z]+\.?\)?\.?\s*/gi, '').trim();
    };

    // Build prompt based on action
    const vocabString = vocabList.map((v: { word: string; meaning: string }) => 
      `${cleanWord(v.word)} (${cleanWord(v.meaning)})`
    ).join(', ');

    let prompt = '';
    
    if (action === 'generateListeningStories') {
      const targetLevel = level || 'B1';
      prompt = `You are an English exam content generator.

The user provides exactly ${vocabList.length} English vocabulary words:
User Words: ${vocabString}

INSTRUCTIONS:
1.  **Target Level:** ${targetLevel} (CEFR Standard).
2.  **Vocabulary:** 
    *   MUST use the User Words (${vocabList.length} words).
    *   Select additional high-frequency words appropriate for ${targetLevel} level to complete the stories.
3.  **Structure:** Create 4 short stories.
4.  Each story must use specific user words (distribute them).

DETAILS per Story:
- Length: 5-7 sentences.
- Grammar/Complexity: strictly matching ${targetLevel} level.
- Context: Daily life, work, or general topics suitable for ${targetLevel}.

Questions per story:
- 2 multiple-choice questions (A–D).
- Q1: Detail.
- Q2: Main idea.
- Only one correct answer.

OUTPUT FORMAT (JSON array of objects):
[
  {
    "story": "Story text...",
    "storyTh": "Story translation...",
    "questions": [
       {
         "question": "Question 1 text",
         "questionTh": "Question 1 translation",
         "options": ["A", "B", "C", "D"],
         "optionsTh": ["A_th", "B_th", "C_th", "D_th"],
         "correctAnswer": 0,
         "explanation": "Why correct...",
         "explanationTh": "Thai explanation...",
         "type": "Detail"
       },
       {
         "question": "Question 2 text (Main Idea)",
         "questionTh": "Question 2 translation",
         "options": ["...", "...", "...", "..."],
         "optionsTh": ["...", "...", "...", "..."],
         "correctAnswer": 0,
         "explanation": "...",
         "explanationTh": "...",
         "type": "Main Idea"
       }
    ],
    "vocabUsed": ["word1", "word2", "word3"]
  }
]`;
    } else if (action === 'generateReadingStories') {
      prompt = `You are an English exam content generator.

The user provides exactly ${vocabList.length} English vocabulary words.
You MUST use all given words exactly as provided.
Each vocabulary word can be used ONLY ONCE.
Do NOT reuse any word if it has already appeared in a previous story or passage.

VOCABULARY LIST: ${vocabString}

READING MODE:
- Create 2 reading passages.
- Use 6 UNIQUE vocabulary words per passage (no repetition across passages).
- Each passage has 2 paragraphs.
- Each paragraph has exactly 7 sentences.
- English level: B1–B2.
- Grammar must be correct.

Questions per passage:
- 2 multiple-choice questions (A–D).
- Q1: Detail from the passage.
- Q2: Main idea.
- Only one correct answer.

OUTPUT FORMAT (JSON array of objects):
[
  {
    "story": "Passage text (2 paragraphs)...",
    "storyTh": "Passage translation...",
    "questions": [
       {
         "question": "Detail question...",
         "questionTh": "Translation...",
         "options": ["...", "...", "...", "..."],
         "optionsTh": ["...", "...", "...", "..."],
         "correctAnswer": 0,
         "explanation": "...",
         "explanationTh": "...",
         "type": "Detail"
       },
       {
         "question": "Main Idea question...",
         "questionTh": "Translation...",
         "options": ["...", "...", "...", "..."],
         "optionsTh": ["...", "...", "...", "..."],
         "correctAnswer": 0,
         "explanation": "...",
         "explanationTh": "...",
         "type": "Main Idea"
       }
    ],
    "vocabUsed": ["word1", "word2", "word3", "word4", "word5", "word6"]
  }
]`;
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('No response from Gemini');
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response');
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stories = JSON.parse(jsonMatch[0]);
    
    console.log(`Successfully generated ${stories.length} stories for user ${userId}`);

    return new Response(JSON.stringify({ stories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-ai function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
