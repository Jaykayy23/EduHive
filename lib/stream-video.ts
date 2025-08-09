import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

let client: StreamVideoClient | null = null;

export const getStreamVideoClient = async (user: User): Promise<StreamVideoClient> => {
  if (client) return client;

  try {
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

    client = new StreamVideoClient({
      apiKey,
      user,
      token,
    });

    return client;
  } catch (error) {
    console.error('Error creating Stream Video client:', error);
    throw error;
  }
};

export const disconnectStreamVideo = () => {
  if (client) {
    client.disconnectUser();
    client = null;
  }
};
