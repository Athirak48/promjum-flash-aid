import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    Trophy, Users, Clock, Target, Upload, Download, Plus, Edit, Trash2,
    Search, Crown, Medal, Award, TrendingUp, Eye, Calendar, Zap,
    BarChart3, RefreshCcw, Play, Pause
} from 'lucide-react';

// Types
interface RankingEntry {
    rank: number;
    userId: string;
    displayName: string;
    email: string;
    bestTime: number; // seconds with decimals
    bestWordCount: number;
    accuracy: number; // percentage
    gamesPlayed: number;
    lastPlayed: string;
    avatarUrl?: string;
}

interface VocabWord {
    id: string;
    front: string;
    partOfSpeech: string;
    back: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

// Mock Data - Rankings (UNIVERSITY Mode)
const mockUniversityRankings: RankingEntry[] = [
    { rank: 1, userId: 'u001', displayName: 'สมชาย เก่งมาก', email: 'somchai@example.com', bestTime: 8.4300, bestWordCount: 30, accuracy: 100, gamesPlayed: 156, lastPlayed: '2024-12-14T10:30:00' },
    { rank: 2, userId: 'u002', displayName: 'สมหญิง ฉลาด', email: 'somying@example.com', bestTime: 9.2150, bestWordCount: 30, accuracy: 100, gamesPlayed: 89, lastPlayed: '2024-12-14T09:15:00' },
    { rank: 3, userId: 'u003', displayName: 'JohnDoe123', email: 'john@example.com', bestTime: 10.5420, bestWordCount: 30, accuracy: 96.7, gamesPlayed: 234, lastPlayed: '2024-12-13T22:45:00' },
    { rank: 4, userId: 'u004', displayName: 'VocabMaster', email: 'master@example.com', bestTime: 11.8900, bestWordCount: 30, accuracy: 93.3, gamesPlayed: 67, lastPlayed: '2024-12-14T08:00:00' },
    { rank: 5, userId: 'u005', displayName: 'EnglishPro', email: 'pro@example.com', bestTime: 12.3400, bestWordCount: 28, accuracy: 93.3, gamesPlayed: 45, lastPlayed: '2024-12-12T15:30:00' },
    { rank: 6, userId: 'u006', displayName: 'QuickLearner', email: 'quick@example.com', bestTime: 13.5600, bestWordCount: 27, accuracy: 90.0, gamesPlayed: 78, lastPlayed: '2024-12-14T11:00:00' },
    { rank: 7, userId: 'u007', displayName: 'WordNinja', email: 'ninja@example.com', bestTime: 14.2100, bestWordCount: 26, accuracy: 86.7, gamesPlayed: 112, lastPlayed: '2024-12-13T19:20:00' },
    { rank: 8, userId: 'u008', displayName: 'StudyHard', email: 'study@example.com', bestTime: 15.7800, bestWordCount: 25, accuracy: 83.3, gamesPlayed: 34, lastPlayed: '2024-12-11T14:00:00' },
    { rank: 9, userId: 'u009', displayName: 'FlashMaster', email: 'flash@example.com', bestTime: 16.4500, bestWordCount: 24, accuracy: 80.0, gamesPlayed: 56, lastPlayed: '2024-12-14T07:45:00' },
    { rank: 10, userId: 'u010', displayName: 'TopStudent', email: 'top@example.com', bestTime: 18.9200, bestWordCount: 23, accuracy: 76.7, gamesPlayed: 23, lastPlayed: '2024-12-10T20:15:00' },
];

// Mock Data - Rankings (INDIVIDUAL Mode)
const mockIndividualRankings: RankingEntry[] = [
    { rank: 1, userId: 'i001', displayName: 'SpeedRunner_TH', email: 'speed@example.com', bestTime: 7.8900, bestWordCount: 30, accuracy: 100, gamesPlayed: 245, lastPlayed: '2024-12-14T11:30:00' },
    { rank: 2, userId: 'i002', displayName: 'VocabKing2024', email: 'king@example.com', bestTime: 8.1200, bestWordCount: 30, accuracy: 100, gamesPlayed: 178, lastPlayed: '2024-12-14T10:45:00' },
    { rank: 3, userId: 'i003', displayName: 'นักเรียนเก่ง', email: 'student@example.com', bestTime: 8.5540, bestWordCount: 30, accuracy: 96.7, gamesPlayed: 312, lastPlayed: '2024-12-14T09:20:00' },
    { rank: 4, userId: 'i004', displayName: 'FlashQueen', email: 'queen@example.com', bestTime: 9.2300, bestWordCount: 30, accuracy: 100, gamesPlayed: 89, lastPlayed: '2024-12-14T08:15:00' },
    { rank: 5, userId: 'i005', displayName: 'WordChampion', email: 'champ@example.com', bestTime: 9.8700, bestWordCount: 29, accuracy: 96.7, gamesPlayed: 134, lastPlayed: '2024-12-13T22:30:00' },
    { rank: 6, userId: 'i006', displayName: 'ภาษาอังกฤษPro', email: 'eng@example.com', bestTime: 10.4500, bestWordCount: 29, accuracy: 93.3, gamesPlayed: 67, lastPlayed: '2024-12-14T07:00:00' },
    { rank: 7, userId: 'i007', displayName: 'QuizMaster99', email: 'quiz@example.com', bestTime: 11.2300, bestWordCount: 28, accuracy: 90.0, gamesPlayed: 156, lastPlayed: '2024-12-13T21:45:00' },
    { rank: 8, userId: 'i008', displayName: 'LearnerX', email: 'lx@example.com', bestTime: 12.5600, bestWordCount: 27, accuracy: 86.7, gamesPlayed: 45, lastPlayed: '2024-12-12T19:30:00' },
    { rank: 9, userId: 'i009', displayName: 'VocabNinja', email: 'vninja@example.com', bestTime: 13.8900, bestWordCount: 26, accuracy: 83.3, gamesPlayed: 78, lastPlayed: '2024-12-14T06:45:00' },
    { rank: 10, userId: 'i010', displayName: 'StudyPro2024', email: 'sp@example.com', bestTime: 15.4500, bestWordCount: 25, accuracy: 80.0, gamesPlayed: 34, lastPlayed: '2024-12-11T20:00:00' },
];

// Monthly Hall of Fame Data
interface MonthlyChampion {
    month: string;
    monthIndex: number;
    year: number;
    top3: {
        rank: number;
        displayName: string;
        userId: string;
        bestTime: number;
        wordCount: number;
    }[];
}

const mockHallOfFame: MonthlyChampion[] = [
    // 2024
    {
        month: 'มกราคม', monthIndex: 1, year: 2024, top3: [
            { rank: 1, displayName: 'TopStudent', userId: 'u010', bestTime: 9.88, wordCount: 30 },
            { rank: 2, displayName: 'FlashMaster', userId: 'u009', bestTime: 10.12, wordCount: 30 },
            { rank: 3, displayName: 'StudyHard', userId: 'u008', bestTime: 10.55, wordCount: 29 },
        ]
    },
    {
        month: 'กุมภาพันธ์', monthIndex: 2, year: 2024, top3: [
            { rank: 1, displayName: 'VocabMaster', userId: 'u004', bestTime: 8.77, wordCount: 30 },
            { rank: 2, displayName: 'WordNinja', userId: 'u007', bestTime: 9.33, wordCount: 30 },
            { rank: 3, displayName: 'EnglishPro', userId: 'u005', bestTime: 9.87, wordCount: 30 },
        ]
    },
    {
        month: 'มีนาคม', monthIndex: 3, year: 2024, top3: [
            { rank: 1, displayName: 'QuickLearner', userId: 'u006', bestTime: 8.65, wordCount: 30 },
            { rank: 2, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 9.11, wordCount: 30 },
            { rank: 3, displayName: 'สมหญิง ฉลาด', userId: 'u002', bestTime: 9.45, wordCount: 30 },
        ]
    },
    {
        month: 'เมษายน', monthIndex: 4, year: 2024, top3: [
            { rank: 1, displayName: 'JohnDoe123', userId: 'u003', bestTime: 8.92, wordCount: 30 },
            { rank: 2, displayName: 'FlashMaster', userId: 'u009', bestTime: 9.23, wordCount: 30 },
            { rank: 3, displayName: 'TopStudent', userId: 'u010', bestTime: 9.78, wordCount: 29 },
        ]
    },
    {
        month: 'พฤษภาคม', monthIndex: 5, year: 2024, top3: [
            { rank: 1, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 8.33, wordCount: 30 },
            { rank: 2, displayName: 'VocabMaster', userId: 'u004', bestTime: 8.88, wordCount: 30 },
            { rank: 3, displayName: 'WordNinja', userId: 'u007', bestTime: 9.44, wordCount: 30 },
        ]
    },
    {
        month: 'มิถุนายน', monthIndex: 6, year: 2024, top3: [
            { rank: 1, displayName: 'สมหญิง ฉลาด', userId: 'u002', bestTime: 8.45, wordCount: 30 },
            { rank: 2, displayName: 'EnglishPro', userId: 'u005', bestTime: 8.99, wordCount: 30 },
            { rank: 3, displayName: 'QuickLearner', userId: 'u006', bestTime: 9.55, wordCount: 30 },
        ]
    },
    {
        month: 'กรกฎาคม', monthIndex: 7, year: 2024, top3: [
            { rank: 1, displayName: 'StudyHard', userId: 'u008', bestTime: 8.22, wordCount: 30 },
            { rank: 2, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 8.66, wordCount: 30 },
            { rank: 3, displayName: 'JohnDoe123', userId: 'u003', bestTime: 9.11, wordCount: 30 },
        ]
    },
    {
        month: 'สิงหาคม', monthIndex: 8, year: 2024, top3: [
            { rank: 1, displayName: 'สมหญิง ฉลาด', userId: 'u002', bestTime: 8.55, wordCount: 30 },
            { rank: 2, displayName: 'VocabMaster', userId: 'u004', bestTime: 9.02, wordCount: 30 },
            { rank: 3, displayName: 'EnglishPro', userId: 'u005', bestTime: 9.67, wordCount: 29 },
        ]
    },
    {
        month: 'กันยายน', monthIndex: 9, year: 2024, top3: [
            { rank: 1, displayName: 'QuickLearner', userId: 'u006', bestTime: 8.76, wordCount: 30 },
            { rank: 2, displayName: 'StudyHard', userId: 'u008', bestTime: 9.33, wordCount: 30 },
            { rank: 3, displayName: 'WordNinja', userId: 'u007', bestTime: 9.88, wordCount: 30 },
        ]
    },
    {
        month: 'ตุลาคม', monthIndex: 10, year: 2024, top3: [
            { rank: 1, displayName: 'FlashMaster', userId: 'u009', bestTime: 8.99, wordCount: 30 },
            { rank: 2, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 9.45, wordCount: 30 },
            { rank: 3, displayName: 'TopStudent', userId: 'u010', bestTime: 10.78, wordCount: 28 },
        ]
    },
    {
        month: 'พฤศจิกายน', monthIndex: 11, year: 2024, top3: [
            { rank: 1, displayName: 'WordNinja', userId: 'u007', bestTime: 9.12, wordCount: 30 },
            { rank: 2, displayName: 'VocabMaster', userId: 'u004', bestTime: 9.85, wordCount: 30 },
            { rank: 3, displayName: 'EnglishPro', userId: 'u005', bestTime: 10.23, wordCount: 29 },
        ]
    },
    {
        month: 'ธันวาคม', monthIndex: 12, year: 2024, top3: [
            { rank: 1, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 8.43, wordCount: 30 },
            { rank: 2, displayName: 'สมหญิง ฉลาด', userId: 'u002', bestTime: 9.21, wordCount: 30 },
            { rank: 3, displayName: 'JohnDoe123', userId: 'u003', bestTime: 10.54, wordCount: 30 },
        ]
    },
    // 2023
    {
        month: 'มกราคม', monthIndex: 1, year: 2023, top3: [
            { rank: 1, displayName: 'OldChamp1', userId: 'old1', bestTime: 10.22, wordCount: 30 },
            { rank: 2, displayName: 'OldChamp2', userId: 'old2', bestTime: 10.88, wordCount: 30 },
            { rank: 3, displayName: 'OldChamp3', userId: 'old3', bestTime: 11.33, wordCount: 29 },
        ]
    },
    {
        month: 'กุมภาพันธ์', monthIndex: 2, year: 2023, top3: [
            { rank: 1, displayName: 'สมชาย เก่งมาก', userId: 'u001', bestTime: 9.55, wordCount: 30 },
            { rank: 2, displayName: 'OldChamp1', userId: 'old1', bestTime: 10.11, wordCount: 30 },
            { rank: 3, displayName: 'OldChamp2', userId: 'old2', bestTime: 10.77, wordCount: 30 },
        ]
    },
    {
        month: 'มีนาคม', monthIndex: 3, year: 2023, top3: [
            { rank: 1, displayName: 'OldChamp2', userId: 'old2', bestTime: 9.33, wordCount: 30 },
            { rank: 2, displayName: 'OldChamp3', userId: 'old3', bestTime: 9.88, wordCount: 30 },
            { rank: 3, displayName: 'สมหญิง ฉลาด', userId: 'u002', bestTime: 10.22, wordCount: 29 },
        ]
    },
];

// Mock Data - Current Vocab Set
const mockVocabSet: VocabWord[] = [
    { id: '1', front: 'accomplish', partOfSpeech: 'verb', back: 'ทำให้สำเร็จ', difficulty: 'medium' },
    { id: '2', front: 'negotiate', partOfSpeech: 'verb', back: 'เจรจาต่อรอง', difficulty: 'hard' },
    { id: '3', front: 'analyze', partOfSpeech: 'verb', back: 'วิเคราะห์', difficulty: 'medium' },
    { id: '4', front: 'implement', partOfSpeech: 'verb', back: 'นำไปปฏิบัติ', difficulty: 'medium' },
    { id: '5', front: 'strategy', partOfSpeech: 'noun', back: 'กลยุทธ์', difficulty: 'easy' },
    { id: '6', front: 'revenue', partOfSpeech: 'noun', back: 'รายได้', difficulty: 'medium' },
    { id: '7', front: 'efficient', partOfSpeech: 'adjective', back: 'มีประสิทธิภาพ', difficulty: 'easy' },
    { id: '8', front: 'collaborate', partOfSpeech: 'verb', back: 'ร่วมมือ', difficulty: 'medium' },
    { id: '9', front: 'innovative', partOfSpeech: 'adjective', back: 'สร้างสรรค์', difficulty: 'easy' },
    { id: '10', front: 'sustainable', partOfSpeech: 'adjective', back: 'ยั่งยืน', difficulty: 'hard' },
];

// Mock Data - Daily Players
interface DailyPlayer {
    date: string;
    userId: string;
    displayName: string;
    email: string;
    gamesPlayed: number;
    bestTime: number;
    wordCount: number;
    accuracy: number;
}

const mockDailyPlayers: DailyPlayer[] = [
    { date: '2024-12-14', userId: 'u001', displayName: 'สมชาย เก่งมาก', email: 'somchai@example.com', gamesPlayed: 5, bestTime: 8.43, wordCount: 30, accuracy: 100 },
    { date: '2024-12-14', userId: 'u002', displayName: 'สมหญิง ฉลาด', email: 'somying@example.com', gamesPlayed: 3, bestTime: 9.21, wordCount: 30, accuracy: 100 },
    { date: '2024-12-14', userId: 'u003', displayName: 'JohnDoe123', email: 'john@example.com', gamesPlayed: 2, bestTime: 10.54, wordCount: 30, accuracy: 96.7 },
    { date: '2024-12-14', userId: 'u004', displayName: 'VocabMaster', email: 'master@example.com', gamesPlayed: 4, bestTime: 11.89, wordCount: 29, accuracy: 93.3 },
    { date: '2024-12-14', userId: 'u005', displayName: 'EnglishPro', email: 'pro@example.com', gamesPlayed: 1, bestTime: 12.34, wordCount: 28, accuracy: 93.3 },
    { date: '2024-12-13', userId: 'u001', displayName: 'สมชาย เก่งมาก', email: 'somchai@example.com', gamesPlayed: 3, bestTime: 8.55, wordCount: 30, accuracy: 100 },
    { date: '2024-12-13', userId: 'u006', displayName: 'QuickLearner', email: 'quick@example.com', gamesPlayed: 2, bestTime: 13.56, wordCount: 27, accuracy: 90 },
    { date: '2024-12-13', userId: 'u007', displayName: 'WordNinja', email: 'ninja@example.com', gamesPlayed: 6, bestTime: 14.21, wordCount: 26, accuracy: 86.7 },
    { date: '2024-12-12', userId: 'u002', displayName: 'สมหญิง ฉลาด', email: 'somying@example.com', gamesPlayed: 4, bestTime: 9.33, wordCount: 30, accuracy: 100 },
    { date: '2024-12-12', userId: 'u008', displayName: 'StudyHard', email: 'study@example.com', gamesPlayed: 2, bestTime: 15.78, wordCount: 25, accuracy: 83.3 },
];

// Mock Data - Monthly Analytics
interface MonthlyAnalytics {
    month: string;
    monthIndex: number;
    year: number;
    uniquePlayers: number;
    totalGames: number;
    avgTimePerGame: number;
    avgAccuracy: number;
    newPlayers: number;
    returningPlayers: number;
    perfectScores: number;
    avgGamesPerPlayer: number;
    peakHour: string;
    peakDay: string;
}

const mockMonthlyAnalytics: MonthlyAnalytics[] = [
    { month: 'ธันวาคม', monthIndex: 12, year: 2024, uniquePlayers: 342, totalGames: 4567, avgTimePerGame: 12.45, avgAccuracy: 87.2, newPlayers: 89, returningPlayers: 253, perfectScores: 234, avgGamesPerPlayer: 13.4, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
    { month: 'พฤศจิกายน', monthIndex: 11, year: 2024, uniquePlayers: 298, totalGames: 3890, avgTimePerGame: 13.12, avgAccuracy: 85.8, newPlayers: 67, returningPlayers: 231, perfectScores: 189, avgGamesPerPlayer: 13.1, peakHour: '19:00-20:00', peakDay: 'วันเสาร์' },
    { month: 'ตุลาคม', monthIndex: 10, year: 2024, uniquePlayers: 312, totalGames: 4123, avgTimePerGame: 12.88, avgAccuracy: 86.5, newPlayers: 78, returningPlayers: 234, perfectScores: 211, avgGamesPerPlayer: 13.2, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
    { month: 'กันยายน', monthIndex: 9, year: 2024, uniquePlayers: 275, totalGames: 3456, avgTimePerGame: 13.55, avgAccuracy: 84.3, newPlayers: 56, returningPlayers: 219, perfectScores: 167, avgGamesPerPlayer: 12.6, peakHour: '21:00-22:00', peakDay: 'วันศุกร์' },
    { month: 'สิงหาคม', monthIndex: 8, year: 2024, uniquePlayers: 289, totalGames: 3678, avgTimePerGame: 13.21, avgAccuracy: 85.1, newPlayers: 61, returningPlayers: 228, perfectScores: 178, avgGamesPerPlayer: 12.7, peakHour: '19:00-20:00', peakDay: 'วันเสาร์' },
    { month: 'กรกฎาคม', monthIndex: 7, year: 2024, uniquePlayers: 301, totalGames: 3890, avgTimePerGame: 12.95, avgAccuracy: 86.0, newPlayers: 72, returningPlayers: 229, perfectScores: 195, avgGamesPerPlayer: 12.9, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
    { month: 'มิถุนายน', monthIndex: 6, year: 2024, uniquePlayers: 267, totalGames: 3234, avgTimePerGame: 13.78, avgAccuracy: 83.9, newPlayers: 48, returningPlayers: 219, perfectScores: 145, avgGamesPerPlayer: 12.1, peakHour: '18:00-19:00', peakDay: 'วันเสาร์' },
    { month: 'พฤษภาคม', monthIndex: 5, year: 2024, uniquePlayers: 245, totalGames: 2987, avgTimePerGame: 14.02, avgAccuracy: 83.2, newPlayers: 42, returningPlayers: 203, perfectScores: 132, avgGamesPerPlayer: 12.2, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
    { month: 'เมษายน', monthIndex: 4, year: 2024, uniquePlayers: 234, totalGames: 2765, avgTimePerGame: 14.33, avgAccuracy: 82.8, newPlayers: 38, returningPlayers: 196, perfectScores: 118, avgGamesPerPlayer: 11.8, peakHour: '19:00-20:00', peakDay: 'วันเสาร์' },
    { month: 'มีนาคม', monthIndex: 3, year: 2024, uniquePlayers: 223, totalGames: 2543, avgTimePerGame: 14.56, avgAccuracy: 82.1, newPlayers: 35, returningPlayers: 188, perfectScores: 105, avgGamesPerPlayer: 11.4, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
    { month: 'กุมภาพันธ์', monthIndex: 2, year: 2024, uniquePlayers: 198, totalGames: 2234, avgTimePerGame: 15.01, avgAccuracy: 81.5, newPlayers: 28, returningPlayers: 170, perfectScores: 89, avgGamesPerPlayer: 11.3, peakHour: '19:00-20:00', peakDay: 'วันเสาร์' },
    { month: 'มกราคม', monthIndex: 1, year: 2024, uniquePlayers: 178, totalGames: 1987, avgTimePerGame: 15.34, avgAccuracy: 80.8, newPlayers: 45, returningPlayers: 133, perfectScores: 72, avgGamesPerPlayer: 11.2, peakHour: '20:00-21:00', peakDay: 'วันอาทิตย์' },
];

export default function AdminVocabChallenge() {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddVocabOpen, setIsAddVocabOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const [isGameActive, setIsGameActive] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [selectedDate, setSelectedDate] = useState('2024-12-14');
    const [playerSearch, setPlayerSearch] = useState('');
    const [analyticsYear, setAnalyticsYear] = useState(2024);
    const [selectedMonthDetail, setSelectedMonthDetail] = useState<MonthlyAnalytics | null>(null);
    const [challengeMode, setChallengeMode] = useState<'individual' | 'university'>('individual');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Individual Mode - Month/Year selection for vocab
    const currentDate = new Date();
    const [selectedIndividualMonth, setSelectedIndividualMonth] = useState(currentDate.getMonth() + 1); // 1-12
    const [selectedIndividualYear, setSelectedIndividualYear] = useState(currentDate.getFullYear());
    const [loadingIndividualVocab, setLoadingIndividualVocab] = useState(false);
    const [savingVocab, setSavingVocab] = useState(false);

    // Mode-specific vocab sets
    const [individualVocabSet, setIndividualVocabSet] = useState<VocabWord[]>([]);
    const [universityVocabSet, setUniversityVocabSet] = useState<VocabWord[]>(mockVocabSet);

    // New vocab form
    const [newVocab, setNewVocab] = useState({ front: '', partOfSpeech: 'noun', back: '' });

    // Thai month names
    const thaiMonthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    // Fetch Individual vocab from database when month/year changes
    useEffect(() => {
        if (challengeMode === 'individual') {
            fetchIndividualVocab();
        }
    }, [selectedIndividualMonth, selectedIndividualYear, challengeMode]);

    const fetchIndividualVocab = async () => {
        setLoadingIndividualVocab(true);
        try {
            const { data, error } = await supabase
                .from('individual_challenge_vocab')
                .select('*')
                .eq('month', selectedIndividualMonth)
                .eq('year', selectedIndividualYear)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const vocabWords: VocabWord[] = (data || []).map((item: any, idx: number) => ({
                id: item.id,
                front: item.front,
                partOfSpeech: item.part_of_speech || 'noun',
                back: item.back,
            }));

            setIndividualVocabSet(vocabWords);
        } catch (error) {
            console.error('Error fetching individual vocab:', error);
            toast.error('ไม่สามารถโหลดคำศัพท์ได้');
        } finally {
            setLoadingIndividualVocab(false);
        }
    };

    const handleAddIndividualVocab = async () => {
        if (!newVocab.front || !newVocab.back) {
            toast.error('กรุณากรอกคำศัพท์และความหมาย');
            return;
        }
        if (individualVocabSet.length >= 30) {
            toast.error('มีคำศัพท์ครบ 30 คำแล้ว');
            return;
        }

        setSavingVocab(true);
        try {
            const { data, error } = await supabase
                .from('individual_challenge_vocab')
                .insert({
                    month: selectedIndividualMonth,
                    year: selectedIndividualYear,
                    front: newVocab.front.trim(),
                    back: newVocab.back.trim(),
                    part_of_speech: newVocab.partOfSpeech,
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    toast.error('คำศัพท์นี้มีอยู่แล้วในเดือนนี้');
                    return;
                }
                throw error;
            }

            setIndividualVocabSet([...individualVocabSet, {
                id: data.id,
                front: data.front,
                partOfSpeech: data.part_of_speech || 'noun',
                back: data.back,
            }]);
            setNewVocab({ front: '', partOfSpeech: 'noun', back: '' });
            setIsAddVocabOpen(false);
            toast.success('เพิ่มคำศัพท์สำเร็จ');
        } catch (error) {
            console.error('Error adding vocab:', error);
            toast.error('ไม่สามารถเพิ่มคำศัพท์ได้');
        } finally {
            setSavingVocab(false);
        }
    };

    const handleDeleteIndividualVocab = async (id: string) => {
        try {
            const { error } = await supabase
                .from('individual_challenge_vocab')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setIndividualVocabSet(individualVocabSet.filter(v => v.id !== id));
            toast.success('ลบคำศัพท์สำเร็จ');
        } catch (error) {
            console.error('Error deleting vocab:', error);
            toast.error('ไม่สามารถลบคำศัพท์ได้');
        }
    };

    // Mode-specific rankings and stats
    const rankings = challengeMode === 'individual' ? mockIndividualRankings : mockUniversityRankings;
    const vocabSet = challengeMode === 'individual' ? individualVocabSet : universityVocabSet;
    const setVocabSet = challengeMode === 'individual' ? setIndividualVocabSet : setUniversityVocabSet;

    // Mode-specific Stats
    const stats = challengeMode === 'individual'
        ? { totalPlayers: 1856, todayPlayers: 234, avgBestTime: 11.23, totalGamesPlayed: 12456, activePlayersNow: 18 }
        : { totalPlayers: 2847, todayPlayers: 342, avgBestTime: 12.45, totalGamesPlayed: 15678, activePlayersNow: 23 };

    // Filter rankings
    const filteredRankings = rankings.filter(r =>
        r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split('\n').filter(line => line.trim());

            // Skip header if exists
            const startIndex = lines[0].toLowerCase().includes('front') ? 1 : 0;

            const newWords: VocabWord[] = [];
            for (let i = startIndex; i < lines.length && newWords.length < 30; i++) {
                const [front, partOfSpeech, back] = lines[i].split(',').map(s => s.trim());
                if (front && back) {
                    newWords.push({
                        id: `csv-${Date.now()}-${i}`,
                        front,
                        partOfSpeech: partOfSpeech || 'noun',
                        back,
                    });
                }
            }

            if (newWords.length > 0) {
                setVocabSet(newWords);
                toast.success(`นำเข้าสำเร็จ ${newWords.length} คำ`);
            } else {
                toast.error('ไม่พบข้อมูลที่ถูกต้องในไฟล์');
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddVocab = () => {
        if (!newVocab.front || !newVocab.back) return;

        if (vocabSet.length >= 30) {
            toast.error('มีคำศัพท์ครบ 30 คำแล้ว');
            return;
        }

        setVocabSet([...vocabSet, {
            id: Date.now().toString(),
            front: newVocab.front,
            partOfSpeech: newVocab.partOfSpeech,
            back: newVocab.back,
        }]);
        setNewVocab({ front: '', partOfSpeech: 'noun', back: '' });
        setIsAddVocabOpen(false);
        toast.success('เพิ่มคำศัพท์สำเร็จ');
    };

    const handleDeleteVocab = (id: string) => {
        setVocabSet(vocabSet.filter(v => v.id !== id));
        toast.success('ลบคำศัพท์สำเร็จ');
    };

    const handleDownloadTemplate = () => {
        const csv = 'front,partOfSpeech,back\naccomplish,verb,ทำให้สำเร็จ\nnegotiate,verb,เจรจาต่อรอง';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocab_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-amber-500" />
                        Vocab Challenge Admin
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการเกม Vocab Challenge และดูสถิติผู้เล่น</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={isGameActive ? 'default' : 'destructive'}
                        className="gap-2"
                        onClick={() => {
                            setIsGameActive(!isGameActive);
                            toast.success(isGameActive ? 'ปิดเกมชั่วคราว' : 'เปิดเกมแล้ว');
                        }}
                    >
                        {isGameActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isGameActive ? 'เกมเปิดอยู่' : 'เกมปิดอยู่'}
                    </Button>
                    <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-800">
                        <RefreshCcw className="h-4 w-4" />
                        รีเซ็ต Ranking
                    </Button>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center">
                <div className="relative bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex items-center gap-1">
                    {/* Sliding background indicator */}
                    <div
                        className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full transition-all duration-300 ease-out shadow-sm border border-slate-200 dark:border-slate-600"
                        style={{ left: challengeMode === 'individual' ? '4px' : 'calc(50%)' }}
                    />
                    <button
                        onClick={() => setChallengeMode('individual')}
                        className={`relative z-10 px-6 py-2 text-sm font-bold tracking-wider transition-colors text-center rounded-full ${challengeMode === 'individual' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        🎯 INDIVIDUAL
                    </button>
                    <button
                        onClick={() => setChallengeMode('university')}
                        className={`relative z-10 px-6 py-2 text-sm font-bold tracking-wider transition-colors text-center rounded-full ${challengeMode === 'university' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        🏫 UNIVERSITY
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPlayers.toLocaleString()}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ผู้เล่นทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Eye className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayPlayers}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">เล่นวันนี้</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activePlayersNow}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">เล่นอยู่ตอนนี้</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgBestTime}s</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">เวลาเฉลี่ย</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalGamesPlayed.toLocaleString()}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">เกมทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vocabSet.length}/30</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">คำศัพท์</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 bg-slate-100 dark:bg-slate-800 p-1">
                    <TabsTrigger value="overview" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <Trophy className="h-4 w-4" />
                        Ranking
                    </TabsTrigger>
                    <TabsTrigger value="dailyplayers" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <Users className="h-4 w-4" />
                        ผู้เล่นรายวัน
                    </TabsTrigger>
                    <TabsTrigger value="halloffame" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <Crown className="h-4 w-4" />
                        Hall of Fame
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <TrendingUp className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="vocabulary" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <Target className="h-4 w-4" />
                        คำศัพท์
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
                        <BarChart3 className="h-4 w-4" />
                        ตั้งค่า
                    </TabsTrigger>
                </TabsList>


                {/* Rankings Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                        <Crown className="h-5 w-5 text-amber-500" />
                                        Leaderboard
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">อันดับผู้เล่นที่ทำเวลาได้ดีที่สุด</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="ค้นหาชื่อ, Email, ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-[250px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                                        <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ตลอดกาล</SelectItem>
                                            <SelectItem value="month">เดือนนี้</SelectItem>
                                            <SelectItem value="week">สัปดาห์นี้</SelectItem>
                                            <SelectItem value="today">วันนี้</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[80px] text-center font-semibold text-slate-700 dark:text-slate-300">อันดับ</TableHead>
                                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">ผู้เล่น</TableHead>
                                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">User ID</TableHead>
                                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">เวลาดีที่สุด</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">คำที่ทำได้</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Accuracy</TableHead>
                                            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">เกมทั้งหมด</TableHead>
                                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">เล่นล่าสุด</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRankings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center text-slate-400 dark:text-slate-500 py-8">
                                                    ไม่พบข้อมูล
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRankings.map((entry) => (
                                                <TableRow key={entry.userId} className={entry.rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center">
                                                            {getRankBadge(entry.rank)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-600">
                                                                {entry.displayName.substring(0, 1).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-900 dark:text-white">{entry.displayName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{entry.userId}</TableCell>
                                                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">{entry.email}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-mono bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                                            {entry.bestTime.toFixed(4)}s
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-700 dark:text-slate-300">{entry.bestWordCount}/30</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={entry.accuracy >= 90 ? 'text-green-600 font-medium' : entry.accuracy >= 70 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                                                            {entry.accuracy}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-700 dark:text-slate-300">{entry.gamesPlayed}</TableCell>
                                                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                                                        {new Date(entry.lastPlayed).toLocaleDateString('th-TH', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Daily Players Tab */}
                <TabsContent value="dailyplayers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        ผู้เล่นรายวัน
                                    </CardTitle>
                                    <CardDescription>ผู้ใช้ที่เข้ามาเล่น Vocab Challenge ในแต่ละวัน</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            placeholder="ค้นหาผู้เล่น..."
                                            value={playerSearch}
                                            onChange={(e) => setPlayerSearch(e.target.value)}
                                            className="pl-10 w-[200px]"
                                        />
                                    </div>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-[160px]"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                    <p className="text-sm text-muted-foreground">ผู้เล่นวันนี้</p>
                                    <p className="text-2xl font-bold text-blue-600">{mockDailyPlayers.filter(p => p.date === selectedDate).length}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                                    <p className="text-sm text-muted-foreground">เกมทั้งหมด</p>
                                    <p className="text-2xl font-bold text-green-600">{mockDailyPlayers.filter(p => p.date === selectedDate).reduce((a, b) => a + b.gamesPlayed, 0)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">เวลาเฉลี่ย</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {(mockDailyPlayers.filter(p => p.date === selectedDate).reduce((a, b) => a + b.bestTime, 0) / Math.max(mockDailyPlayers.filter(p => p.date === selectedDate).length, 1)).toFixed(2)}s
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                    <p className="text-sm text-muted-foreground">100% ถูกต้อง</p>
                                    <p className="text-2xl font-bold text-purple-600">{mockDailyPlayers.filter(p => p.date === selectedDate && p.accuracy === 100).length}</p>
                                </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>ผู้เล่น</TableHead>
                                            <TableHead>User ID</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-center">เกมที่เล่น</TableHead>
                                            <TableHead className="text-center">เวลาดีที่สุด</TableHead>
                                            <TableHead className="text-center">คำที่ทำได้</TableHead>
                                            <TableHead className="text-center">Accuracy</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockDailyPlayers
                                            .filter(p => p.date === selectedDate)
                                            .filter(p => playerSearch === '' || p.displayName.toLowerCase().includes(playerSearch.toLowerCase()) || p.email.toLowerCase().includes(playerSearch.toLowerCase()))
                                            .length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-slate-400 dark:text-slate-500 py-8">
                                                    ไม่มีข้อมูลผู้เล่นในวันที่เลือก
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            mockDailyPlayers
                                                .filter(p => p.date === selectedDate)
                                                .filter(p => playerSearch === '' || p.displayName.toLowerCase().includes(playerSearch.toLowerCase()) || p.email.toLowerCase().includes(playerSearch.toLowerCase()))
                                                .map((player, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                                    {player.displayName.substring(0, 1).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium">{player.displayName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">{player.userId}</TableCell>
                                                        <TableCell className="text-sm">{player.email}</TableCell>
                                                        <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="font-mono">{player.bestTime.toFixed(2)}s</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold">{player.wordCount}/30</TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={player.accuracy >= 90 ? 'text-green-600' : player.accuracy >= 70 ? 'text-amber-600' : 'text-red-600'}>
                                                                {player.accuracy}%
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                        Analytics - สถิติการใช้งานย้อนหลัง
                                    </CardTitle>
                                    <CardDescription>ข้อมูลสำหรับ Data Analysis (คลิกที่แถวเพื่อดูรายละเอียด)</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={analyticsYear.toString()} onValueChange={(v) => setAnalyticsYear(parseInt(v))}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2024">ปี 2024</SelectItem>
                                            <SelectItem value="2023">ปี 2023</SelectItem>
                                            <SelectItem value="2022">ปี 2022</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>เดือน</TableHead>
                                            <TableHead className="text-center">ผู้เล่น</TableHead>
                                            <TableHead className="text-center">เกมทั้งหมด</TableHead>
                                            <TableHead className="text-center">เวลาเฉลี่ย</TableHead>
                                            <TableHead className="text-center">Accuracy</TableHead>
                                            <TableHead className="text-center">ผู้เล่นใหม่</TableHead>
                                            <TableHead className="text-center">ผู้เล่นกลับมา</TableHead>
                                            <TableHead className="text-center">100% Score</TableHead>
                                            <TableHead className="text-center">เกม/คน</TableHead>
                                            <TableHead>Peak Hour</TableHead>
                                            <TableHead>Peak Day</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockMonthlyAnalytics
                                            .filter(d => d.year === analyticsYear)
                                            .sort((a, b) => b.monthIndex - a.monthIndex)
                                            .map((data, idx) => (
                                                <TableRow
                                                    key={idx}
                                                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                                                    onClick={() => setSelectedMonthDetail(data)}
                                                >
                                                    <TableCell className="font-medium">{data.month} {data.year}</TableCell>
                                                    <TableCell className="text-center">{data.uniquePlayers.toLocaleString()}</TableCell>
                                                    <TableCell className="text-center">{data.totalGames.toLocaleString()}</TableCell>
                                                    <TableCell className="text-center">{data.avgTimePerGame}s</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={data.avgAccuracy >= 85 ? 'text-green-600' : data.avgAccuracy >= 80 ? 'text-amber-600' : 'text-red-600'}>
                                                            {data.avgAccuracy}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-green-600">+{data.newPlayers}</TableCell>
                                                    <TableCell className="text-center text-blue-600">{data.returningPlayers}</TableCell>
                                                    <TableCell className="text-center text-purple-600">{data.perfectScores}</TableCell>
                                                    <TableCell className="text-center">{data.avgGamesPerPlayer}</TableCell>
                                                    <TableCell className="text-xs">{data.peakHour}</TableCell>
                                                    <TableCell className="text-xs">{data.peakDay}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-muted-foreground">Avg Monthly Players ({analyticsYear})</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {Math.round(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).reduce((a, b) => a + b.uniquePlayers, 0) / Math.max(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).length, 1))}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Avg Monthly Games</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {Math.round(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).reduce((a, b) => a + b.totalGames, 0) / Math.max(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).length, 1)).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).reduce((a, b) => a + b.avgAccuracy, 0) / Math.max(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).length, 1)).toFixed(1)}%
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-muted-foreground">Retention Rate</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {((mockMonthlyAnalytics.filter(d => d.year === analyticsYear).reduce((a, b) => a + b.returningPlayers, 0) / Math.max(mockMonthlyAnalytics.filter(d => d.year === analyticsYear).reduce((a, b) => a + b.uniquePlayers, 0), 1)) * 100).toFixed(1)}%
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Month Detail Dialog */}
                    <Dialog open={selectedMonthDetail !== null} onOpenChange={(open) => !open && setSelectedMonthDetail(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    รายละเอียด {selectedMonthDetail?.month} {selectedMonthDetail?.year}
                                </DialogTitle>
                                <DialogDescription>สถิติการใช้งาน Vocab Challenge ในเดือนนี้</DialogDescription>
                            </DialogHeader>
                            {selectedMonthDetail && (
                                <div className="space-y-6">
                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 text-center">
                                            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-blue-600">{selectedMonthDetail.uniquePlayers}</p>
                                            <p className="text-xs text-muted-foreground">ผู้เล่นทั้งหมด</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 text-center">
                                            <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-600">{selectedMonthDetail.totalGames.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">เกมทั้งหมด</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-center">
                                            <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-amber-600">{selectedMonthDetail.avgTimePerGame}s</p>
                                            <p className="text-xs text-muted-foreground">เวลาเฉลี่ย</p>
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground">ผู้เล่น</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">ผู้เล่นใหม่</span>
                                                    <Badge variant="secondary" className="text-green-600">+{selectedMonthDetail.newPlayers}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">ผู้เล่นกลับมา</span>
                                                    <Badge variant="secondary" className="text-blue-600">{selectedMonthDetail.returningPlayers}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">เกมเฉลี่ย/คน</span>
                                                    <Badge variant="secondary">{selectedMonthDetail.avgGamesPerPlayer}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground">ผลลัพธ์</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">Accuracy เฉลี่ย</span>
                                                    <Badge variant="secondary" className={selectedMonthDetail.avgAccuracy >= 85 ? 'text-green-600' : 'text-amber-600'}>
                                                        {selectedMonthDetail.avgAccuracy}%
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">100% Score</span>
                                                    <Badge variant="secondary" className="text-purple-600">{selectedMonthDetail.perfectScores}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                    <span className="text-sm">Retention Rate</span>
                                                    <Badge variant="secondary">
                                                        {((selectedMonthDetail.returningPlayers / selectedMonthDetail.uniquePlayers) * 100).toFixed(1)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peak Times */}
                                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">ช่วงเวลาที่คนเล่นมากที่สุด</h4>
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Peak Hour</p>
                                                <p className="text-lg font-bold text-purple-600">{selectedMonthDetail.peakHour}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Peak Day</p>
                                                <p className="text-lg font-bold text-pink-600">{selectedMonthDetail.peakDay}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedMonthDetail(null)}>ปิด</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Hall of Fame Tab */}

                <TabsContent value="halloffame" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Crown className="h-5 w-5 text-amber-500" />
                                        Hall of Fame - Top 3 ประจำเดือน
                                    </CardTitle>
                                    <CardDescription>บันทึกผู้เล่นที่ทำเวลาดีที่สุดในแต่ละเดือน</CardDescription>
                                </div>
                                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">ปี 2024</SelectItem>
                                        <SelectItem value="2023">ปี 2023</SelectItem>
                                        <SelectItem value="2022">ปี 2022</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {mockHallOfFame
                                    .filter(m => m.year === selectedYear)
                                    .sort((a, b) => a.monthIndex - b.monthIndex)
                                    .map((monthData, monthIdx) => (
                                        <div key={monthIdx} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-3 border-b">
                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {monthData.month} {monthData.year}
                                                </h3>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                                                        <TableHead className="w-[80px] text-center">อันดับ</TableHead>
                                                        <TableHead>ชื่อผู้เล่น</TableHead>
                                                        <TableHead>User ID</TableHead>
                                                        <TableHead className="text-center">เวลา</TableHead>
                                                        <TableHead className="text-center">คำที่ทำได้</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {monthData.top3.map((champion) => (
                                                        <TableRow
                                                            key={champion.userId}
                                                            className={champion.rank === 1 ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}
                                                        >
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center">
                                                                    {champion.rank === 1 && <Crown className="h-5 w-5 text-yellow-500" />}
                                                                    {champion.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                                                                    {champion.rank === 3 && <Award className="h-5 w-5 text-orange-600" />}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${champion.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                                                        champion.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                                            'bg-gradient-to-br from-orange-400 to-orange-600'
                                                                        }`}>
                                                                        {champion.displayName.substring(0, 1).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium">{champion.displayName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                                {champion.userId}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="secondary" className="font-mono">
                                                                    {champion.bestTime.toFixed(2)}s
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold">
                                                                {champion.wordCount}/30
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Vocabulary Tab */}
                <TabsContent value="vocabulary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        {challengeMode === 'individual' ? (
                                            <span>คำศัพท์ {thaiMonthNames[selectedIndividualMonth - 1]} {selectedIndividualYear + 543} ({vocabSet.length}/30 คำ)</span>
                                        ) : (
                                            <span>คำศัพท์ปัจจุบัน ({vocabSet.length}/30 คำ)</span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {challengeMode === 'individual'
                                            ? 'เลือกเดือนเพื่อจัดการคำศัพท์ Individual Challenge'
                                            : 'คำศัพท์ที่ใช้ในเกม Vocab Challenge'}
                                    </CardDescription>
                                </div>

                                {/* Month/Year Selector for INDIVIDUAL Mode */}
                                {challengeMode === 'individual' && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50">
                                        <Calendar className="h-5 w-5 text-purple-500" />
                                        <Select
                                            value={selectedIndividualMonth.toString()}
                                            onValueChange={(v) => setSelectedIndividualMonth(parseInt(v))}
                                        >
                                            <SelectTrigger className="w-[130px] bg-white dark:bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {thaiMonthNames.map((month, idx) => (
                                                    <SelectItem key={idx} value={(idx + 1).toString()}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={selectedIndividualYear.toString()}
                                            onValueChange={(v) => setSelectedIndividualYear(parseInt(v))}
                                        >
                                            <SelectTrigger className="w-[100px] bg-white dark:bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[2024, 2025, 2026, 2027].map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year + 543}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
                                        <Download className="h-4 w-4" />
                                        Template CSV
                                    </Button>
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Button variant="outline" className="gap-2">
                                            <Upload className="h-4 w-4" />
                                            Upload CSV
                                        </Button>
                                    </div>
                                    <Dialog open={isAddVocabOpen} onOpenChange={setIsAddVocabOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2" disabled={vocabSet.length >= 30}>
                                                <Plus className="h-4 w-4" />
                                                เพิ่มคำ
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>เพิ่มคำศัพท์ใหม่</DialogTitle>
                                                <DialogDescription>กรอกข้อมูลคำศัพท์</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Front (คำศัพท์)</Label>
                                                    <Input
                                                        placeholder="เช่น accomplish"
                                                        value={newVocab.front}
                                                        onChange={(e) => setNewVocab({ ...newVocab, front: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Part of Speech</Label>
                                                    <Select
                                                        value={newVocab.partOfSpeech}
                                                        onValueChange={(value) => setNewVocab({ ...newVocab, partOfSpeech: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="noun">noun</SelectItem>
                                                            <SelectItem value="verb">verb</SelectItem>
                                                            <SelectItem value="adjective">adjective</SelectItem>
                                                            <SelectItem value="adverb">adverb</SelectItem>
                                                            <SelectItem value="preposition">preposition</SelectItem>
                                                            <SelectItem value="conjunction">conjunction</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Back (ความหมาย)</Label>
                                                    <Input
                                                        placeholder="เช่น ทำให้สำเร็จ"
                                                        value={newVocab.back}
                                                        onChange={(e) => setNewVocab({ ...newVocab, back: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => setIsAddVocabOpen(false)} variant="outline">ยกเลิก</Button>
                                                <Button
                                                    onClick={challengeMode === 'individual' ? handleAddIndividualVocab : handleAddVocab}
                                                    disabled={!newVocab.front || !newVocab.back || savingVocab}
                                                >
                                                    {savingVocab ? 'กำลังบันทึก...' : 'เพิ่มคำศัพท์'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[50px] text-center">#</TableHead>
                                            <TableHead>Front (คำศัพท์)</TableHead>
                                            <TableHead className="w-[150px]">Part of Speech</TableHead>
                                            <TableHead>Back (ความหมาย)</TableHead>
                                            <TableHead className="w-[100px] text-center">การกระทำ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingIndividualVocab && challengeMode === 'individual' ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="flex items-center justify-center gap-2 text-purple-500">
                                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                                        กำลังโหลดคำศัพท์...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : vocabSet.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    {challengeMode === 'individual'
                                                        ? `ยังไม่มีคำศัพท์สำหรับ ${thaiMonthNames[selectedIndividualMonth - 1]} ${selectedIndividualYear + 543}`
                                                        : 'ยังไม่มีคำศัพท์ กรุณาเพิ่มหรือ Upload CSV'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            vocabSet.map((word, index) => (
                                                <TableRow key={word.id}>
                                                    <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{word.front}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{word.partOfSpeech}</Badge>
                                                    </TableCell>
                                                    <TableCell>{word.back}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => challengeMode === 'individual' ? handleDeleteIndividualVocab(word.id) : handleDeleteVocab(word.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {vocabSet.length > 0 && (
                                <div className="mt-4 flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {vocabSet.length < 30 && `ยังสามารถเพิ่มได้อีก ${30 - vocabSet.length} คำ`}
                                        {vocabSet.length === 30 && '✅ ครบ 30 คำแล้ว'}
                                    </p>
                                    <Button variant="default" className="gap-2" disabled={vocabSet.length === 0}>
                                        บันทึกและใช้ชุดนี้
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    กิจกรรมรายวัน
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { day: 'วันนี้', players: 342, games: 1256, avgTime: 12.4 },
                                        { day: 'เมื่อวาน', players: 298, games: 1089, avgTime: 13.1 },
                                        { day: 'เมื่อวานซืน', players: 312, games: 1178, avgTime: 12.8 },
                                        { day: '3 วันก่อน', players: 275, games: 956, avgTime: 13.5 },
                                        { day: '4 วันก่อน', players: 289, games: 1023, avgTime: 13.2 },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <span className="font-medium">{item.day}</span>
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-blue-600">{item.players} คน</span>
                                                <span className="text-green-600">{item.games} เกม</span>
                                                <span className="text-amber-600">{item.avgTime}s เฉลี่ย</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performers Today */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                    Top 5 วันนี้
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {rankings.slice(0, 5).map((entry, idx) => (
                                        <div key={entry.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{entry.displayName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{entry.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">{entry.bestTime.toFixed(4)}s</p>
                                                <p className="text-xs text-muted-foreground">{entry.bestWordCount}/30 คำ</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Game Configuration */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-500" />
                                    การตั้งค่าเกม
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">จำนวนคำ</p>
                                        <p className="text-2xl font-bold">30 คำ</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">เวลาจับ</p>
                                        <p className="text-2xl font-bold">ไม่จำกัด</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">สถานะเกม</p>
                                        <p className="text-2xl font-bold text-green-600">เปิดใช้งาน</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">รีเซ็ตล่าสุด</p>
                                        <p className="text-2xl font-bold">1 ธ.ค.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
