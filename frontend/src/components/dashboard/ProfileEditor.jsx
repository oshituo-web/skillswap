import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { api } from '../../lib/api';
import { User, Save, Loader2, Upload, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

const ProfileEditor = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        username: '',
        full_name: '',
        bio: '',
        location: '',
        avatar_url: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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
                    .select('username, full_name, bio, location, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (error && status !== 406) throw error;

                if (data) {
                    setProfile({
                        username: data.username || '',
                        full_name: data.full_name || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        avatar_url: data.avatar_url || ''
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, [isAuthenticated, user]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
            toast.success('Avatar uploaded successfully!');
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                username: profile.username,
                full_name: profile.full_name,
                bio: profile.bio,
                location: profile.location,
                avatar_url: profile.avatar_url,
                updated_at: new Date(),
            });

            if (error) throw error;
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error('Update error:', error);
            toast.error("Error updating profile");
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
                <CardDescription>Update your profile information and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </div>
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">Max 5MB. JPEG, PNG, GIF, or WebP</p>
                            </div>
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                            id="bio"
                            rows="4"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            disabled={saving}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="location"
                                type="text"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                disabled={saving}
                                className="pl-10"
                                placeholder="City, Country"
                            />
                        </div>
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
