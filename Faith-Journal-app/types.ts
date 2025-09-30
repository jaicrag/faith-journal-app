
export enum EntryType {
  Testimony = 'testimony',
  Gratitude = 'gratitude',
  PrayerRequest = 'prayer_request',
}

export enum Status {
  Pending = 'pending',
  InProgress = 'in_progress',
  Answered = 'answered',
}

export interface Entry {
  id: number;
  type: EntryType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  personName: string;
  title?: string;
  details: string;
  tags: string[];
  status?: Status;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export type Language = 'en' | 'es';

export type View = 'dashboard' | 'list' | 'settings';

export type Translations = {
    [key: string]: { [key: string]: string };
};