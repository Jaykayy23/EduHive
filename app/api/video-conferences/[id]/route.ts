import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/app/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conferenceId = params.id;

    // Check if user is the host
    const conference = await prisma.videoConference.findUnique({
      where: { id: conferenceId },
      select: { hostId: true },
    });

    if (!conference) {
      return NextResponse.json({ error: 'Conference not found' }, { status: 404 });
    }

    if (conference.hostId !== user.id) {
      return NextResponse.json({ error: 'Only the host can delete this conference' }, { status: 403 });
    }

    // Delete the conference (participants will be deleted due to cascade)
    await prisma.videoConference.delete({
      where: { id: conferenceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conference:', error);
    return NextResponse.json({ error: 'Failed to delete conference' }, { status: 500 });
  }
}
