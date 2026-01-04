export type UserRole = 'super_admin' | 'doctor' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  registrationNo: string;
  qualification: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  createdAt: Date;
}

export interface Patient {
  id: string;
  patientId: string; // Auto-generated like EH-2024-001
  doctorId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  address: string;
  caseType: 'new' | 'old';
  visitDate: Date;
  createdAt: Date;
}

export interface Symptom {
  id: string;
  name: string;
  category: string;
  isGlobal: boolean;
  doctorId?: string;
}

export interface SelectedSymptom {
  symptomId: string;
  symptom: Symptom;
  severity: 'low' | 'medium' | 'high';
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  indications: string;
  defaultDosage: string;
  contraIndications?: string;
  notes?: string;
  isGlobal: boolean;
  doctorId?: string;
}

export interface MedicineRule {
  id: string;
  symptoms: string[]; // Symptom IDs
  medicines: string[]; // Medicine IDs
  dosage: string;
  duration: string;
  priority: number;
  isGlobal: boolean;
  doctorId?: string;
  createdAt: Date;
}

export interface PrescriptionMedicine {
  medicineId: string;
  medicine: Medicine;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Doctor;
  symptoms: SelectedSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis?: string;
  advice?: string;
  followUpDate?: Date;
  createdAt: Date;
}

export interface FollowUp {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  scheduledDate: Date;
  status: 'pending' | 'completed' | 'missed';
  notes?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayPatients: number;
  pendingFollowUps: number;
  totalPrescriptions: number;
}
