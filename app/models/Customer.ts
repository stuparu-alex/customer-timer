import { CustomerBase } from '../types/customer';
import mongoose, { Schema, Document } from 'mongoose';

export interface CustomerDocument extends Omit<CustomerBase, '_id'>, Document {}

const customerSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['waiting', 'checked-in', 'checked-out'],
    default: 'waiting'
  },
  checkInTime: { 
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  interval: {
    duration: { type: Number, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    isNearingEnd: { type: Boolean, default: false },
    hasExtended: { type: Boolean, default: false },
    extensionCount: { type: Number, default: 0 },
    lastExtensionTime: { type: Number, default: null }
  },
  history: [{
    checkIn: String,
    checkOut: String,
    duration: Number,
    wasExtended: Boolean,
    completedSession: Boolean,
    timeEnded: Boolean,
    extensionsUsed: Number
  }]
}, {
  timestamps: true
});

export const Customer = mongoose.models.Customer || 
  mongoose.model<CustomerDocument>('Customer', customerSchema); 