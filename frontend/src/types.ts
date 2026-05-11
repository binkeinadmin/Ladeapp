export interface Station {
  id: number;
  name: string;
  location: string;
  status: 'available' | 'occupied' | 'offline';
  session_id?: number;
  user_name?: string;
  car_plate?: string;
  start_time?: string;
}

export interface WaitlistEntry {
  id: number;
  user_name: string;
  car_plate: string;
  phone?: string;
  added_time: string;
  notified: 0 | 1;
}

export interface Session {
  id: number;
  station_id: number;
  user_name: string;
  car_plate: string;
  start_time: string;
  end_time?: string;
}

export interface CheckinForm {
  user_name: string;
  car_plate: string;
}

export interface WaitlistForm {
  user_name: string;
  car_plate: string;
  phone: string;
}
