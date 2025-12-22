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

    // Checking last 4 chars for verification (safe to log)
    console.log(`Using Key ending in: ...${apiKey.slice(-4)}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent("Ping");
        const response = await result.response;
        console.log("✅ STATUS: ONLINE (Success!)");
        console.log("Response:", response.text());
    } catch (error) {
        if (error.message.includes("429")) {
            console.log("⚠️ STATUS: QUOTA EXCEEDED (429)");
        } else if (error.message.includes("404")) {
            console.log("❌ STATUS: MODEL NOT FOUND (404) - Key might be invalid or model restricted");
        } else if (error.message.includes("403") || error.message.includes("API key not valid")) {
            console.log("❌ STATUS: INVALID KEY (403)");
        } else {
            console.error("❌ STATUS: ERROR", error.message);
        }
    }
}

testGemini();
