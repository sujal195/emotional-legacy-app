import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: sentFriends, error: sentError } = await supabase
        .from('friend_requests')
        .select('*, receiver:receiver_id(*)')
        .eq('sender_id', user.id)
        .eq('status', 'accepted');

      if (sentError) throw sentError;

      const { data: receivedFriends, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*, sender:sender_id(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'accepted');

      if (receivedError) throw receivedError;

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

      const { data: pendingData, error: pendingError } = await supabase
        .from('friend_requests')
        .select('*, sender:sender_id(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;
      setPendingRequests(pendingData || []);

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
  }, [user, toast]);

  useEffect(() => {
    fetchFriends();
  }, [user, fetchFriends]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    try {
      setSearchLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      const friendIds = new Set(friends.map(f => f.friend.id));
      const pendingIds = new Set(pendingRequests.map(r => r.sender?.id));
      const sentIds = new Set(sentRequests.map(r => r.receiver?.id));

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
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Sent",
        description: "Friend request sent successfully"
      });

      await fetchFriends();  // Refresh after sending request
      setSearchResults(searchResults.filter(r => r.id !== profileId));

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

      toast({
        title: action === 'accept' ? "Request Accepted" : "Request Rejected",
        description: action === 'accept'
          ? "You are now friends with this user"
          : "Friend request rejected"
      });

      await fetchFriends(); // Refresh after accept/reject

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

      toast({
        title: "Friend Removed",
        description: "Friend has been removed from your list"
      });

      await fetchFriends(); // Refresh after removing friend

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

      toast({
        title: "Request Cancelled",
        description: "Friend request has been cancelled"
      });

      await fetchFriends(); // Refresh after cancelling

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
    // Your UI remains same here
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header, Search bar, and Friend List UI */}
      </div>
    </div>
  );
};

export default Friends;
