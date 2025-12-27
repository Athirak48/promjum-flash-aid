// import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface GeneratedQuestion {
    id: number;
    story: string;
    storyTh: string;
    question: string;
    questionTh: string;
    options: string[];
    optionsTh: string[];
    correctAnswer: number;
    explanation: string;
    explanationTh: string;
    vocabUsed: string[];
}

export interface VocabWord {
    word: string;
    meaning: string;
}

/**
 * Clean vocabulary word - remove part of speech tags like (n.), (v.), (adv.), (adj.), (phr.), etc.
 * Example: "phone (n.)" → "phone", "silently (adv.)" → "silently"
 */
function cleanWord(word: string): string {
    // Remove part of speech tags in parentheses: (n.), (v.), (adv.), (adj.), (phr.), (prep.), etc.
    // Pattern matches: ( optional-space, letters, optional dots, optional letters, optional dot, optional-space )
    return word.replace(/\s*\([a-zA-Z]+\.?\)?\.?\s*/gi, '').trim();
}

interface AIStoryResponse {
    story: string;
    storyTh: string;
    questions: {
        question: string;
        questionTh: string;
        options: string[];
        optionsTh: string[];
        correctAnswer: number;
        explanation: string;
        explanationTh: string;
        vocabUsed: string[];
        type: string;
    }[];
    vocabUsed: string[];
}

/**
 * Generate listening stories with MCQ questions
 * @param vocabList - List of vocabulary words to include (Must be 12 ideally)
 * @param count - Ignored in this version as prompt enforces 4 stories
 */
export async function generateListeningStories(
    vocabList: VocabWord[],
    level: string = 'B1',
    count: number = 4
): Promise<GeneratedQuestion[]> {
    // Force Fallback (Mock Mode)
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateFallbackListeningStories(vocabList, count);
}

/**
 * Generate reading passages with MCQ questions
 * @param vocabList - List of vocabulary words
 * @param count - Ignored, strictly 2 passages
 */
export async function generateReadingStories(
    vocabList: VocabWord[],
    count: number = 2
): Promise<GeneratedQuestion[]> {
    // Force Fallback (Mock Mode)
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateFallbackReadingStories(vocabList, count);
}

/**
 * Fallback listening stories when API fails
 */
function generateFallbackListeningStories(vocabList: VocabWord[], count: number): GeneratedQuestion[] {
    const fallback: GeneratedQuestion[] = [];

    if (!vocabList || vocabList.length === 0) {
        // Emergency fallback if no vocab provided
        for (let i = 0; i < count; i++) {
            fallback.push({
                id: i + 1,
                story: "English is a global language. It is spoken by millions of people around the world. Learning English opens many doors for your future.",
                storyTh: "ภาษาอังกฤษเป็นภาษาสากล มีผู้พูดหลายล้านคนทั่วโลก การเรียนภาษาอังกฤษเปิดโอกาสมากมายสำหรับอนาคตของคุณ",
                question: "What is this text about?",
                questionTh: "ข้อความนี้เกี่ยวกับอะไร?",
                options: ["Learning English", "Cooking", "Driving", "Sleeping"],
                optionsTh: ["การเรียนภาษาอังกฤษ", "การทำอาหาร", "การขับรถ", "การนอนหลับ"],
                correctAnswer: 0,
                explanation: "The text discusses the importance of English as a global language.",
                explanationTh: "ข้อความกล่าวถึงความสำคัญของภาษาอังกฤษในฐานะภาษาสากล",
                vocabUsed: ["English", "Global"]
            });
        }
        return fallback;
    }

    for (let i = 0; i < count; i++) {
        const vocab1 = vocabList[i % vocabList.length];
        const vocab2 = vocabList[(i + 1) % vocabList.length];

        fallback.push({
            id: i + 1,
            story: `Today I want to tell you about ${vocab1.word}. It is very important in our daily life. Many people use ${vocab2.word} every day. Learning new words helps us communicate better.`,
            storyTh: `วันนี้ฉันอยากจะเล่าเรื่อง ${vocab1.word} (${vocab1.meaning}) ให้ฟัง มันสำคัญมากในชีวิตประจำวัน หลายคนใช้ ${vocab2.word} (${vocab2.meaning}) ทุกวัน การเรียนคำศัพท์ใหม่ช่วยให้เราสื่อสารได้ดีขึ้น`,
            question: `What is the story mainly about?`,
            questionTh: `เรื่องนี้เกี่ยวกับอะไรเป็นหลัก?`,
            options: [
                `Learning vocabulary`,
                `Cooking food`,
                `Playing sports`,
                `Watching movies`
            ],
            optionsTh: [
                `การเรียนคำศัพท์`,
                `การทำอาหาร`,
                `การเล่นกีฬา`,
                `การดูหนัง`
            ],
            correctAnswer: 0,
            explanation: `The story talks about learning new words and vocabulary.`,
            explanationTh: `เรื่องราวพูดถึงการเรียนรู้คำศัพท์ใหม่`,
            vocabUsed: [vocab1.word, vocab2.word]
        });
    }

    return fallback;
}

/**
 * Fallback reading stories when API fails
 */
function generateFallbackReadingStories(vocabList: VocabWord[], count: number): GeneratedQuestion[] {
    const fallback: GeneratedQuestion[] = [];

    for (let i = 0; i < count; i++) {
        const vocab1 = vocabList[i % vocabList.length];
        const vocab2 = vocabList[(i + 1) % vocabList.length];
        const vocab3 = vocabList[(i + 2) % vocabList.length];

        fallback.push({
            id: i + 1,
            story: `Learning English is an exciting journey.Every day, we discover new words like "${vocab1.word}" and "${vocab2.word}".These words help us express our thoughts clearly.Practice makes perfect, so keep learning!

Reading is also very important for learning.When we read, we see how words like "${vocab3.word}" are used in sentences.This helps us remember them better.Try to read a little bit every day.`,
            storyTh: `การเรียนภาษาอังกฤษเป็นการเดินทางที่น่าตื่นเต้น ทุกวันเราค้นพบคำใหม่ๆ เช่น "${vocab1.word}"(${vocab1.meaning}) และ "${vocab2.word}"(${vocab2.meaning}) คำเหล่านี้ช่วยให้เราแสดงความคิดได้ชัดเจน การฝึกฝนทำให้สมบูรณ์แบบ จงเรียนรู้ต่อไป!

การอ่านก็สำคัญมากสำหรับการเรียน เมื่อเราอ่าน เราจะเห็นว่าคำอย่าง "${vocab3.word}"(${vocab3.meaning}) ถูกใช้ในประโยคอย่างไร สิ่งนี้ช่วยให้เราจำได้ดีขึ้น พยายามอ่านทุกวันสักนิด`,
            question: `What does the passage suggest for better learning ? `,
            questionTh: `เนื้อเรื่องแนะนำอะไรเพื่อการเรียนรู้ที่ดีขึ้น ? `,
            options: [
                `Read a little bit every day`,
                `Watch TV all day`,
                `Sleep more`,
                `Eat more food`
            ],
            optionsTh: [
                `อ่านทุกวันสักนิด`,
                `ดูทีวีทั้งวัน`,
                `นอนมากขึ้น`,
                `กินอาหารมากขึ้น`
            ],
            correctAnswer: 0,
            explanation: `The passage says "Try to read a little bit every day" for better learning.`,
            explanationTh: `เนื้อเรื่องบอกว่า "พยายามอ่านทุกวันสักนิด" เพื่อการเรียนรู้ที่ดีขึ้น`,
            vocabUsed: [vocab1.word, vocab2.word, vocab3.word]
        });
    }

    return fallback;
}
