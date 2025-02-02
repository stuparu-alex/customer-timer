import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Customer } from '@/app/models/Customer';
import { CustomerBase } from '@/app/types/customer';
import { toCustomerBase, WithId } from '@/app/utils/mongoHelpers';
import { CustomerDocument } from '@/app/models/Customer';

type ApiResponse<T> = NextResponse<T | { error: string }>;

export async function GET(): Promise<ApiResponse<CustomerBase[]>> {
  try {
    await connectDB();
    const docs = await Customer.find({});
    const customers = docs.map(doc => toCustomerBase(doc));
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<ApiResponse<CustomerBase>> {
  try {
    await connectDB();
    const data = await request.json();
    const doc = await Customer.create({
      ...data,
      checkInTime: new Date().toLocaleTimeString(),
      interval: {
        ...data.interval,
        startTime: Date.now(),
        endTime: Date.now() + (data.interval.duration * 60 * 1000)
      }
    });

    const customer = toCustomerBase(doc);
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' }, 
      { status: 500 }
    );
  }
} 