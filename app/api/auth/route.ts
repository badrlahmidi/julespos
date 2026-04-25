import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import type { Role } from '../../../types/auth';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    // In a real production scenario with many users, fetching all users to compare hashes
    // is inefficient. Usually, an ID or username is provided first.
    // Since this is a POS with a shared terminal where users ONLY enter a PIN,
    // we must iterate through all active staff members and check the hash.

    let users = [];
    try {
      users = await prisma.user.findMany();
    } catch (dbError) {
      console.error("Database connection failed", dbError);
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    let authenticatedUser = null;

    for (const user of users) {
      if (!user.pinHash) continue;
      const isValid = await bcrypt.compare(pin, user.pinHash);
      if (isValid) {
        authenticatedUser = {
          id: user.id,
          name: user.name,
          role: user.role as Role
        };
        break;
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({ user: authenticatedUser }, { status: 200 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
