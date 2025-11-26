import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import supabase from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const NewSkillPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch('/api/skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                throw new Error('Failed to create skill');
            }

            toast({
                title: "Success!",
                description: "Your skill has been created.",
            });

            navigate('/skills');

        } catch (error) {
            toast({
                title: "Create Failed",
                description: error.message || "Could not create the skill.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Skill</CardTitle>
                    <CardDescription>Fill out the form below to add a new skill to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Skill Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        <Button type="submit" className="w-full h-10" disabled={saving}>
                            {saving ? 'Saving...' : 'Create Skill'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewSkillPage;
