import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Loader2, ArrowRightLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserReviews from '@/components/reviews/UserReviews';

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

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchMarketplaceSkills();
            fetchMySkills();
        }
    }, [user]);

    const fetchMarketplaceSkills = async () => {
        try {
            // Fetch skills with profile join
            const { data, error } = await supabase
                .from('skills')
                .select('*, profiles(id, username, full_name)')
                .neq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSkills(data || []);
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

    // Filter skills based on search term
    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Skill Marketplace</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover skills offered by the community</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>

                {/* Search Bar */}
                <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for skills, descriptions, or users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white transition-all"
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : filteredSkills.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                                <Search className="w-8 h-8 text-indigo-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            {searchTerm ? `No results matching "${searchTerm}". Try a different keyword.` : "There are no skills listed in the marketplace yet. Be the first to add one!"}
                        </p>
                        {!searchTerm && (
                            <Button className="mt-6" onClick={() => navigate('/dashboard')}>
                                Add Your Skill
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSkills.map((skill) => (
                            <Card key={skill.id} className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
                                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">{skill.name}</CardTitle>
                                    </div>
                                    <CardDescription className="flex items-center mt-1 justify-between">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 mr-2">
                                                {(skill.profiles?.full_name || skill.profiles?.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{skill.profiles?.full_name || skill.profiles?.username || 'Unknown User'}</span>
                                        </div>
                                        {skill.profiles?.id && <UserReviews userId={skill.profiles.id} compact={true} />}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between pt-0">
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                                        {skill.description || 'No description provided.'}
                                    </p>
                                    <Button className="w-full bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-900 dark:hover:bg-gray-700 transition-colors" onClick={() => setSelectedSkill(skill)}>
                                        <ArrowRightLeft className="w-4 h-4 mr-2" /> Request Exchange
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Proposal Modal */}
                {selectedSkill && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <Card className="w-full max-w-md shadow-2xl border-none">
                            <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                                <CardTitle>Propose Exchange</CardTitle>
                                <CardDescription className="text-indigo-100">
                                    Requesting <strong>{selectedSkill.name}</strong> from {selectedSkill.profiles?.full_name || 'User'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Offer one of your skills:</label>
                                    {mySkills.length > 0 ? (
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 transition-shadow"
                                            value={offeredSkillId}
                                            onChange={(e) => setOfferedSkillId(e.target.value)}
                                        >
                                            <option value="">Select a skill to offer...</option>
                                            {mySkills.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                            You need to add skills to your profile first!
                                        </div>
                                    )}
                                </div>

                                {proposalMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${proposalMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {proposalMessage}
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-2">
                                    <Button variant="ghost" onClick={() => setSelectedSkill(null)}>Cancel</Button>
                                    <Button
                                        onClick={handleRequestExchange}
                                        disabled={!offeredSkillId || proposing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {proposing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {proposing ? 'Sending...' : 'Send Proposal'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillMarketplace;
