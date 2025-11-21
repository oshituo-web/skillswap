import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabaseClient';

const AdminExchangeModeration = () => {
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExchanges = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error("Not authenticated");
                }
                const token = session.access_token;

                // This endpoint needs to be created for admins
                const response = await fetch('/api/admin/exchanges', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch exchanges');
                }
                const data = await response.json();
                setExchanges(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExchanges();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exchange Moderation</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Exchanges</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p>Loading exchanges...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Offered Skill ID</TableHead>
                                    <TableHead>Requested Skill ID</TableHead>
                                    <TableHead>Proposer ID</TableHead>
                                    <TableHead>Receiver ID</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exchanges.map((exchange) => (
                                    <TableRow key={exchange.id}>
                                        <TableCell>{exchange.skill_id_offered}</TableCell>
                                        <TableCell>{exchange.skill_id_requested}</TableCell>
                                        <TableCell>{exchange.proposer_id}</TableCell>
                                        <TableCell>{exchange.receiver_id}</TableCell>
                                        <TableCell>{exchange.status}</TableCell>
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

export default AdminExchangeModeration;
