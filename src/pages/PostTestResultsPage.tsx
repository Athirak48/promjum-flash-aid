import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Download, Share2, CheckCircle2, XCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function PostTestResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const certificateRef = useRef<HTMLDivElement>(null);

    const correct = location.state?.correct || 0;
    const total = location.state?.total || 0;
    const score = location.state?.score || 0;
    const wrongWords = location.state?.wrongWords || [];
    const goalName = location.state?.goalName || 'Study Goal';
    const testMode = location.state?.testMode || 'all_words';

    const isPassed = score >= 80; // 80% = Pass
    const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 85 ? 'B+' : score >= 80 ? 'B' : score >= 75 ? 'C' : 'F';

    const downloadCertificate = async () => {
        // TODO: Implement html2canvas in production
        // For now, just show a success message
        toast({
            title: 'Certificate Ready!',
            description: 'Download feature coming soon',
            className: 'bg-green-500 text-white'
        });
    };

    const shareCertificate = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `I completed ${goalName}!`,
                    text: `I scored ${score}% on my final exam! 🎉`,
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            toast({
                title: 'Share not supported',
                description: 'Web Share API not available in this browser',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="w-full max-w-4xl space-y-6">
                {/* Main Results Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
                        <CardHeader className="text-center space-y-4">
                            {/* Trophy Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${isPassed
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-600'
                                    }`}
                            >
                                <Trophy className="h-10 w-10 text-white" />
                            </motion.div>

                            <div>
                                <CardTitle className="text-3xl mb-2">
                                    {isPassed ? 'Congratulations! 🎉' : 'Test Complete'}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {isPassed ? 'You passed the final exam!' : 'Keep practicing to improve your score'}
                                </CardDescription>
                            </div>

                            {/* Grade Badge */}
                            <div className="flex items-center justify-center gap-2">
                                <Badge
                                    variant={isPassed ? 'default' : 'secondary'}
                                    className={`text-2xl px-6 py-2 ${isPassed ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
                                >
                                    Grade: {grade}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Score Display */}
                            <div className="text-center space-y-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: 'spring' }}
                                    className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                                >
                                    {score}%
                                </motion.div>
                                <p className="text-muted-foreground">
                                    {correct} out of {total} correct
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Accuracy</span>
                                    <span>{score}%</span>
                                </div>
                                <Progress value={score} className="h-3" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                                    <CardContent className="p-4 text-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-green-700">{correct}</p>
                                        <p className="text-xs text-muted-foreground">Correct</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                                    <CardContent className="p-4 text-center">
                                        <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-red-700">{total - correct}</p>
                                        <p className="text-xs text-muted-foreground">Wrong</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                                    <CardContent className="p-4 text-center">
                                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-yellow-700">{grade}</p>
                                        <p className="text-xs text-muted-foreground">Grade</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Wrong Words List */}
                            {wrongWords.length > 0 && (
                                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
                                    <CardHeader>
                                        <CardTitle className="text-base">Words to Review ({wrongWords.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="max-h-40 overflow-y-auto space-y-2">
                                        {wrongWords.slice(0, 10).map((word, idx) => (
                                            <div key={idx} className="flex justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded">
                                                <span className="font-medium">{word.front}</span>
                                                <div className="flex gap-2">
                                                    <span className="text-red-600 line-through">{word.back}</span>
                                                    <span className="text-green-600">→ {word.correct}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {wrongWords.length > 10 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                +{wrongWords.length - 10} more words
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                {isPassed && (
                                    <>
                                        <Button
                                            onClick={downloadCertificate}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Certificate
                                        </Button>
                                        <Button
                                            onClick={shareCertificate}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    className={`flex-1 ${isPassed ? '' : 'w-full'} bg-gradient-to-r from-purple-600 to-pink-600`}
                                >
                                    {isPassed ? 'Back to Dashboard' : 'Review & Try Again'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Victory Certificate (Hidden, for download) */}
                {isPassed && (
                    <div ref={certificateRef} className="hidden">
                        <div className="w-[800px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 p-12 relative">
                            {/* Border */}
                            <div className="absolute inset-4 border-8 border-yellow-400 rounded-lg"></div>
                            <div className="absolute inset-6 border-2 border-purple-600 rounded-lg"></div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col items-center justify-center space-y-6 text-center">
                                <Award className="h-24 w-24 text-yellow-500" />
                                <h1 className="text-5xl font-bold text-purple-900">Certificate of Mastery</h1>
                                <p className="text-xl text-gray-700">This certifies that</p>
                                <p className="text-3xl font-bold text-purple-800">Student</p>
                                <p className="text-xl text-gray-700">has successfully completed</p>
                                <p className="text-2xl font-bold text-purple-800">{goalName}</p>
                                <p className="text-lg text-gray-600">with a score of</p>
                                <p className="text-4xl font-bold text-yellow-600">{score}% (Grade: {grade})</p>
                                <p className="text-sm text-gray-500 mt-8">
                                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
