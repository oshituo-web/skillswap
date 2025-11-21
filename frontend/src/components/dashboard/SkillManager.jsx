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
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                    Skills I Offer
                </CardTitle>
                <p className="text-sm text-gray-500">
                    Skills you add here are <strong>automatically listed in the Marketplace</strong> for others to find.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add Skill Form */}
                <form onSubmit={handleAddSkill} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="skillName">Skill Name</Label>
                            <Input
                                id="skillName"
                                placeholder="e.g. React, Graphic Design"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                disabled={adding}
                            />
                        </div>
                        <div>
                            <Label htmlFor="skillDesc">Description (Optional)</Label>
                            <Input
                                id="skillDesc"
                                placeholder="Brief details..."
                                value={newSkillDesc}
                                onChange={(e) => setNewSkillDesc(e.target.value)}
                                disabled={adding}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" disabled={adding || !newSkillName.trim()} className="w-full sm:w-auto">
                        {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Add to Marketplace
                    </Button>
                </form>

                {/* Skills List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Your Listed Skills</h3>
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                    ) : skills.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No skills listed yet. Add one above!</p>
                    ) : (
                        <ul className="space-y-3">
                            {skills.map((skill) => (
                                <li key={skill.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-medium text-gray-900 dark:text-white">{skill.name}</p>
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Public</span>
                                        </div>
                                        {skill.description && <p className="text-sm text-gray-500">{skill.description}</p>}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(skill.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SkillManager;
