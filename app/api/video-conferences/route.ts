import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/app/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'public';
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');

    let whereClause: any = {};

    if (filter === 'my') {
      whereClause.hostId = user.id;
    } else if (filter === 'public') {
      whereClause.isPrivate = false;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { host: { displayName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (subject && subject !== 'all') {
      whereClause.subject = subject;
    }

    const conferences = await prisma.videoConference.findMany({
      where: whereClause,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        participants: {
          where: {
            leftAt: null, // Only count active participants
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedConferences = conferences.map(conf => ({
      id: conf.id,
      meetingId: conf.meetingId,
      title: conf.title,
      description: conf.description,
      subject: conf.subject,
      isPrivate: conf.isPrivate,
      maxParticipants: conf.maxParticipants,
      scheduledFor: conf.scheduledFor?.toISOString(),
      host: conf.host,
      activeParticipants: conf.participants.length,
      status: getConferenceStatus(conf.scheduledFor, conf.participants.length > 0),
      createdAt: conf.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedConferences);
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json({ error: 'Failed to fetch conferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, subject, isPrivate, maxParticipants, scheduledFor } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate unique meeting ID
    const meetingId = generateMeetingId();

    const conference = await prisma.videoConference.create({
      data: {
        meetingId,
        title: title.trim(),
        description: description?.trim(),
        subject,
        isPrivate: Boolean(isPrivate),
        maxParticipants: Math.max(2, Math.min(100, Number(maxParticipants) || 50)),
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        hostId: user.id,
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: conference.id,
      meetingId: conference.meetingId,
      title: conference.title,
      description: conference.description,
      subject: conference.subject,
      isPrivate: conference.isPrivate,
      maxParticipants: conference.maxParticipants,
      scheduledFor: conference.scheduledFor?.toISOString(),
      host: conference.host,
      activeParticipants: 0,
      status: getConferenceStatus(conference.scheduledFor, false),
      createdAt: conference.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating conference:', error);
    return NextResponse.json({ error: 'Failed to create conference' }, { status: 500 });
  }
}

function generateMeetingId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getConferenceStatus(scheduledFor: Date | null, hasActiveParticipants: boolean): 'scheduled' | 'active' | 'ended' {
  if (!scheduledFor) {
    return hasActiveParticipants ? 'active' : 'scheduled';
  }

  const now = new Date();
  const scheduled = new Date(scheduledFor);

  if (now < scheduled) {
    return 'scheduled';
  } else if (hasActiveParticipants) {
    return 'active';
  } else {
    return 'ended';
  }
}
