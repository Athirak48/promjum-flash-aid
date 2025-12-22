import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class LearningErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in Learning Session:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        } else {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-6">
                    <Card className="w-full max-w-sm bg-white/90 backdrop-blur shadow-xl border-red-100">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800">เกิดข้อผิดพลาด</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    ระบบขัดข้องชั่วคราว
                                </p>
                                <p className="text-xs text-red-400 mt-2 bg-red-50 p-2 rounded box-border font-mono break-words">
                                    {this.state.error?.message || "Unknown Error"}
                                </p>
                            </div>

                            <Button
                                onClick={this.handleRetry}
                                className="w-full bg-red-500 hover:bg-red-600 text-white gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                ลองใหม่อีกครั้ง
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
