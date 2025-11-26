import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SkillsPage = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        fetchSkills();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills</h1>
                <Link to="/skills/new">
                    <Button>Add New Skill</Button>
                </Link>
            </div>
            
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.description}</TableCell>
                                        <TableCell>
                                            <Link to={`/skills/${skill.id}`}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SkillsPage;
