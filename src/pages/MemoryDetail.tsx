
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Calendar, MapPin, MessageCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Memory } from '@/lib/supabase';

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch memory details
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setMemory(data);
        
        // Check if the memory is liked by the user
        if (user) {
          const { data: likeData, error: likeError } = await supabase
            .from('memory_likes')
            .select('*')
            .eq('memory_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!likeError && likeData) {
            setIsLiked(true);
          }
        }
      } catch (error: any) {
        console.error('Error fetching memory:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load memory',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemory();
  }, [id, user, toast]);
  
  const handleLikeToggle = async () => {
    if (!user || !memory) return;
    
    try {
      if (isLiked) {
        // Unlike the memory
        await supabase
          .from('memory_likes')
          .delete()
          .match({ user_id: user.id, memory_id: memory.id });
        setIsLiked(false);
      } else {
        // Like the memory
        await supabase
          .from('memory_likes')
          .insert({ user_id: user.id, memory_id: memory.id });
        setIsLiked(true);
      }
      
      toast({
        title: isLiked ? 'Memory unliked' : 'Memory liked',
        description: isLiked ? 'You have unliked this memory' : 'You have liked this memory',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like status',
        variant: 'destructive'
      });
    }
  };
  
  const handleDelete = async () => {
    if (!user || !memory) return;
    
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memory.id);
        
      if (error) throw error;
      
      toast({
        title: 'Memory deleted',
        description: 'Your memory has been deleted successfully',
      });
      
      // Navigate back to timeline
      window.location.href = '/timeline';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete memory',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!memory) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Memory Not Found</h1>
          <p className="text-muted-foreground mb-6">This memory doesn't exist or you don't have permission to view it.</p>
          <Link to="/timeline">
            <Button>Back to Timeline</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = user?.id === memory.user_id;
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6 space-x-4">
            <Link to="/timeline">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Timeline
              </Button>
            </Link>
            
            {isOwner && (
              <div className="ml-auto flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex items-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this memory
                        and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{memory.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLikeToggle}
                  className={`${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className="h-5 w-5 mr-1" fill={isLiked ? "currentColor" : "none"} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {memory.date && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-background">
                    <Calendar className="h-3 w-3" />
                    {new Date(memory.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Badge>
                )}
                
                {memory.emotion && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/30">
                    <Heart className="h-3 w-3" />
                    {memory.emotion}
                  </Badge>
                )}
                
                {memory.location && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-background">
                    <MapPin className="h-3 w-3" />
                    {memory.location}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="prose max-w-none mb-6">
                <p className="text-lg text-muted-foreground">{memory.description}</p>
              </div>
              
              {memory.image_url && (
                <div className="my-6 rounded-md overflow-hidden bg-muted max-h-96">
                  <img 
                    src={memory.image_url} 
                    alt={memory.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Add Comment
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Created {new Date(memory.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;
