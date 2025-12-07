import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Loader2, MapPin, Calendar, Mail, ArrowLeft, MessageSquare } from 'lucide-react';
import UserReviews from '@/components/reviews/UserReviews';
import { getDisplayName, getAvatarUrl } from '@/utils/userUtils';

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchProfileData();
        }
    }, [userId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*, bio, location, avatar_url')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch skills
            const { data: skillsData, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', userId);

            if (skillsError) throw skillsError;
            setSkills(skillsData || []);

        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            setMessageLoading(true);
            const conversation = await api.post('/chat/conversations', { participantId: userId });
            navigate('/chat', { state: { conversationId: conversation.id } });
        } catch (error) {
            console.error('Failed to start conversation', error);
        } finally {
            setMessageLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h2>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === userId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {/* Profile Header */}
                <Card className="border-none shadow-lg overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-xl overflow-hidden">
                                <img
                                    src={getAvatarUrl(profile)}
                                    alt={getDisplayName(profile)}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>

                            {!isOwnProfile && (
                                <Button onClick={handleMessage} disabled={messageLoading}>
                                    {messageLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                                    Message
                                </Button>
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{getDisplayName(profile)}</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">@{profile.username || 'user'}</p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Joined {new Date(profile.created_at).toLocaleDateString()}
                                </div>
                                {profile.location && (
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                                        {profile.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Reviews */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reputation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UserReviews userId={userId} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Skills & Bio */}
                    <div className="md:col-span-2 space-y-8">
                        {profile.bio && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {profile.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Offered</CardTitle>
                                <CardDescription>Skills this user can teach you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {skills.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {skills.map(skill => (
                                            <div key={skill.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{skill.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{skill.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No skills listed yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
