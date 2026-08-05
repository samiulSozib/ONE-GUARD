export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
