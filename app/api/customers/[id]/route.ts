import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Customer } from '@/app/models/Customer';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Use findOneAndUpdate with proper MongoDB update operators
    const customer = await Customer.findOneAndUpdate(
      { _id: params.id },
      { 
        $set: {
          status: data.status,
          'interval.endTime': data.interval?.endTime,
          'interval.isNearingEnd': data.interval?.isNearingEnd,
          'interval.hasExtended': data.interval?.hasExtended,
          'interval.extensionCount': data.interval?.extensionCount,
          'interval.lastExtensionTime': data.interval?.lastExtensionTime
        },
        // If there's history to add, push it to the array
        ...(data.history && {
          $push: { history: { $each: data.history } }
        })
      },
      { 
        new: true,
        runValidators: true 
      }
    ).lean();

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
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
    await Customer.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
} 