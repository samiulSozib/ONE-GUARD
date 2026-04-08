// app/types/duty-instruction.types.ts

export interface DutyInstruction {
  id: number;
  instructionable_type: string;
  instructionable_id: number;
  instruction_type: string;
  title: string;
  description: string;
  order: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_color: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  frequency_minutes: number | null;
  is_mandatory: boolean;
  requires_confirmation: boolean;
  requires_photo: boolean;
  requires_signature: boolean;
  status: 'active' | 'inactive' | 'completed';
  created_by: number | null;
  created_at: string;
  updated_at: string;
  instructionable:  null|string;
}

export interface DutyInstructionParams {
  page?: number;
  per_page?: number;
  instructionable_type?: string;
  instructionable_id?: number;
  instruction_type?: string;
  status?: string;
  priority?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface CreateDutyInstructionData {
  instructionable_type: string;
  instructionable_id: number;
  instruction_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_mandatory: boolean;
  requires_photo: boolean;
  requires_signature?: boolean;
  requires_confirmation?: boolean;
  order?: number;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  frequency_minutes?: number | null;
}

export interface UpdateDutyInstructionData extends Partial<CreateDutyInstructionData> {
  status?: 'active' | 'inactive' | 'completed';
}

export interface DutyInstructionState {
  instructions: DutyInstruction[];
  currentInstruction: DutyInstruction | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}