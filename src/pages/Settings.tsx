
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { User, Save, Lock, Bell, Eye, EyeOff, Camera } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { uploadProfilePicture, uploading } = useProfilePicture();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setEmail(data.email || user.email || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setAvatarUrl(data.avatar_url || '');
          setEmailNotifications(data.email_notifications !== false);
          setPrivateProfile(data.is_private === true);
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: '',
            created_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (insertError) throw insertError;
          
          setProfile(newProfile);
          setEmail(user.email || '');
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updates = {
        id: user.id,
        full_name: fullName,
        bio,
        location,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadProfilePicture(file, user.id);
    if (url) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: url })
          .eq('id', user.id);

        if (error) throw error;

        setAvatarUrl(url);
        setProfile({ ...profile, avatar_url: url });
        
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update profile picture',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updates = {
        id: user.id,
        email_notifications: emailNotifications,
        is_private: privateProfile,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been successfully updated'
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    // This would typically have a confirmation dialog
    toast({
      title: 'Account Deletion',
      description: 'Account deletion requires confirmation from an administrator.'
    });
  };
  
  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your settings.</p>
          <Button variant="default" onClick={() => window.location.href = '/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative h-24 w-24 mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-lg">
                        {fullName?.charAt(0) || email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="settings-profile-upload" className="cursor-pointer absolute bottom-0 right-0">
                      <div className="rounded-full bg-primary p-2 shadow-lg text-white hover:bg-primary/90 border-2 border-background">
                        <Camera size={16} />
                      </div>
                      <input
                        id="settings-profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                        disabled={uploading}
                        capture="environment"
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold mb-1">{fullName || "User"}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{email}</p>
                  <div className="w-full mt-6 space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User size={16} />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Bell size={16} />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock size={16} />
                  Security
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information visible to other users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        disabled 
                        placeholder="Your email address"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email changes require verification through account settings
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        placeholder="A short bio about yourself"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="Your location"
                      />
                    </div>
                    
                    <Button 
                      className="mt-6" 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about friend requests and comments
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications} 
                        onCheckedChange={setEmailNotifications} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Private Profile</h3>
                        <p className="text-sm text-muted-foreground">
                          Only friends can view your memories and profile
                        </p>
                      </div>
                      <Switch 
                        checked={privateProfile} 
                        onCheckedChange={setPrivateProfile}
                      />
                    </div>
                    
                    <Button 
                      className="mt-6" 
                      onClick={handleSaveSettings} 
                      disabled={saving}
                    >
                      <Save size={16} className="mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control the visibility of your profile and memories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Timeline to Friends</h3>
                        <p className="text-sm text-muted-foreground">
                          Allow friends to view your timeline
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Email Address</h3>
                        <p className="text-sm text-muted-foreground">
                          Display your email on your profile
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <Button 
                      className="mt-6" 
                      onClick={handleSaveSettings} 
                      disabled={saving}
                    >
                      <Save size={16} className="mr-2" />
                      Save Privacy Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          placeholder="Enter your current password" 
                        />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword" 
                          type="password" 
                          placeholder="Enter new password" 
                        />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirm new password" 
                      />
                    </div>
                    
                    <Button className="mt-4">
                      Change Password
                    </Button>
                    
                    <div className="pt-6 border-t mt-6">
                      <h3 className="font-medium text-lg mb-4">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
