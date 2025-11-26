import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { api } from '../../lib/api';

const UserReviews = ({ userId, compact = false }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (userId) {
            fetchReviews();
        }
    }, [userId]);

    const fetchReviews = async () => {
        try {
            const data = await api.get(`/reviews/user/${userId}`);
            setReviews(data);

            if (data.length > 0) {
                const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
                setAverageRating(avg);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return compact ? <div className="w-16 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div> : <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;

    if (compact) {
        return (
            <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({reviews.length})
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-bold text-lg text-gray-900 dark:text-white">
                        {averageRating.toFixed(1)}
                    </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({reviews.length} reviews)
                </span>
            </div>

            <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {review.reviewer?.full_name || review.reviewer?.username || 'Anonymous'}
                            </span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserReviews;
