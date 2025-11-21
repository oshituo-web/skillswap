import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Shield, Mail } from 'lucide-react';

const AdminLoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/admin`,
                },
            });

            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
                    <CardDescription className="text-base">
                        Sign in with your authorized Google account to access the admin dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-6 text-lg"
                        size="lg"
                    >
                        <Mail className="w-5 h-5" />
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </Button>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Only authorized admin accounts can access the dashboard.
                            <br />
                            Contact your administrator if you need access.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLoginPage;
