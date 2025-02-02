import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Customer } from '@/app/models/Customer';

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find({})
      .lean()
      .then(customers => 
        customers
          .filter(c => c.status === 'checked-in')  // Only get checked-in customers
          .sort((a, b) => {
            // Calculate remaining time for each customer
            const now = Date.now();
            const remainingTimeA = a.interval.endTime - now;
            const remainingTimeB = b.interval.endTime - now;
            return remainingTimeA - remainingTimeB;  // Sort ascending (least time first)
          })
          // Then add checked-out customers at the end
          .concat(customers.filter(c => c.status === 'checked-out'))
      );

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const customer = await Customer.create({
      ...data,
      checkInTime: new Date().toLocaleTimeString(),
      interval: {
        ...data.interval,
        startTime: Date.now(),
        endTime: Date.now() + (data.interval.duration * 60 * 1000)
      }
    });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' }, 
      { status: 500 }
    );
  }
} 