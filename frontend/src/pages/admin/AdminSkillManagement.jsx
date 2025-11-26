import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const AdminSkillManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const fetchSkills = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Not authenticated");
            }
            const token = session.access_token;

            const response = await fetch('/api/admin/all-skills', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
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
        if (!window.confirm("Are you sure you want to delete this skill?")) return;

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

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const filteredSkills = skills.filter(skill => {
        const searchLower = searchTerm.toLowerCase();
        return (
            skill.name.toLowerCase().includes(searchLower) ||
            skill.description.toLowerCase().includes(searchLower) ||
            skill.user_email.toLowerCase().includes(searchLower)
        );
    });

    const sortedSkills = [...filteredSkills].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSkills = sortedSkills.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedSkills.length / itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <Link to="/admin">
                    <Button size="icon" variant="outline" className="mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Skills ({skills.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p>Loading skills...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('name')}
                                            >
                                                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('description')}
                                            >
                                                Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleSort('user_email')}
                                            >
                                                Owner Email {sortField === 'user_email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentSkills.map((skill) => (
                                            <TableRow key={skill.id}>
                                                <TableCell className="font-medium">{skill.name}</TableCell>
                                                <TableCell className="max-w-md truncate" title={skill.description}>{skill.description}</TableCell>
                                                <TableCell>{skill.user_email}</TableCell>
                                                <TableCell>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {sortedSkills.length > 0 && (
                                <div className="mt-4 flex items-center justify-between border-t pt-4 border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedSkills.length)} of {sortedSkills.length} skills
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSkillManagement;
