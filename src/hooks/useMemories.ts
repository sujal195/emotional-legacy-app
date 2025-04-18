
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Memory } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useMemories(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const memoriesQuery = useQuery({
    queryKey: ['memories', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Memory[];
    },
    enabled: !!userId,
  });

  const createMemory = useMutation({
    mutationFn: async (newMemory: Omit<Memory, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('memories')
        .insert([{ ...newMemory, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', userId] });
      toast({
        title: 'Memory created',
        description: 'Your memory has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating memory',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    memories: memoriesQuery.data || [],
    isLoading: memoriesQuery.isLoading,
    error: memoriesQuery.error,
    createMemory: createMemory.mutate,
    stats: {
      total: memoriesQuery.data?.length || 0,
      locations: new Set(memoriesQuery.data?.map(m => m.location).filter(Boolean)).size,
      emotions: new Set(memoriesQuery.data?.map(m => m.emotion).filter(Boolean)).size,
      timelineYears: new Set(memoriesQuery.data?.map(m => new Date(m.date).getFullYear())).size,
    },
  };
}
