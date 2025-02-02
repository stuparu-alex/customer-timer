import { Document } from 'mongoose';

export interface TimeOption {
  label: string;
  value: number;
}

export const TIME_OPTIONS: TimeOption[] = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 }
];

export interface CustomerBase {
  _id: string;
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
  checkIn: string;
  checkOut: string;
  duration: number;
  wasExtended: boolean;
  completedSession: boolean;
  timeEnded: boolean;
  extensionsUsed: number;
} 