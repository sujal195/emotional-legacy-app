
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Clock, Heart, Map, Settings, File, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [memories, setMemories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMemories: 0,
    timelineYears: 0,
    emotions: 0,
    locations: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [emotion, setEmotion] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const emotions = [
    "Joy", "Sadness", "Fear", "Disgust", "Anger", 
    "Surprise", "Trust", "Anticipation", "Love", "Pride",
    "Excitement", "Gratitude", "Nostalgia", "Anxious", "Peaceful"
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch memories for the user
        const { data: memoriesData, error: memoriesError } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (memoriesError) throw memoriesError;
        setMemories(memoriesData || []);
        
        // Calculate statistics
        const years = new Set();
        const emotions = new Set();
        const locations = new Set();
        
        const { data: allMemories, error: allMemoriesError } = await supabase
          .from('memories')
          .select('date, emotion, location')
          .eq('user_id', user.id);
          
        if (allMemoriesError) throw allMemoriesError;
        
        (allMemories || []).forEach(memory => {
          if (memory.date) {
            years.add(new Date(memory.date).getFullYear());
          }
          if (memory.emotion) {
            emotions.add(memory.emotion);
          }
          if (memory.location) {
            locations.add(memory.location);
          }
        });
        
        setStats({
          totalMemories: allMemories?.length || 0,
          timelineYears: years.size,
          emotions: emotions.size,
          locations: locations.size
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const handleAddMemory = async () => {
    if (!user) return;
    
    try {
      if (!title || !date) {
        toast({
          title: "Validation Error",
          description: "Title and date are required",
          variant: "destructive"
        });
        return;
      }
      
      const newMemory = {
        user_id: user.id,
        title,
        description,
        date,
        emotion,
        location,
        is_private: isPrivate,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('memories')
        .insert(newMemory)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Memory added successfully"
      });
      
      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setDate('');
      setEmotion('');
      setLocation('');
      setIsPrivate(false);
      setIsAddingMemory(false);
      
      // Add new memory to the list
      setMemories([data, ...memories.slice(0, 4)]);
      
      // Update stats
      setStats({
        ...stats,
        totalMemories: stats.totalMemories + 1
      });
      
    } catch (error: any) {
      console.error('Error adding memory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add memory",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateTimeCapsule = () => {
    toast({
      title: "Coming Soon",
      description: "Time Capsule feature will be available soon!"
    });
  };
  
  const handleConnectWithFriends = () => {
    navigate('/friends');
    toast({
      title: "Friends",
      description: "Explore and connect with others"
    });
  };
  
  const handleAccountSettings = () => {
    navigate('/settings');
    toast({
      title: "Account Settings",
      description: "Manage your account preferences"
    });
  };
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your MEMORIA overview.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isAddingMemory} onOpenChange={setIsAddingMemory}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Memory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Memory</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input 
                      id="title" 
                      placeholder="Memory title" 
                      className="col-span-3"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input 
                      id="date" 
                      type="date" 
                      className="col-span-3"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="emotion" className="text-right">
                      Emotion
                    </Label>
                    <Select onValueChange={setEmotion} value={emotion}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an emotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>
                            {emotion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input 
                      id="location" 
                      placeholder="Where did this happen?" 
                      className="col-span-3"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write about this memory..."
                      className="col-span-3"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMemory(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleAddMemory}>Save Memory</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-secondary/50">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Memories</p>
                <p className="text-3xl font-bold">{stats.totalMemories}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <File className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/50">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Timeline Years</p>
                <p className="text-3xl font-bold">{stats.timelineYears}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/50">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Emotional Tags</p>
                <p className="text-3xl font-bold">{stats.emotions}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Heart className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/50">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-3xl font-bold">{stats.locations}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Map className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Memories */}
          <div className="lg:col-span-2">
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle>Your Recent Memories</CardTitle>
                <CardDescription>Your latest entries on your timeline</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg border border-muted flex justify-between items-center">
                        <div className="w-3/4">
                          <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-3/4 opacity-50"></div>
                        </div>
                        <div className="h-8 w-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">You haven't created any memories yet.</p>
                    <Button onClick={() => setIsAddingMemory(true)} className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Memory
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div 
                        key={memory.id}
                        className="p-4 rounded-lg border border-muted flex justify-between items-center hover:border-primary transition-colors duration-200"
                      >
                        <div>
                          <p className="font-medium">{memory.title}</p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(memory.date).toLocaleDateString()}
                            {memory.emotion && (
                              <>
                                <span className="mx-2">•</span>
                                <Heart className="mr-1 h-3 w-3 text-primary" />
                                {memory.emotion}
                              </>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/memory/${memory.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <Link to="/timeline">
                    <Button variant="outline">
                      View All Memories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Tools to manage your timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={() => setIsAddingMemory(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Memory
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={handleCreateTimeCapsule}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Create Time Capsule
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={handleConnectWithFriends}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect with Friends
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={handleAccountSettings}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Analytics */}
            <Card className="bg-secondary/50 mt-6">
              <CardHeader>
                <CardTitle>Your Timeline Analytics</CardTitle>
                <CardDescription>Insights from your memories</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.emotions > 0 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Top Emotions</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-2/3"></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Joy (67%)</span>
                        <span>Others (33%)</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Memories Per Year</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-4/5"></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>2023 (80%)</span>
                        <span>Others (20%)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {stats.emotions === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">Add more memories to see analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
