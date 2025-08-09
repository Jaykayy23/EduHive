'use client';

import { useEffect } from 'react';
import {
  Call,
  CallControls,
  CallStatsButton,
  CallingState,
  CancelCallButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { PhoneOff, Users, Settings } from 'lucide-react';

interface VideoCallProps {
  call: Call;
  onLeave: () => void;
}

export default function VideoCall({ call, onLeave }: VideoCallProps) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  useEffect(() => {
    const handleBeforeUnload = () => {
      call.leave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [call]);

  const handleLeave = async () => {
    await call.leave();
    onLeave();
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">EduHive Conference</h1>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{participantCount} participants</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CallStatsButton />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeave}
            className="flex items-center space-x-2"
          >
            <PhoneOff className="h-4 w-4" />
            <span>Leave</span>
          </Button>
        </div>
      </div>

      {/* Video Layout */}
      <div className="flex-1 relative">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <CallControls onLeave={handleLeave} />
      </div>
    </div>
  );
}
