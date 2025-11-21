import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SkillMarketplace = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mySkills, setMySkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null); // Skill to request
    const [offeredSkillId, setOfferedSkillId] = useState(''); // My skill to offer
    const [proposing, setProposing] = useState(false);
    const [proposalMessage, setProposalMessage] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMarketplaceSkills();
            fetchMySkills();
        }
    }, [user]);

    const fetchMarketplaceSkills = async () => {
        try {
            console.log('Fetching marketplace skills for user:', user.id);

            // First, try to fetch ALL skills to debug
            const { data: allSkills, error: allError } = await supabase
                .from('skills')
                .select('*');

            console.log('All skills in database:', allSkills);
            console.log('All skills error:', allError);

            // Now fetch skills with profile join
            const { data, error } = await supabase
                .from('skills')
                .select('*, profiles(username, full_name)')
                .neq('user_id', user.id)
                .order('created_at', { ascending: false });

            console.log('Marketplace query result:', data);
            console.log('Marketplace query error:', error);

            if (error) {
                console.error('Error details:', error);
                setDebugInfo({
                    error: error.message,
                    allSkillsCount: allSkills?.length || 0,
                    currentUserId: user.id
                });
                throw error;
            }

            setSkills(data || []);
            setDebugInfo({
                totalSkills: allSkills?.length || 0,
                marketplaceSkills: data?.length || 0,
                currentUserId: user.id
            });
        } catch (err) {
            console.error('Error fetching marketplace:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySkills = async () => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            setMySkills(data || []);
            console.log('My skills:', data);
        } catch (err) {
            console.error('Error fetching my skills:', err);
        }
    };

    const handleRequestExchange = async () => {
        if (!selectedSkill || !offeredSkillId) return;
        setProposing(true);

        try {
            const { error } = await supabase
                .from('exchanges')
                .insert([{
                    proposer_id: user.id,
                    receiver_id: selectedSkill.user_id,
                    skill_id_requested: selectedSkill.id,
                    skill_id_offered: offeredSkillId,
                    status: 'pending'
                }]);

            if (error) throw error;

            setProposalMessage('Exchange proposed successfully!');
            setTimeout(() => {
                setSelectedSkill(null);
                setProposalMessage('');
                setOfferedSkillId('');
            }, 2000);
        } catch (err) {
            console.error('Error proposing exchange:', err);
            setProposalMessage('Failed to propose exchange.');
        } finally {
            setProposing(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Skill Marketplace</h1>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>

            {/* Debug Info */}
            {debugInfo && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                        <p className="text-sm font-mono">
                            <strong>Debug Info:</strong><br />
                            Total skills in DB: {debugInfo.totalSkills}<br />
                            Skills in marketplace: {debugInfo.marketplaceSkills}<br />
                            Your user ID: {debugInfo.currentUserId}<br />
                            {debugInfo.error && <span className="text-red-600">Error: {debugInfo.error}</span>}
                        </p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : skills.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No skills available from other users yet.</p>
                    <p className="text-sm text-gray-400">
                        Make sure you've added skills from a different account, and check the browser console (F12) for debug information.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.map((skill) => (
                        <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle>{skill.name}</CardTitle>
                                <CardDescription>
                                    Offered by: <span className="font-medium text-indigo-600">{skill.profiles?.full_name || skill.profiles?.username || 'Unknown User'}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 min-h-[3rem]">{skill.description || 'No description provided.'}</p>
                                <Button className="w-full" onClick={() => setSelectedSkill(skill)}>
                                    <ArrowRightLeft className="w-4 h-4 mr-2" /> Request Exchange
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Proposal Modal (Simple overlay for now) */}
            {selectedSkill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Propose Exchange</CardTitle>
                            <CardDescription>
                                You are requesting <strong>{selectedSkill.name}</strong> from {selectedSkill.profiles?.full_name || 'User'}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Offer one of your skills:</label>
                                {mySkills.length > 0 ? (
                                    <select
                                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                        value={offeredSkillId}
                                        onChange={(e) => setOfferedSkillId(e.target.value)}
                                    >
                                        <option value="">Select a skill...</option>
                                        {mySkills.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-sm">You need to add skills to your profile first!</p>
                                )}
                            </div>

                            {proposalMessage && <p className={`text-sm ${proposalMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{proposalMessage}</p>}

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="ghost" onClick={() => setSelectedSkill(null)}>Cancel</Button>
                                <Button
                                    onClick={handleRequestExchange}
                                    disabled={!offeredSkillId || proposing}
                                >
                                    {proposing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Proposal'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SkillMarketplace;
