import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const SkillManager = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillDesc, setNewSkillDesc] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchSkills();
        }
    }, [user]);

    const fetchSkills = async () => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSkills(data);
        } catch (err) {
            console.error('Error fetching skills:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        setAdding(true);
        setError('');

        try {
            const { data, error } = await supabase
                .from('skills')
                .insert([
                    {
                        user_id: user.id,
                        name: newSkillName,
                        description: newSkillDesc
                    }
                ])
                .select();

            if (error) throw error;

            setSkills([data[0], ...skills]);
            setNewSkillName('');
            setNewSkillDesc('');
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSkill = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;
        try {
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSkills(skills.filter(skill => skill.id !== id));
        } catch (err) {
            console.error('Error deleting skill:', err);
        }
    };

    return (
        <Card className="h-full border-t-4 border-indigo-500 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                        <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Skills I Offer
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage the skills you want to teach or exchange.
                </p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Add Skill Form */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Add New Skill</h3>
                    <form onSubmit={handleAddSkill} className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="skillName" className="text-xs font-medium text-gray-500 uppercase">Skill Name</Label>
                                <Input
                                    id="skillName"
                                    placeholder="e.g. React, Graphic Design, Spanish"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    disabled={adding}
                                    className="bg-white dark:bg-gray-900"
                                />
                            </div>
                            <div>
                                <Label htmlFor="skillDesc" className="text-xs font-medium text-gray-500 uppercase">Description</Label>
                                <Input
                                    id="skillDesc"
                                    placeholder="Briefly describe your expertise..."
                                    value={newSkillDesc}
                                    onChange={(e) => setNewSkillDesc(e.target.value)}
                                    disabled={adding}
                                    className="bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{error}</p>}
                        <Button type="submit" disabled={adding || !newSkillName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add to Marketplace
                        </Button>
                    </form>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            Your Listed Skills
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">{skills.length}</span>
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                    ) : skills.length === 0 ? (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed yet.</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add your first skill above to start exchanging!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {skills.map((skill) => (
                                <div key={skill.id} className="group flex justify-between items-start p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{skill.name}</h4>
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full uppercase tracking-wide">
                                                Public
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {skill.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Skill"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SkillManager;
