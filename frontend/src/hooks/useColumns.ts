import { useState } from 'react';
import { ColumnConfig } from '@/types/crm';

const defaultColumns: ColumnConfig[] = [
  {
    id: 'col-1',
    name: 'Telefon',
    dataKey: 'phone',
    type: 'phone',
    visibleToUser: true,
    editableByUser: false,
    order: 1,
  },
  {
    id: 'col-2',
    name: 'Zəng statusu',
    dataKey: 'callStatus',
    type: 'select',
    options: [
      { value: 'successful', label: 'Uğurlu' },
      { value: 'unsuccessful', label: 'Uğursuz' },
      { value: 'callback', label: 'Geri zəng' },
      { value: 'pending', label: 'Gözləyir' },
      { value: 'no_answer', label: 'Cavab yoxdur' },
    ],
    visibleToUser: true,
    editableByUser: true,
    order: 2,
  },
  {
    id: 'col-3',
    name: 'Zəng tarixi',
    dataKey: 'callDate',
    type: 'date',
    visibleToUser: true,
    editableByUser: true,
    order: 3,
  },
  {
    id: 'col-4',
    name: 'Müştəri statusu',
    dataKey: 'customerStatus',
    type: 'select',
    options: [
      { value: 'ok', label: 'Ok' },
      { value: 'not_ok', label: 'Not Ok' },
      { value: 'interested', label: 'Maraqlıdır' },
      { value: 'pending', label: 'Gözləyir' },
    ],
    visibleToUser: true,
    editableByUser: true,
    order: 4,
  },
  {
    id: 'col-5',
    name: 'Səbəb',
    dataKey: 'reason',
    type: 'text',
    visibleToUser: true,
    editableByUser: true,
    order: 5,
  },
  {
    id: 'col-6',
    name: 'Aylıq ödəniş',
    dataKey: 'monthlyPayment',
    type: 'number',
    visibleToUser: true,
    editableByUser: false,
    order: 6,
  },
  {
    id: 'col-7',
    name: 'Tarif',
    dataKey: 'tariff',
    type: 'select',
    options: [
      { value: 'Premium', label: 'Premium' },
      { value: 'Basic', label: 'Basic' },
      { value: 'Standard', label: 'Standard' },
      { value: 'Premium Plus', label: 'Premium Plus' },
    ],
    visibleToUser: true,
    editableByUser: true,
    order: 7,
  },
  {
    id: 'col-8',
    name: 'Bonus',
    dataKey: 'bonus',
    type: 'select',
    options: [
      { value: '10 GB', label: '10 GB' },
      { value: '5 GB', label: '5 GB' },
      { value: '20 GB', label: '20 GB' },
      { value: 'Yoxdur', label: 'Yoxdur' },
    ],
    visibleToUser: true,
    editableByUser: true,
    order: 8,
  },
  {
    id: 'col-9',
    name: 'Xərc (AZN)',
    dataKey: 'cost',
    type: 'number',
    visibleToUser: true,
    editableByUser: false,
    order: 9,
  },
];

export function useColumns() {
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);

  const getColumnsForUser = (userId: string): ColumnConfig[] => {
    return columns.filter(col => {
      if (!col.userIds || col.userIds.length === 0) return col.visibleToUser;
      return col.userIds.includes(userId) && col.visibleToUser;
    });
  };

  const updateColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  return { columns, getColumnsForUser, updateColumns };
}
