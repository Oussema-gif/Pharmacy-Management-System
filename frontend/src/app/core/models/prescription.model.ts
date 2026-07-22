export interface PrescriptionItem {
  medicationId: number;
  medicationName?: string;
  dosage: string;
  duration?: string;
}

export interface Prescription {
  id?: number;
  patientId: number;
  patientName?: string;
  doctorName: string;
  date: string;
  notes?: string;
  items: PrescriptionItem[];
}