import { AppMap } from '@/lib/types';

export interface EnterpriseCompany {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

export interface EnterpriseUser {
  id: string;
  auth_user_id: string;
  company_id: string;
  email: string;
  full_name: string | null;
  role: 'builder' | 'admin';
  created_at: string;
  company?: EnterpriseCompany;
}

export interface EnterpriseDataSource {
  id: string;
  company_id: string;
  name: string;
  type: 'postgres' | 'rest_api' | 'none';
  description: string | null;
  created_at: string;
}

export interface DataContractEntry {
  source_name: string;
  source_type: string;
  operations: {
    type: 'read' | 'write';
    resource: string;
    reason: string;
  }[];
}

export interface EnterpriseSubmission {
  id: string;
  company_id: string;
  builder_id: string;
  app_name: string;
  app_description: string | null;
  app_map_json: AppMap;
  data_contract_json: DataContractEntry[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'live';
  reviewed_by?: string | null;
  review_note?: string | null;
  live_url?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  builder?: EnterpriseUser;
}
