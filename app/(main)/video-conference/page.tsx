'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Video, Users, Calendar, Clock, Plus, Search, Copy, Edit, Trash2, Play, Globe, Lock } from 'lucide-react';
import { useSession } from '@/app/(main)/SessionProvider';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import VideoCall from '@/components/video/VideoCall';

interface Conference {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  subject?: string;
  isPrivate: boolean;
  maxParticipants: number;
  scheduledFor?: string;
  host: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  activeParticipants: number;
  status: 'scheduled' | 'active' | 'ended';
  createdAt: string;
}

export default function VideoConferencePage() {
  const { user } = useSession();
  const client = useStreamVideoClient();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentCall, setCurrentCall] = useState<any>(null);
  
  // Create meeting form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subject: '',
    isPrivate: false,
    maxParticipants: 50,
    scheduledFor: '',
  });

  const subjects = [
    'Mathematics',
    'Science',
    'Computer Science',
    'History',
    'Literature',
    'Languages',
    'Art',
    'Music',
    'General Discussion'
  ];

  useEffect(() => {
    fetchConferences();
  }, [activeTab, searchTerm, subjectFilter]);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab === 'my') {
        params.append('filter', 'my');
      } else {
        params.append('filter', 'public');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (subjectFilter !== 'all') {
        params.append('subject', subjectFilter);
      }

      const response = await fetch(`/api/video-conferences?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConferences(data || []);
      } else {
        setConferences([]);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setConferences([]);
      toast.error('Failed to load conferences');
    } finally {
      setLoading(false);
    }
  };

  const createConference = async () => {
    if (!createForm.title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    try {
      const response = await fetch('/api/video-conferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const conference = await response.json();
        toast.success('Meeting created successfully!');
        setIsCreateDialogOpen(false);
        setCreateForm({
          title: '',
          description: '',
          subject: '',
          isPrivate: false,
          maxParticipants: 50,
          scheduledFor: '',
        });
        fetchConferences();
        
        // Auto-join the created meeting
        joinMeeting(conference.meetingId);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating conference:', error);
      toast.error('Failed to create meeting');
    }
  };

  const joinMeeting = async (meetingId: string) => {
    if (!client || !meetingId.trim()) {
      toast.error('Please enter a valid meeting ID');
      return;
    }

    try {
      // First, join the meeting in the database
      const response = await fetch('/api/video-conferences/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to join meeting');
        return;
      }

      // Create and join the Stream call
      const call = client.call('default', meetingId);
      await call.join({ create: true });
      setCurrentCall(call);
      toast.success('Joined meeting successfully!');
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    }
  };

  const leaveMeeting = () => {
    setCurrentCall(null);
    fetchConferences(); // Refresh the list
  };

  const copyMeetingId = (meetingId: string) => {
    navigator.clipboard.writeText(meetingId);
    toast.success('Meeting ID copied to clipboard!');
  };

  const deleteConference = async (conferenceId: string) => {
    try {
      const response = await fetch(`/api/video-conferences/${conferenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Meeting deleted successfully');
        fetchConferences();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete meeting');
      }
    } catch (error) {
      console.error('Error deleting conference:', error);
      toast.error('Failed to delete meeting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (currentCall) {
    return <VideoCall call={currentCall} onLeave={leaveMeeting} meetingId={''} meetingName={''} />;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Conferences</h1>
            <p className="text-gray-600">Host and join educational video conferences</p>
          </div>
        </div>

        {/* Quick Join */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="join-meeting-id">Join with Meeting ID</Label>
                <Input
                  id="join-meeting-id"
                  placeholder="Enter meeting ID..."
                  value={joinMeetingId}
                  onChange={(e) => setJoinMeetingId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => joinMeeting(joinMeetingId)}
                className="mt-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Meetings</TabsTrigger>
            <TabsTrigger value="my">My Meetings</TabsTrigger>
          </TabsList>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter meeting title..."
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Meeting description..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={createForm.subject}
                    onValueChange={(value) => setCreateForm({ ...createForm, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    max="100"
                    value={createForm.maxParticipants}
                    onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) || 50 })}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={createForm.scheduledFor}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledFor: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
                  />
                  <Label htmlFor="isPrivate">Private Meeting</Label>
                </div>

                <Button onClick={createConference} className="w-full">
                  Create Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="browse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : conferences.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600">Try adjusting your search or create a new meeting.</p>
              </div>
            ) : (
              conferences.map((conference) => (
                <Card key={conference.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{conference.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>by {conference.host.displayName}</span>
                          {conference.isPrivate ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(conference.status)} text-white`}>
                        {conference.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conference.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {conference.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {conference.subject && (
                        <Badge variant="secondary">{conference.subject}</Badge>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{conference.activeParticipants}/{conference.maxParticipants} participants</span>
                      </div>
                      {conference.scheduledFor && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(conference.scheduledFor).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => joinMeeting(conference.meetingId)}
                        className="flex-1"
                        disabled={conference.status === 'ended'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMeetingId(conference.meetingId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : conferences.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings created yet</h3>
                <p className="text-gray-600 mb-4">Create your first meeting to get started.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Meeting
                </Button>
              </div>
            ) : (
              conferences.map((conference) => (
                <Card key={conference.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{conference.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Meeting ID: {conference.meetingId}</span>
                          {conference.isPrivate ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(conference.status)} text-white`}>
                        {conference.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conference.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {conference.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {conference.subject && (
                        <Badge variant="secondary">{conference.subject}</Badge>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{conference.activeParticipants}/{conference.maxParticipants} participants</span>
                      </div>
                      {conference.scheduledFor && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(conference.scheduledFor).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => joinMeeting(conference.meetingId)}
                        className="flex-1"
                        disabled={conference.status === 'ended'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start/Join
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyMeetingId(conference.meetingId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteConference(conference.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
