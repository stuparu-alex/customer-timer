import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Customer } from '@/app/models/Customer';
import mongoose from 'mongoose';
import { toCustomerBase } from '@/app/utils/mongoHelpers';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await request.json();
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toCustomerBase(updatedCustomer));
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedCustomer = await Customer.findByIdAndDelete(params.id);
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 