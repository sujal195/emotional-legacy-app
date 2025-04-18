
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Check, X, Search, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Friends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch accepted friends where user is the requester
        const { data: sentFriends, error: sentError } = await supabase
          .from('friend_requests')
          .select('*, receiver:receiver_id(*)')
          .eq('sender_id', user.id)
          .eq('status', 'accepted');
          
        if (sentError) throw sentError;
        
        // Fetch accepted friends where user is the receiver
        const { data: receivedFriends, error: receivedError } = await supabase
          .from('friend_requests')
          .select('*, sender:sender_id(*)')
          .eq('receiver_id', user.id)
          .eq('status', 'accepted');
          
        if (receivedError) throw receivedError;
        
        // Combine and format friends list
        const formattedFriends = [
          ...(sentFriends || []).map(req => ({
            id: req.id,
            friend: req.receiver,
            created_at: req.created_at
          })),
          ...(receivedFriends || []).map(req => ({
            id: req.id,
            friend: req.sender,
            created_at: req.created_at
          }))
        ];
        
        setFriends(formattedFriends);
        
        // Fetch pending requests (received)
        const { data: pendingData, error: pendingError } = await supabase
          .from('friend_requests')
          .select('*, sender:sender_id(*)')
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
          
        if (pendingError) throw pendingError;
        setPendingRequests(pendingData || []);
        
        // Fetch sent requests (pending)
        const { data: sentData, error: sentReqError } = await supabase
          .from('friend_requests')
          .select('*, receiver:receiver_id(*)')
          .eq('sender_id', user.id)
          .eq('status', 'pending');
          
        if (sentReqError) throw sentReqError;
        setSentRequests(sentData || []);
        
      } catch (error: any) {
        console.error('Error fetching friends:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load friends",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, [user, toast]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    
    try {
      setSearchLoading(true);
      
      // Search users by email or name
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);
        
      if (error) throw error;
      
      // Filter out users who are already friends or have pending requests
      const friendIds = new Set(friends.map(f => f.friend.id));
      const pendingIds = new Set(pendingRequests.map(r => r.sender.id));
      const sentIds = new Set(sentRequests.map(r => r.receiver.id));
      
      const filteredResults = (data || []).filter(profile => 
        !friendIds.has(profile.id) && 
        !pendingIds.has(profile.id) && 
        !sentIds.has(profile.id)
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        toast({
          title: "No results",
          description: "No new users found matching your search"
        });
      }
      
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleSendRequest = async (profileId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: profileId,
          status: 'pending'
        })
        .select();
        
      if (error) throw error;
      
      // Add to sent requests
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
        
      setSentRequests([...sentRequests, { ...data[0], receiver: profile }]);
      
      // Remove from search results
      setSearchResults(searchResults.filter(r => r.id !== profileId));
      
      toast({
        title: "Request Sent",
        description: "Friend request sent successfully"
      });
      
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive"
      });
    }
  };
  
  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      if (action === 'accept') {
        // Move from pending to friends
        const request = pendingRequests.find(r => r.id === requestId);
        if (request) {
          setFriends([...friends, { id: request.id, friend: request.sender, created_at: request.created_at }]);
        }
      }
      
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      
      toast({
        title: action === 'accept' ? "Request Accepted" : "Request Rejected",
        description: action === 'accept' 
          ? "You are now friends with this user" 
          : "Friend request rejected"
      });
      
    } catch (error: any) {
      console.error(`Error ${action}ing friend request:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} friend request`,
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);
        
      if (error) throw error;
      
      // Remove from friends list
      setFriends(friends.filter(f => f.id !== friendshipId));
      
      toast({
        title: "Friend Removed",
        description: "Friend has been removed from your list"
      });
      
    } catch (error: any) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove friend",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Remove from sent requests
      setSentRequests(sentRequests.filter(r => r.id !== requestId));
      
      toast({
        title: "Request Cancelled",
        description: "Friend request has been cancelled"
      });
      
    } catch (error: any) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel friend request",
        variant: "destructive"
      });
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view and manage friends.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground">Connect with others and explore shared memories</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-6">
                  <Input 
                    placeholder="Search by name or email" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.map((profile) => (
                      <div 
                        key={profile.id} 
                        className="flex items-center justify-between border-b border-muted pb-4"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.full_name || "User"}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleSendRequest(profile.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="friends">
              <TabsList className="w-full">
                <TabsTrigger value="friends" className="flex-1">
                  Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">
                  Pending Requests ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">
                  Sent Requests ({sentRequests.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="friends" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading friends...</div>
                    ) : friends.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You don't have any friends yet.</p>
                        <p className="text-sm">Use the search above to find and add friends.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {friends.map((friendship) => (
                          <div 
                            key={friendship.id} 
                            className="flex items-center justify-between border-b border-muted pb-4 last:border-0"
                          >
                            <Link to={`/profile/${friendship.friend.id}`} className="flex items-center space-x-3 flex-1">
                              <Avatar>
                                <AvatarImage src={friendship.friend.avatar_url} />
                                <AvatarFallback>
                                  {friendship.friend.full_name?.charAt(0) || friendship.friend.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{friendship.friend.full_name || "User"}</p>
                                <p className="text-sm text-muted-foreground">{friendship.friend.email}</p>
                              </div>
                            </Link>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                              >
                                <Link to={`/profile/${friendship.friend.id}`}>
                                  View Profile
                                </Link>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveFriend(friendship.id)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pending" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading requests...</div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You don't have any pending friend requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center justify-between border-b border-muted pb-4 last:border-0"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={request.sender.avatar_url} />
                                <AvatarFallback>
                                  {request.sender.full_name?.charAt(0) || request.sender.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.sender.full_name || "User"}</p>
                                <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleRequestAction(request.id, 'accept')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRequestAction(request.id, 'reject')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sent" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading sent requests...</div>
                    ) : sentRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You haven't sent any friend requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentRequests.map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center justify-between border-b border-muted pb-4 last:border-0"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={request.receiver.avatar_url} />
                                <AvatarFallback>
                                  {request.receiver.full_name?.charAt(0) || request.receiver.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.receiver.full_name || "User"}</p>
                                <p className="text-sm text-muted-foreground">{request.receiver.email}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              Cancel Request
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Friend Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Friend suggestions will be available soon!
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Recent friend activity will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
