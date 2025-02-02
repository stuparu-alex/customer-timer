import mongoose from 'mongoose';
import { CustomerBase } from '../types/customer';

export type WithId<T> = T & {
  _id: mongoose.Types.ObjectId;
  toObject(): { _id: mongoose.Types.ObjectId } & T;
};

export const toCustomerBase = (doc: WithId<Omit<CustomerBase, '_id'>>): CustomerBase => {
  const obj = doc.toObject();
  return {
    ...obj,
    _id: obj._id.toString()
  };
}; 