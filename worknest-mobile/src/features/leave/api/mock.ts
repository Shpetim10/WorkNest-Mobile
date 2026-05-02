import { LeaveBalance, LeaveRequest } from '../types';

export const MOCK_LEAVE_BALANCES: LeaveBalance[] = [
  {
    type: 'vacation',
    label: 'Vacation',
    total: 20,
    used: 5,
    available: 15,
  },
  {
    type: 'sick',
    label: 'Sick Leave',
    total: 10,
    used: 2,
    available: 8,
  },
  {
    type: 'personal',
    label: 'Personal',
    total: 5,
    used: 1,
    available: 4,
  },
];

export const MOCK_LEAVE_HISTORY: LeaveRequest[] = [
  {
    id: '1',
    type: 'vacation',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    status: 'pending',
    note: 'Family trip to the mountains.',
    createdAt: '2026-04-28T10:00:00Z',
  },
  {
    id: '2',
    type: 'sick',
    startDate: '2026-04-20',
    endDate: '2026-04-21',
    status: 'approved',
    createdAt: '2026-04-19T08:30:00Z',
  },
  {
    id: '3',
    type: 'personal',
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    status: 'approved',
    note: 'Personal errand.',
    createdAt: '2026-03-10T14:20:00Z',
  },
  {
    id: '4',
    type: 'vacation',
    startDate: '2026-02-01',
    endDate: '2026-02-10',
    status: 'rejected',
    note: 'Winter holiday.',
    createdAt: '2026-01-15T09:00:00Z',
  },
];
