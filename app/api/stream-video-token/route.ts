import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { validateRequest } from '@/app/auth';

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiSecret = process.env.NEXT_PUBLIC_STREAM_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: 'Stream secret not configured' }, { status: 500 });
    }

    // Generate Stream Video token
    const payload = {
      user_id: user.id,
      iss: 'https://pronto.getstream.io',
      sub: `user/${user.id}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' });

    return NextResponse.json({ 
      token,
      user: {
        id: user.id,
        name: user.displayName,
        image: user.avatarUrl,
      }
    });
  } catch (error) {
    console.error('Error generating Stream Video token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
