import { cn } from '@/lib/utils';
import { CallStatus, CustomerStatus } from '@/types/crm';
import { ChevronDown } from 'lucide-react';

interface StatusChipProps {
  status: CallStatus | CustomerStatus;
  type: 'call' | 'customer';
  showDropdown?: boolean;
}

const callStatusConfig: Record<CallStatus, { label: string; className: string }> = {
  successful: { label: 'Uğurlu', className: 'bg-emerald-50 text-emerald-600' },
  unsuccessful: { label: 'Uğursuz', className: 'bg-red-50 text-red-500' },
  pending: { label: 'Gözləyir', className: 'bg-yellow-50 text-yellow-600' },
  callback: { label: 'Geri zəng', className: 'bg-orange-50 text-orange-500' },
  no_answer: { label: 'Cavab yoxdur', className: 'bg-gray-100 text-gray-500' },
};

const customerStatusConfig: Record<CustomerStatus, { label: string; className: string }> = {
  ok: { label: 'Ok', className: 'bg-emerald-100 text-emerald-600 border border-emerald-200' },
  not_ok: { label: 'Not Ok', className: 'bg-red-100 text-red-500 border border-red-200' },
  pending: { label: 'Gözləyir', className: 'bg-orange-100 text-orange-500 border border-orange-200' },
  interested: { label: 'Maraqlıdır', className: 'bg-orange-100 text-orange-500 border border-orange-200' },
};

export function StatusChip({ status, type, showDropdown = false }: StatusChipProps) {
  const config = type === 'call' 
    ? callStatusConfig[status as CallStatus] 
    : customerStatusConfig[status as CustomerStatus];

  if (type === 'call') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium',
        config.className
      )}>
        {config.label}
        {showDropdown && <ChevronDown className="w-3 h-3" />}
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
      config.className
    )}>
      {config.label}
      {showDropdown && <ChevronDown className="w-3 h-3" />}
    </span>
  );
}
