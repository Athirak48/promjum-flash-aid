import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TrackEventParams {
    eventType: 'navigation' | 'button_click' | 'feature_usage' | 'session';
    eventCategory?: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    metadata?: Record<string, any>;
}

/**
 * Custom hook for tracking user analytics
 * Note: This is a lightweight client-side tracking implementation.
 * Events are logged to console in development; can be extended to send to analytics service.
 */
export function useAnalytics() {
    const { user } = useAuth();

    const trackEvent = useCallback(async ({
        eventType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        metadata
    }: TrackEventParams) => {
        try {
            // Log analytics event (can be extended to send to analytics service)
            if (process.env.NODE_ENV === 'development') {
                console.log('[Analytics]', {
                    userId: user?.id,
                    eventType,
                    eventCategory,
                    eventAction,
                    eventLabel,
                    eventValue,
                    metadata,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Future: Send to analytics endpoint or third-party service
        } catch (error) {
            // Silently fail - don't disrupt user experience
            console.error('Analytics tracking error:', error);
        }
    }, [user?.id]);

    /**
     * Track page/route views
     * @param pageName - Name of the page (e.g., 'Dashboard', 'Flashcards')
     * @param category - Optional category (e.g., 'main', 'admin', 'learning')
     */
    const trackPageView = useCallback((pageName: string, category?: string) => {
        trackEvent({
            eventType: 'navigation',
            eventCategory: category || 'page',
            eventAction: 'view',
            eventLabel: pageName
        });
    }, [trackEvent]);

    /**
     * Track button clicks
     * @param buttonName - Name/label of the button
     * @param category - Category of the button (e.g., 'navbar', 'dashboard', 'learning')
     */
    const trackButtonClick = useCallback((buttonName: string, category?: string) => {
        trackEvent({
            eventType: 'button_click',
            eventCategory: category || 'general',
            eventAction: 'click',
            eventLabel: buttonName
        });
    }, [trackEvent]);

    /**
     * Track feature usage
     * @param featureName - Name of the feature
     * @param action - Action taken ('start', 'complete', 'cancel')
     * @param value - Optional numeric value (duration, score, count)
     */
    const trackFeatureUsage = useCallback((
        featureName: string,
        action?: string,
        value?: number,
        metadata?: Record<string, any>
    ) => {
        trackEvent({
            eventType: 'feature_usage',
            eventCategory: 'feature',
            eventAction: action,
            eventLabel: featureName,
            eventValue: value,
            metadata: metadata
        });
    }, [trackEvent]);

    /**
     * Track game plays
     * @param gameName - Name of the game
     * @param action - 'start' or 'complete'
     * @param score - Optional score
     */
    const trackGame = useCallback((
        gameName: string,
        action: 'start' | 'complete',
        score?: number,
        metadata?: Record<string, any>
    ) => {
        trackEvent({
            eventType: 'feature_usage',
            eventCategory: 'game',
            eventAction: action,
            eventLabel: gameName,
            eventValue: score,
            metadata: metadata
        });
    }, [trackEvent]);

    return {
        trackEvent,
        trackPageView,
        trackButtonClick,
        trackFeatureUsage,
        trackGame
    };
}

// Re-export for convenience
export default useAnalytics;
