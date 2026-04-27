export type UserRole = 'super_admin' | 'supervisor' | 'driver';
export type ThemeType = 'light' | 'dark' | 'solarized';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Consignment {
  id: number;
  truck_number: string;
  lr_no: string;
  consigner_name: string;
  consigner_address: string;
  consignee_name: string;
  consignee_address: string;
  issuing_office_address: string;
  invoice_number: string;
  invoice_date: string;
  gst_payable_by: string;
  from_location: string;
  to_location: string;
  payment_type: 'To Pay' | 'Paid';
  billed_at: string;
  package_qty: number;
  description: string;
  delivery_address: string;
  status: 'loaded' | 'delivered';
  supervisor_id: number;
  driver_id?: number | null;
  initial_slip_url?: string;
  delivered_slip_url?: string;
  // Weight & Valuation (matches physical bill)
  weight_a?: number;
  weight_c?: number;
  dec_value?: number;
  e_way_bill?: string;
  rate?: number;
  consignor_gst?: string;
  consignee_gst?: string;
  // Freight charges (matches physical bill)
  hamali?: number;
  rc?: number;
  sc?: number;
  st?: number;
  cpc?: number;
  pov?: number;
  dc_dd?: number;
  mis_ch?: number;
  gst_edu?: number;
  remark?: string;
  value_rs?: number;
  created_at: string;
  updated_at: string;
}


export interface Attendance {
  id: number;
  user_id: number;
  username: string;
  date: string;
  status: 'present' | 'absent';
  marked_by_id: number;
}

export interface Maintenance {
  id: number;
  truck_number: string;
  details: string;
  cost: number;
  date: string;
  proof_url?: string;
}

export interface Payment {
  id: number;
  consignment_id: number;
  truck_number: string;
  amount: number;
  status: 'pending' | 'completed';
  date: string;
}

export interface FuelRefill {
  id: number;
  driver_id: number;
  username: string;
  truck_number: string;
  amount: number;
  cost: number;
  receipt_url: string;
  date: string;
}

export interface Analytics {
  totalConsignments: number;
  totalMaintenance: number;
  totalFuel: number;
  totalPayments: number;
}
