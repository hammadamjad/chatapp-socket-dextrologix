import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { SignupCredentials, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SignupCredentials = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'All fields are required',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Passwords do not match',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    await connectDB();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: 'credentials',
    });

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          provider: user.provider,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
