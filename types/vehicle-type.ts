export interface VehicleType {
  capacity: number | "";
  company_id: string;
  created_at: string;
  deleted_at: string;
  facility_id: string;
  facility_name: string;
  id: string;
  license_plate: string;
  status: string;
  type: string;
  updated_at: string;
  vehicle_id: string;
}

export interface PayloadVehicleType {
  capacity: number | "";
  facility_id: string;
  license_plate: string;
  type: "Truck" | "Van" | "Pickup" | "";
  vehicle_id: string;
}
