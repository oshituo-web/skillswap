import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { User, Save, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
// import { useToast } from '../../hooks/use-toast';

const ProfileEditor = () => {
    const { user, isAuthenticated } = useAuth();
    // const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({ username: '', full_name: '', skills: [] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function getProfile() {
            if (!isAuthenticated || !user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { data, error, status } = await supabase
                    .from('profiles')
                    .select('username, full_name')
                    .eq('id', user.id)
                    .single();

                if (error && status !== 406) throw error;

                if (data) {
                    setProfile(prev => ({
                        ...prev,
                        username: data.username || '',
                        full_name: data.full_name || ''
                    }));
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, [isAuthenticated, user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                username: profile.username,
                full_name: profile.full_name,
                updated_at: new Date(),
            });

            if (error) throw error;
            // toast({ title: "Success", description: "Profile updated successfully." });
            alert("Profile updated successfully."); // Fallback if toast not set up
        } catch (error) {
            // toast({ title: "Error", description: "Error updating profile.", variant: "destructive" });
            alert("Error updating profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Card className="max-w-xl mx-auto shadow-lg p-12 text-center">
            <Loader2 className="w-6 h-6 mr-2 inline animate-spin" />
            Loading Profile...
        </Card>
    );

    return (
        <Card className="max-w-xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center"><User className="w-5 h-5 mr-2 text-indigo-500" /> Edit Profile</CardTitle>
                <CardDescription>Update your public username and full name.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Immutable)</Label>
                        <Input id="email" type="text" value={user?.email || ''} disabled className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" type="text" required value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} disabled={saving} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} disabled={saving} />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : 'Update Profile'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ProfileEditor;
