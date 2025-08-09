import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/app/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Find the conference
    const conference = await prisma.videoConference.findUnique({
      where: { meetingId },
      include: {
        participants: {
          where: { leftAt: null },
        },
      },
    });

    if (!conference) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if meeting is at capacity
    if (conference.participants.length >= conference.maxParticipants) {
      return NextResponse.json({ error: 'Meeting is at full capacity' }, { status: 400 });
    }

    // Check if user is already in the meeting
    const existingParticipant = await prisma.conferenceParticipant.findUnique({
      where: {
        conferenceId_userId: {
          conferenceId: conference.id,
          userId: user.id,
        },
      },
    });

    if (existingParticipant && !existingParticipant.leftAt) {
      return NextResponse.json({ error: 'You are already in this meeting' }, { status: 400 });
    }

    // Add user as participant
    if (existingParticipant) {
      // User rejoining - update leftAt to null
      await prisma.conferenceParticipant.update({
        where: { id: existingParticipant.id },
        data: { leftAt: null, joinedAt: new Date() },
      });
    } else {
      // New participant
      await prisma.conferenceParticipant.create({
        data: {
          conferenceId: conference.id,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining conference:', error);
    return NextResponse.json({ error: 'Failed to join conference' }, { status: 500 });
  }
}
