import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Successfully connected to MongoDB' 
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to connect to MongoDB' 
    }, { 
      status: 500 
    });
  }
} 