import { usersMockData } from '@/features/users/data/usersMockData'
import { type ActivityLog } from './schema'

function getUser(userId: string) {
  const user = usersMockData.find((item) => item.id === userId)

  if (!user) {
    return {
      userId,
      userName: 'System User',
      userRole: 'Viewer' as const,
    }
  }

  return {
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
  }
}

export const activityLogsMockData: ActivityLog[] = [
  {
    id: 'log-001',
    ...getUser('admin-default'),
    action: 'Create',
    module: 'Cars',
    entityType: 'Car',
    entityName: 'Toyota Camry 2020',
    description: 'Created a new car record for Toyota Camry 2020.',
    changedFields: [
      { field: 'Brand', oldValue: '-', newValue: 'Toyota' },
      { field: 'Model', oldValue: '-', newValue: 'Camry' },
      { field: 'Status', oldValue: '-', newValue: 'Purchased' },
    ],
    date: '2026-06-02',
    time: '09:14',
    createdAt: '2026-06-02T09:14:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'log-002',
    ...getUser('user-002'),
    action: 'Update',
    module: 'Cars',
    entityType: 'Car',
    entityName: 'Honda Civic 2019',
    description: 'Updated car status from Shipping to Repairing.',
    changedFields: [
      { field: 'Status', oldValue: 'Shipping', newValue: 'Repairing' },
    ],
    date: '2026-06-02',
    time: '10:32',
    createdAt: '2026-06-02T10:32:00',
    ipAddress: '192.168.1.24',
  },
  {
    id: 'log-003',
    ...getUser('user-003'),
    action: 'Create',
    module: 'Expenses',
    entityType: 'Expense',
    entityName: 'Honda Civic 2019 repair expense',
    description: 'Created a new repair expense for Honda Civic 2019.',
    changedFields: [
      { field: 'Expense Type', oldValue: '-', newValue: 'Repair' },
      { field: 'Amount', oldValue: '-', newValue: '$1,250' },
      { field: 'Payment Method', oldValue: '-', newValue: 'Zelle' },
    ],
    date: '2026-06-03',
    time: '11:08',
    createdAt: '2026-06-03T11:08:00',
    ipAddress: '192.168.1.31',
  },
  {
    id: 'log-004',
    ...getUser('admin-default'),
    action: 'Delete',
    module: 'Users',
    entityType: 'User',
    entityName: 'Temporary Viewer',
    description: 'Deleted a temporary viewer account from the system.',
    changedFields: [
      { field: 'Status', oldValue: 'Active', newValue: 'Deleted' },
    ],
    date: '2026-06-03',
    time: '13:45',
    createdAt: '2026-06-03T13:45:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'log-005',
    ...getUser('user-005'),
    action: 'Login',
    module: 'Users',
    entityType: 'Session',
    entityName: 'Dashboard login',
    description: 'User logged in to the dashboard.',
    changedFields: [],
    date: '2026-06-04',
    time: '08:18',
    createdAt: '2026-06-04T08:18:00',
    ipAddress: '192.168.1.41',
  },
  {
    id: 'log-006',
    ...getUser('user-002'),
    action: 'Update',
    module: 'Partners',
    entityType: 'Contribution',
    entityName: 'North Yard Partners contribution',
    description: 'Updated partner contribution amount after invoice review.',
    changedFields: [
      { field: 'Contribution Amount', oldValue: '$8,000', newValue: '$9,500' },
      { field: 'Payment Method', oldValue: 'Cash', newValue: 'Bank Transfer' },
    ],
    date: '2026-06-04',
    time: '15:06',
    createdAt: '2026-06-04T15:06:00',
    ipAddress: '192.168.1.24',
  },
  {
    id: 'log-007',
    ...getUser('admin-default'),
    action: 'Update',
    module: 'Titles',
    entityType: 'Title',
    entityName: 'Toyota Camry 2020 title',
    description: 'Changed title type from Salvage to Rebuilt.',
    changedFields: [
      {
        field: 'Title Type',
        oldValue: 'Salvage Title',
        newValue: 'Rebuilt Title',
      },
    ],
    date: '2026-06-05',
    time: '09:52',
    createdAt: '2026-06-05T09:52:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'log-008',
    ...getUser('user-002'),
    action: 'Update',
    module: 'Inspections',
    entityType: 'Inspection',
    entityName: 'Mercedes-Benz C-Class 2022 inspection',
    description: 'Uploaded inspection document and updated inspection notes.',
    changedFields: [
      { field: 'Document', oldValue: '-', newValue: 'inspection-result.pdf' },
      { field: 'Reminder Sent', oldValue: 'No', newValue: 'Yes' },
    ],
    date: '2026-06-05',
    time: '14:20',
    createdAt: '2026-06-05T14:20:00',
    ipAddress: '192.168.1.24',
  },
  {
    id: 'log-009',
    ...getUser('user-001'),
    action: 'Create',
    module: 'Notifications',
    entityType: 'Notification',
    entityName: 'Critical inspection failed',
    description: 'Created a critical inspection alert for a failed inspection.',
    changedFields: [
      { field: 'Severity', oldValue: '-', newValue: 'Critical' },
      { field: 'Status', oldValue: '-', newValue: 'Unread' },
    ],
    date: '2026-06-06',
    time: '10:05',
    createdAt: '2026-06-06T10:05:00',
    ipAddress: '192.168.1.18',
  },
  {
    id: 'log-010',
    ...getUser('user-003'),
    action: 'Update',
    module: 'Reports',
    entityType: 'Report',
    entityName: 'Expenses Report',
    description: 'Generated an expenses report preview for May operations.',
    changedFields: [
      { field: 'Date Range', oldValue: 'Custom', newValue: 'May 2026' },
    ],
    date: '2026-06-06',
    time: '16:28',
    createdAt: '2026-06-06T16:28:00',
    ipAddress: '192.168.1.31',
  },
]

export function formatActivityLogDate(value: string, locale: 'en' | 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
