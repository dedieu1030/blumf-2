
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        
        // Check if user is logged in via Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Since we don't have a profiles table yet, return mock data
        // In the future, we'd replace this with the actual query:
        // const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        
        const mockProfile: UserProfile = {
          id: userId,
          email: session.user.email || '',
          full_name: 'Mock User',
          avatar_url: null,
          updated_at: new Date().toISOString(),
          language: 'fr',
          timezone: 'Europe/Paris',
          notification_settings: {
            email_notifications: true,
            push_notifications: false
          }
        };
        
        setProfile(mockProfile);
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
    
    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      const userId = session.user.id;
      
      // Ensure required fields are present
      if (!updates.email && profile?.email) {
        updates.email = profile.email;
      }
      
      if (!updates.full_name && profile?.full_name) {
        updates.full_name = profile.full_name;
      }
      
      // Update timestamp
      updates.updated_at = new Date().toISOString();
      
      // For now, mock update since we don't have the profiles table
      // In the future, replace with:
      // const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
      
      const updatedProfile = { 
        ...profile, 
        ...updates 
      } as UserProfile;
      
      setProfile(updatedProfile);
      toast.success('Profil mis à jour avec succès');
      return { success: true, data: updatedProfile };
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err);
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
}
