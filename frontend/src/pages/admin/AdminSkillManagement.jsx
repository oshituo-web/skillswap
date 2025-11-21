import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabaseClient';
import { useToast } from '../../hooks/use-toast';

const AdminSkillManagement = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const fetchSkills = async () => {
        try {
            const response = await fetch('/api/skills');
            if (!response.ok) {
                throw new Error('Failed to fetch skills');
            }
            const data = await response.json();
            setSkills(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleDelete = async (skillId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch(`/api/admin/skills/${skillId}`, {
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
            // Refresh the list of skills
            fetchSkills();

        } catch (error) {
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete the skill.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Management</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p>Loading skills...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Owner ID</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.description}</TableCell>
                                        <TableCell>{skill.user_id}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Link to="/admin"><Button variant="outline">Back to Admin Dashboard</Button></Link>
        </div>
    );
};

export default AdminSkillManagement;
