import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Calendar, MapPin, Edit, Settings, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedMemories, setLikedMemories] = useState<string[]>([]);
  
  const isOwnProfile = user?.id === id || (!id && user);
  const profileId = id || user?.id;

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const { uploadProfilePicture, uploading } = useProfilePicture();

  useEffect(() => {
    if (profile?.bio) {
      setBioText(profile.bio);
    }
  }, [profile]);

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

        setProfile({ ...profile, avatar_url: url });
        
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleBioUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bioText })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, bio: bioText });
      setIsEditingBio(false);
      
      toast({
        title: 'Success',
        description: 'Bio updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
      
      try {
        setLoading(true);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        const { data: memoriesData, error: memoriesError } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', profileId)
          .order('date', { ascending: false });
          
        if (memoriesError) throw memoriesError;
        setMemories(memoriesData || []);
        
        if (user) {
          const { data: likesData } = await supabase
            .from('memory_likes')
            .select('memory_id')
            .eq('user_id', user.id);
            
          setLikedMemories((likesData || []).map(like => like.memory_id));
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [profileId, user, toast]);
  
  const handleLikeMemory = async (memoryId: string) => {
    if (!user) return;
    
    try {
      const isLiked = likedMemories.includes(memoryId);
      
      if (isLiked) {
        await supabase
          .from('memory_likes')
          .delete()
          .match({ user_id: user.id, memory_id: memoryId });
          
        setLikedMemories(likedMemories.filter(id => id !== memoryId));
      } else {
        await supabase
          .from('memory_likes')
          .insert({ user_id: user.id, memory_id: memoryId });
          
        setLikedMemories([...likedMemories, memoryId]);
      }
    } catch (error: any) {
      console.error('Error liking memory:', error);
      toast({
        title: "Error",
        description: "Failed to like memory",
        variant: "destructive"
      });
    }
  };
  
  const renderProfileHeader = () => (
    <div className="flex flex-col items-center mb-10">
      <div className="relative mb-6">
        <div className="w-36 h-36 mx-auto">
          <div className="w-full h-full overflow-hidden rounded-full border-4 border-primary/20 bg-muted shadow-xl">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-semibold">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <label htmlFor="profile-picture-upload" className="cursor-pointer absolute bottom-1 right-1">
              <div className="rounded-full bg-primary p-2 shadow-lg text-white hover:bg-primary/90 border-2 border-background">
                <Camera size={18} />
              </div>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">{profile.full_name || "User"}</h1>
      <p className="text-muted-foreground mb-4">{profile.email}</p>

      <div className="w-full max-w-md mt-4">
        {isOwnProfile ? (
          isEditingBio ? (
            <div className="space-y-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Write something about yourself..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingBio(false);
                    setBioText(profile?.bio || '');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleBioUpdate}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <p className="text-muted-foreground text-center">
                {profile?.bio || "No bio yet"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingBio(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
          )
        ) : (
          <p className="text-muted-foreground text-center">
            {profile?.bio || "No bio yet"}
          </p>
        )}
      </div>

      {isOwnProfile && (
        <div className="flex space-x-3 mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit size={16} />
            Edit Profile
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </Button>
        </div>
      )}
      
      <div className="flex space-x-8 mt-6">
        <div className="text-center">
          <p className="text-2xl font-semibold">{memories.length}</p>
          <p className="text-muted-foreground text-sm">Memories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">
            {new Set(memories.map(memory => memory.emotion).filter(Boolean)).size}
          </p>
          <p className="text-muted-foreground text-sm">Emotions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">
            {new Set(memories.map(memory => memory.location).filter(Boolean)).size}
          </p>
          <p className="text-muted-foreground text-sm">Locations</p>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-36 h-36 overflow-hidden rounded-full bg-muted/50 animate-pulse" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">This profile doesn't exist or you don't have permission to view it.</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {renderProfileHeader()}
        <Tabs defaultValue="memories" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="memories">Memories</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="memories" className="space-y-6">
            {memories.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No Memories Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile 
                    ? "You haven't added any memories to your timeline yet." 
                    : "This user hasn't added any memories to their timeline yet."}
                </p>
                {isOwnProfile && (
                  <Link to="/timeline">
                    <Button>Create Your First Memory</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {memories.map((memory) => (
                  <Card key={memory.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <span>{memory.title}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${likedMemories.includes(memory.id) ? 'text-red-500' : ''}`}
                          onClick={() => handleLikeMemory(memory.id)}
                        >
                          <Heart className="h-5 w-5" fill={likedMemories.includes(memory.id) ? "currentColor" : "none"} />
                        </Button>
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {memory.date && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-background/50">
                            <Calendar className="h-3 w-3" />
                            {new Date(memory.date).toLocaleDateString()}
                          </Badge>
                        )}
                        {memory.emotion && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/30">
                            <Heart className="h-3 w-3" />
                            {memory.emotion}
                          </Badge>
                        )}
                        {memory.location && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-background/50">
                            <MapPin className="h-3 w-3" />
                            {memory.location}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{memory.description}</p>
                      {memory.image_url && (
                        <div className="mt-4 rounded-md overflow-hidden h-48 bg-muted">
                          <img 
                            src={memory.image_url} 
                            alt={memory.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="mt-4 text-right">
                        <Link to={`/memory/${memory.id}`}>
                          <Button variant="ghost" size="sm">View Memory</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/40 before:to-transparent">
              {memories.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <h3 className="text-xl font-medium">No Timeline Entries Yet</h3>
                </div>
              ) : (
                memories.map((memory, index) => (
                  <div key={memory.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary bg-background text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded shadow-lg">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <h3 className="font-semibold">{memory.title}</h3>
                        {memory.date && (
                          <time className="text-xs text-muted-foreground">
                            {new Date(memory.date).toLocaleDateString()}
                          </time>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{memory.description}</p>
                      {memory.emotion && (
                        <Badge variant="outline" className="mt-2 flex items-center gap-1 max-w-max bg-primary/10 text-primary border-primary/30">
                          <Heart className="h-3 w-3" />
                          {memory.emotion}
                        </Badge>
                      )}
                      <div className="mt-3 text-right">
                        <Link to={`/memory/${memory.id}`}>
                          <Button variant="ghost" size="sm">View Memory</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
