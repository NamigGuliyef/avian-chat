export class ReportTableDto {
  filters?: Record<string, string[]>;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
  sort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}
