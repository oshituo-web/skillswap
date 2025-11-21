import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import supabase from '../../lib/supabaseClient';

import { useToast } from '../../hooks/use-toast';

const ProfileEditor = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: '', full_name: '' });
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

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setProfile({
            username: data.username,
            full_name: data.full_name,
          });
        }
      } catch (error) {
        toast({
          title: "Error Loading Profile",
          description: error.message || "Failed to fetch user profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, [isAuthenticated, user, toast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (!user) {
      setSaving(false);
      return;
    }

    try {
      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save profile details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg text-gray-500">Loading Profile...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your public username and full name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Immutable)</Label>
            <Input 
              id="email" 
              type="text" 
              value={user?.email || ''} 
              disabled 
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              required
              value={profile.username || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              disabled={saving}
            />
          </div>
          <Button type="submit" className="w-full h-10" disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
