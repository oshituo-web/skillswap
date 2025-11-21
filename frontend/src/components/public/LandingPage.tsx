import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // FIX: Changed to maximum relative path (from components/profile to context)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js'; 

// --- START: Supabase Client Setup ---
// NOTE: Reverting to explicit string declarations to avoid import.meta errors,
// assuming environment variables are being injected elsewhere or will be manually replaced.
// For now, these are placeholder strings. Replace them with your actual values.
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- END: Supabase Client Setup ---

interface Profile {
  username: string | null;
  full_name: string | null;
}

/**
 * ProfileEditor Component
 * Allows authenticated users to view and update their profile information.
 */
const ProfileEditor = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({ username: '', full_name: '' });
  const [saving, setSaving] = useState(false);

  // 1. Fetch existing profile data
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

        if (error && status !== 406) { // 406 means no row found, which is fine for new users
          throw error;
        }

        if (data) {
          setProfile({
            username: data.username,
            full_name: data.full_name,
          });
        }
      } catch (error: any) {
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
  }, [isAuthenticated, user]);

  // 2. Handle profile update submission
  const handleUpdate = async (e: React.FormEvent) => {
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

      // Upsert: inserts if the row does not exist, updates if it does (based on 'id' conflict)
      const { error } = await supabase.from('profiles').upsert(updates, {
        onConflict: 'id', 
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

    } catch (error: any) {
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