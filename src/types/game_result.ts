export interface QuestionAnswer {
    wordId: string;
    isCorrect: boolean;
    timeTaken: number; // ms
}

export interface GameResult {
    gameId: string;
    gameName: string;
    score: number;
    correct: number;
    total: number;
    answers: QuestionAnswer[]; // Detailed breakdown for SRS
}
