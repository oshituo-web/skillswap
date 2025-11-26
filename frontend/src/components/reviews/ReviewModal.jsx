import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, exchange, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            // Determine who is being reviewed
            // If I am the proposer, I review the receiver. If I am the receiver, I review the proposer.
            // However, the exchange object passed here should ideally tell us who the 'other' person is.
            // For simplicity, let's assume the parent component passes the correct 'reviewee_id'.
            // But wait, the API needs reviewee_id.
            // Let's assume the parent handles the logic of "who to review" and passes it, OR we derive it here if we have current user context.
            // Better: Pass `revieweeId` as a prop.

            await api.post('/reviews', {
                reviewee_id: exchange.reviewee_id, // Parent must inject this
                exchange_id: exchange.id,
                rating,
                comment
            });

            toast.success('Review submitted successfully!');
            onReviewSubmitted();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rate Experience</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="focus:outline-none transition-transform hover:scale-110"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Share your experience (optional)
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white resize-none"
                                rows="4"
                                placeholder="How was the skill exchange?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit Review
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
