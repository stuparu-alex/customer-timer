import { Document } from 'mongoose';

export interface Customer extends Document {
  _id: string;  // MongoDB id
  name: string;
  status: 'waiting' | 'checked-in' | 'checked-out';
  checkInTime: string;
  photo: string | null;
  interval: {
    duration: number;
    startTime: number;
    endTime: number;
    isNearingEnd: boolean;
    hasExtended: boolean;
    extensionCount: number;
    lastExtensionTime: number | null;
  };
  history: Array<{
    checkIn: string;
    checkOut: string;
    duration: number;
    wasExtended: boolean;
    completedSession: boolean;
    timeEnded: boolean;
    extensionsUsed: number;
  }>;
}

export interface CustomerRecord {
  id: string;
  name: string;
  totalVisits: number;
  lastVisit: string;
  status: 'active' | 'inactive';
  history: VisitRecord[];
}

export interface VisitRecord {
  checkInTime: string;
  checkOutTime: string;
  duration: number;
  wasExtended: boolean;
  completedSession: boolean;
  timeEnded: boolean;
}

export interface TimeOption {
  label: string;
  value: number; // minutes
}

export const TIME_OPTIONS: TimeOption[] = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 }
]; 