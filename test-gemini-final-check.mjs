import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

function getEnvVar(key) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(new RegExp(`${key}=(.*)`));
        if (match && match[1]) {
            return match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) {
        console.error("Error reading .env:", e);
    }
    return process.env[key];
}

async function testGemini() {
    console.log("Checking API Status...");
    const apiKey = getEnvVar('VITE_GEMINI_API_KEY');

    if (!apiKey) {
        console.error("❌ No API Key found");
        process.exit(1);
    }

    console.log(`Using Key ending in: ...${apiKey.slice(-4)}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent("Ping");
        const response = await result.response;
        console.log("✅ STATUS: ONLINE (Success!)");
        console.log("Response:", response.text());
    } catch (error) {
        console.error("❌ STATUS: ERROR", error.message);
    }
}

testGemini();
