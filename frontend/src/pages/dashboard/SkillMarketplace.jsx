import { useState, useEffect } from 'react';
import { getDisplayName, getAvatarUrl } from '@/utils/userUtils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Loader2, ArrowRightLeft, Search, Filter, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import UserReviews from '@/components/reviews/UserReviews';
import toast from 'react-hot-toast';

const SkillMarketplace = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [mySkills, setMySkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [offeredSkillId, setOfferedSkillId] = useState('');
    const [proposing, setProposing] = useState(false);
    const [proposalMessage, setProposalMessage] = useState('');

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMySkills();
        }
    }, [user]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) {
                fetchMarketplaceSkills();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, categoryFilter, levelFilter, user]);

    const fetchMarketplaceSkills = async () => {
        try {
            setSearching(true);

            // Use search endpoint if filters or search term are active
            if (searchTerm || categoryFilter !== 'all' || levelFilter !== 'all') {
                const params = new URLSearchParams({
                    q: searchTerm,
                    ...(categoryFilter !== 'all' && { category: categoryFilter }),
                    ...(levelFilter !== 'all' && { level: levelFilter }),
                });

                const response = await fetch(`/api/skills/search?${params}`);
                const result = await response.json();

                // Filter out current user's skills
                const filteredSkills = (result.skills || []).filter(skill => skill.user_id !== user.id);
                setSkills(filteredSkills);
            } else {
                // Default fetch all skills
                const { data, error } = await supabase
                    .from('skills')
                    .select('*, profiles(id, username, full_name, avatar_url, email)')
                    .neq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setSkills(data || []);
            }
        } catch (err) {
            console.error('Error fetching marketplace:', err);
            toast.error('Failed to load skills');
        } finally {
            setLoading(false);
            setSearching(false);
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
            const session = (await supabase.auth.getSession()).data.session;
            const response = await fetch('/api/exchanges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    skill_id_offered: offeredSkillId,
                    skill_id_requested: selectedSkill.id,
                    receiver_id: selectedSkill.user_id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Exchange creation failed response:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to create exchange');
            }

            const data = await response.json();

            toast.success('Exchange proposed successfully!');
            setTimeout(() => {
                setSelectedSkill(null);
                setOfferedSkillId('');
            }, 1000);
        } catch (err) {
            console.error('Error proposing exchange (catch block):', err);
            toast.error(`Failed to propose exchange: ${err.message}`);
        } finally {
            setProposing(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setLevelFilter('all');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Skill Marketplace</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover skills offered by the community</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search skills, descriptions, or users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>

                            {(searchTerm || categoryFilter !== 'all' || levelFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="technology">Technology & Programming</option>
                                        <option value="languages">Languages</option>
                                        <option value="arts">Arts & Crafts</option>
                                        <option value="music">Music & Performance</option>
                                        <option value="sports">Sports & Fitness</option>
                                        <option value="business">Business & Finance</option>
                                        <option value="cooking">Cooking & Culinary</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Proficiency Level
                                    </label>
                                    <select
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Results Count */}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {searching ? (
                                <span className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Searching...
                                </span>
                            ) : (
                                <span>{skills.length} skill{skills.length !== 1 ? 's' : ''} found</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : skills.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No skills available in the marketplace yet'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skill) => (
                            <Card key={skill.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">{skill.name}</CardTitle>
                                    <CardDescription className="flex items-center mt-1 justify-between">
                                        <div className="flex items-center">
                                            <Link to={`/profile/${skill.profiles?.id}`} className="flex items-center hover:opacity-80 transition-opacity">
                                                <img
                                                    src={getAvatarUrl(skill.profiles)}
                                                    alt={getDisplayName(skill.profiles)}
                                                    className="w-6 h-6 rounded-full mr-2 object-cover"
                                                />
                                                <span className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                    {getDisplayName(skill.profiles)}
                                                </span>
                                            </Link>
                                        </div>
                                        {skill.profiles?.id && <UserReviews userId={skill.profiles.id} compact={true} />}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between pt-0">
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 text-sm">
                                        {skill.description || 'No description provided.'}
                                    </p>
                                    <Button className="w-full" onClick={() => setSelectedSkill(skill)}>
                                        <ArrowRightLeft className="w-4 h-4 mr-2" /> Request Exchange
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Proposal Modal */}
                {selectedSkill && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md shadow-2xl">
                            <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                                <CardTitle>Propose Exchange</CardTitle>
                                <CardDescription className="text-indigo-100">
                                    Requesting <strong>{selectedSkill.name}</strong> from {getDisplayName(selectedSkill.profiles)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Offer one of your skills:
                                    </label>
                                    {mySkills.length > 0 ? (
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                                            value={offeredSkillId}
                                            onChange={(e) => setOfferedSkillId(e.target.value)}
                                        >
                                            <option value="">Select a skill to offer...</option>
                                            {mySkills.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                            You need to add skills to your profile first!
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button variant="ghost" onClick={() => setSelectedSkill(null)}>Cancel</Button>
                                    <Button
                                        onClick={handleRequestExchange}
                                        disabled={!offeredSkillId || proposing}
                                    >
                                        {proposing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
