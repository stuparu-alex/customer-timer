import { CustomerBase } from '@/app/types/customer';
import { Customer, CustomerDocument } from '@/app/models/Customer';
import mongoose from 'mongoose';

export async function getCustomers(): Promise<CustomerBase[]> {
  const customers = await Customer.find({})
    .lean()
    .exec();

  return customers.map(doc => {
    const docWithId = doc as { _id: mongoose.Types.ObjectId };
    return {
      ...doc,
      _id: docWithId._id.toString(),
    } as unknown as CustomerBase;
  });
} 