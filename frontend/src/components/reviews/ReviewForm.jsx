import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '../ui/Button';
import { api } from '../../lib/api';

const ReviewForm = ({ exchangeId, revieweeId, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await api.post('/reviews', {
                exchange_id: exchangeId,
                reviewee_id: revieweeId,
                rating,
                comment
            });
            onReviewSubmitted();
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave a Review</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Comment (Optional)
                </label>
                <textarea
                    id="comment"
                    rows="3"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    placeholder="How was your experience?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;
