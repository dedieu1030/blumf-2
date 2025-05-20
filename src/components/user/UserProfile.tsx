
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Phone, Globe, Clock, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function UserProfile() {
  const { profile, loading, updateProfile } = useUserProfile();
  const { isAuthenticated, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  // Si on est encore en train de charger, afficher un squelette
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#F0EBE7] to-[#E8E3DF]">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Gestion du cas où l'utilisateur n'est pas authentifié ou le profil n'a pas été trouvé
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#F0EBE7] to-[#E8E3DF] text-[#003427]">
            <CardTitle className="text-2xl font-medium">Profil non disponible</CardTitle>
            <CardDescription className="text-base opacity-90">
              Vous devez être connecté pour voir votre profil
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-[#003427] hover:bg-[#002018] text-white"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si nous avons un utilisateur mais pas de profil complet, utiliser les données minimales
  const displayProfile = profile || {
    full_name: user?.email ? user.email.split('@')[0] : 'Utilisateur',
    email: user?.email || '',
    phone: '', // Ajout de la propriété phone avec une valeur par défaut vide
    language: 'fr',
    timezone: 'Europe/Paris',
    notification_settings: {
      email_notifications: true,
      push_notifications: false,
      sms_notifications: false
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Vous avez été déconnecté avec succès');
      navigate('/auth');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la déconnexion');
      console.error('Erreur de déconnexion:', error);
    }
  };
  
  // Obtention des initiales pour l'avatar
  const initials = displayProfile.full_name
    ? displayProfile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'UN';
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#F0EBE7] to-[#E8E3DF] pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={displayProfile.full_name} />
                ) : (
                  <AvatarFallback className="bg-[#003427] text-white text-xl">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-medium text-[#003427]">{displayProfile.full_name}</CardTitle>
                <CardDescription className="text-base mt-1 opacity-80">
                  {displayProfile.email}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/profile/edit')}
              variant="outline"
              className="bg-white hover:bg-[#F8F5F2] border-[#E0DAD3]"
            >
              Modifier mon profil
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-10">
          <div>
            <h3 className="text-xl font-medium text-[#003427] mb-6">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8F5F2] rounded-xl p-4 flex items-start space-x-3">
                <span className="bg-white p-2 rounded-lg text-[#003427]">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <span className="font-medium text-[#003427]">{displayProfile.email}</span>
                </div>
              </div>
              
              {displayProfile.phone && (
                <div className="bg-[#F8F5F2] rounded-xl p-4 flex items-start space-x-3">
                  <span className="bg-white p-2 rounded-lg text-[#003427]">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                    <span className="font-medium text-[#003427]">{displayProfile.phone}</span>
                  </div>
                </div>
              )}
              
              <div className="bg-[#F8F5F2] rounded-xl p-4 flex items-start space-x-3">
                <span className="bg-white p-2 rounded-lg text-[#003427]">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Langue</p>
                  <span className="font-medium text-[#003427]">
                    {displayProfile.language === 'fr' ? 'Français' : displayProfile.language}
                  </span>
                </div>
              </div>
              
              <div className="bg-[#F8F5F2] rounded-xl p-4 flex items-start space-x-3">
                <span className="bg-white p-2 rounded-lg text-[#003427]">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fuseau horaire</p>
                  <span className="font-medium text-[#003427]">
                    {displayProfile.timezone === 'Europe/Paris' ? 'Europe/Paris' : displayProfile.timezone}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-[#003427] mb-6">Préférences de notification</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E0DAD3] rounded-xl p-4 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={displayProfile.notification_settings?.email_notifications ? "default" : "outline"} 
                    className={displayProfile.notification_settings?.email_notifications ? "bg-green-500 hover:bg-green-600" : "text-muted-foreground"}>
                    {displayProfile.notification_settings?.email_notifications ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">Notifications par email</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir des mises à jour par email
                </p>
              </div>
              
              <div className="bg-white border border-[#E0DAD3] rounded-xl p-4 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={displayProfile.notification_settings?.push_notifications ? "default" : "outline"}
                    className={displayProfile.notification_settings?.push_notifications ? "bg-green-500 hover:bg-green-600" : "text-muted-foreground"}>
                    {displayProfile.notification_settings?.push_notifications ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">Notifications push</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications push
                </p>
              </div>
              
              <div className="bg-white border border-[#E0DAD3] rounded-xl p-4 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={displayProfile.notification_settings?.sms_notifications ? "default" : "outline"}
                    className={displayProfile.notification_settings?.sms_notifications ? "bg-green-500 hover:bg-green-600" : "text-muted-foreground"}>
                    {displayProfile.notification_settings?.sms_notifications ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">Notifications SMS</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par SMS
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-[#E0DAD3]">
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
