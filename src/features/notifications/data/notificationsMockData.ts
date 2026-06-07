import { type AppNotification } from './schema'

export const notificationsMockData: AppNotification[] = [
  {
    id: 'notification-001',
    title: 'Inspection reminder',
    message:
      'Toyota Camry 2020 needs a follow-up inspection before it can be listed for sale.',
    type: 'Inspection',
    severity: 'High',
    status: 'Unread',
    relatedCarId: 'car-001',
    relatedCarName: 'Toyota Camry 2020',
    createdAt: '2026-05-22',
    dueDate: '2026-06-08',
    actionUrl: '/cars/car-001',
    createdBy: 'Inspection Desk',
  },
  {
    id: 'notification-002',
    title: 'Car delayed without sale',
    message:
      'Honda Civic 2019 has been in shipping status longer than expected and needs follow-up.',
    type: 'Car Delay',
    severity: 'Medium',
    status: 'Unread',
    relatedCarId: 'car-002',
    relatedCarName: 'Honda Civic 2019',
    createdAt: '2026-05-25',
    dueDate: '2026-06-10',
    actionUrl: '/cars/car-002',
    createdBy: 'Operations',
  },
  {
    id: 'notification-003',
    title: 'Low parts inventory',
    message:
      'Ford Fusion 2018 requires parts review because related inventory is below the expected level.',
    type: 'Low Parts',
    severity: 'Low',
    status: 'Read',
    relatedCarId: 'mock-loss-001',
    relatedCarName: 'Ford Fusion 2018',
    createdAt: '2026-05-27',
    dueDate: '2026-06-12',
    actionUrl: '/reports/car',
    createdBy: 'Parts Desk',
  },
  {
    id: 'notification-004',
    title: 'Missing Carfax document',
    message:
      'Toyota Camry 2020 is missing a final Carfax document before documents can be marked complete.',
    type: 'Missing Documents',
    severity: 'Medium',
    status: 'Unread',
    relatedCarId: 'car-001',
    relatedCarName: 'Toyota Camry 2020',
    createdAt: '2026-05-29',
    dueDate: '2026-06-09',
    actionUrl: '/cars/car-001',
    createdBy: 'Documents Desk',
  },
  {
    id: 'notification-005',
    title: 'Missing repair invoice',
    message:
      'Repair expense invoice for BMW X5 2021 is missing and should be uploaded for reporting accuracy.',
    type: 'Missing Documents',
    severity: 'High',
    status: 'Read',
    relatedCarId: 'car-003',
    relatedCarName: 'BMW X5 2021',
    createdAt: '2026-06-01',
    dueDate: '2026-06-11',
    actionUrl: '/expenses/expense-004',
    createdBy: 'Accounting',
  },
  {
    id: 'notification-006',
    title: 'Critical inspection failed',
    message:
      'Mercedes-Benz C-Class 2022 failed inspection and needs attention before title workflow can continue.',
    type: 'Inspection',
    severity: 'Critical',
    status: 'Unread',
    relatedCarId: 'car-005',
    relatedCarName: 'Mercedes-Benz C-Class 2022',
    createdAt: '2026-06-02',
    dueDate: '2026-06-07',
    actionUrl: '/cars/car-005',
    createdBy: 'Inspection Center',
  },
]

export function formatNotificationDate(value?: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
