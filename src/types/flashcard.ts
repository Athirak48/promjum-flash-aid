// Flashcard Types

export interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    pronunciation_ipa?: string;
    example_sentence_en?: string;
    example_sentence_th?: string;
    audio_url?: string;
    subdeck_id?: string;
    created_at?: string;
}

export interface UserFlashcard {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    flashcard_set_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface FlashcardWithProgress extends Flashcard {
    srs_level?: number;
    srs_score?: number;
    next_review_date?: string;
    times_reviewed?: number;
    times_correct?: number;
}
