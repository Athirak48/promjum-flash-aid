import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useState } from 'react';

/**
 * Fake‑door button that records interest in a Pro subscription.
 * It does not perform a real payment flow yet – just tracks clicks
 * and shows a modal placeholder.
 */
export default function ProUpgradeButton() {
    const { trackButtonClick } = useAnalytics();
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        trackButtonClick('Upgrade to Pro', 'admin');
        setShowModal(true);
    };

    return (
        <>
            <Button onClick={handleClick} className="btn-space-glass">
                Upgrade to Pro (Free Trial)
            </Button>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Pro Subscription</h2>
                        <p className="mb-4">
                            This is a placeholder for the real payment flow. Users who click here are
                            interested in an ad‑free experience, AI‑enhanced features and detailed
                            analytics.
                        </p>
                        <Button onClick={() => setShowModal(false)} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
