
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useProfilePicture() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadProfilePicture = async (file: File, userId: string) => {
    try {
      setUploading(true);

      // Create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'profile_pictures')) {
        await supabase.storage.createBucket('profile_pictures', {
          public: true
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Error uploading picture',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfilePicture,
    uploading,
  };
}
