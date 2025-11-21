import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabaseClient';
import { useToast } from '../hooks/use-toast';

const SkillDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchSkill = async () => {
            try {
                const response = await fetch(`/api/skills/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch skill');
                }
                const data = await response.json();
                setSkill(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSkill();
    }, [id]);

    const handleDelete = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch(`/api/skills/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete skill');
            }
            
            toast({
                title: "Success!",
                description: "The skill has been deleted.",
            });

            navigate('/skills');

        } catch (error) {
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete the skill.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading skill...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{skill.name}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Owner ID: {skill.user_id}</p>
                    {user && user.id === skill.user_id && (
                        <div className="mt-4 flex space-x-2">
                            <Button variant="destructive" onClick={handleDelete}>Delete Skill</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="mt-4">
                <Link to="/skills">
                    <Button variant="outline">Back to Skills</Button>
                </Link>
            </div>
        </div>
    );
};

export default SkillDetailPage;
