
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, UserPlus, CheckCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ProfileSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadProfilePicture, uploading } = useProfilePicture();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [friendEmails, setFriendEmails] = useState(['', '', '', '', '']);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadProfilePicture(file, user.id);
    if (url) {
      setAvatarUrl(url);
      toast({
        title: 'Success',
        description: 'Profile picture uploaded successfully',
      });
    }
  };

  const handleNameSubmit = () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
    setProgress(50);
  };

  const handleBioSubmit = () => {
    if (!bio.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a short bio',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(3);
    setProgress(75);
  };

  const handleFriendsSubmit = async () => {
    setProgress(100);
    
    try {
      if (!user) return;
      
      // Update profile with name and bio
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: name,
          bio: bio,
          avatar_url: avatarUrl || null
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Invite friends (for this demo, we'll just save the emails)
      const validEmails = friendEmails.filter(email => email.trim() !== '');
      
      if (validEmails.length > 0) {
        console.log('Friends to invite:', validEmails);
        // In a real app, you would send invitations to these emails
      }
      
      // Send notification about profile setup
      await supabase.functions.invoke('send-notification', {
        body: { 
          type: 'setup', 
          user: { email: user.email, id: user.id },
          details: 'Profile setup completed'
        }
      });
      
      toast({
        title: 'Profile Setup Complete',
        description: 'Your profile has been set up successfully',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const updateFriendEmail = (index: number, value: string) => {
    const newFriendEmails = [...friendEmails];
    newFriendEmails[index] = value;
    setFriendEmails(newFriendEmails);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Upload a Profile Picture</CardTitle>
              <CardDescription>
                Choose a profile picture that represents you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {name ? name.charAt(0) : user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="picture-upload" className="cursor-pointer absolute bottom-4 right-0">
                  <div className="rounded-full bg-primary p-2 text-white hover:bg-primary/90">
                    <Upload size={16} />
                  </div>
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="w-full">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNameSubmit}>Continue</Button>
            </CardFooter>
          </>
        );
        
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>
                Add a short bio to help others get to know you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a bit about yourself, your interests, or what brings you to Memoria..."
                className="min-h-[150px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentStep(1);
                setProgress(25);
              }}>Back</Button>
              <Button onClick={handleBioSubmit}>Continue</Button>
            </CardFooter>
          </>
        );
        
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Add Friends</CardTitle>
              <CardDescription>
                Invite up to 5 friends to join you on Memoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {friendEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <UserPlus size={16} className="text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => updateFriendEmail(index, e.target.value)}
                    placeholder={`Friend ${index + 1}'s email`}
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentStep(2);
                setProgress(50);
              }}>Back</Button>
              <Button onClick={handleFriendsSubmit}>Complete Setup</Button>
            </CardFooter>
          </>
        );
        
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <Progress value={progress} className="h-2 w-full" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Profile Picture & Name</span>
            <span>Bio</span>
            <span>Add Friends</span>
          </div>
        </div>
        <Card className="w-full">
          {renderStepContent()}
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
