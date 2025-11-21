import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabaseClient';

const AdminAnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error("Not authenticated");
                }
                const token = session.access_token;

                const response = await fetch('/api/admin/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }
                const data = await response.json();
                setAnalytics(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            
            {loading && <p>Loading analytics...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analytics.users}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analytics.skills}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Exchanges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analytics.exchanges}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;
