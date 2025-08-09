'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { useUser } from '@/app/(main)/SessionProvider';
import { Loader2 } from 'lucide-react';

interface StreamVideoProviderProps {
  children: ReactNode;
}

export default function StreamVideoProvider({ children }: StreamVideoProviderProps) {
  const { user } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const initializeClient = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
        if (!apiKey) {
          console.error('Stream API key not found');
          setIsLoading(false);
          return;
        }

        // Get token from our API
        const response = await fetch('/api/stream-video-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream token');
        }

        const { token } = await response.json();

        const streamUser: User = {
          id: user.id,
          name: user.displayName,
          image: user.avatarUrl,
        };

        const client = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token,
        });

        setVideoClient(client);
      } catch (error) {
        console.error('Error initializing Stream Video client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!videoClient) {
    return <div>{children}</div>;
  }

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
}
