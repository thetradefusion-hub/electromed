import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

// CSV Export Utilities
export function exportToCSV(data: Record<string, any>[], filename: string, headers?: Record<string, string>) {
  if (data.length === 0) return;

  const headerKeys = headers ? Object.keys(headers) : Object.keys(data[0]);
  const headerLabels = headers ? Object.values(headers) : headerKeys;

  const csvContent = [
    headerLabels.join(','),
    ...data.map((row) =>
      headerKeys
        .map((key) => {
          const value = row[key];
          // Handle special characters and commas in CSV
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Patient Export
export function exportPatientsToCSV(patients: any[]) {
  const headers = {
    patient_id: 'Patient ID',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    mobile: 'Mobile',
    address: 'Address',
    case_type: 'Case Type',
    visit_date: 'Last Visit',
    created_at: 'Registered On',
  };

  const formattedData = patients.map((p) => ({
    ...p,
    visit_date: format(new Date(p.visit_date), 'dd/MM/yyyy'),
    created_at: format(new Date(p.created_at), 'dd/MM/yyyy'),
  }));

  exportToCSV(formattedData, `patients_${format(new Date(), 'yyyy-MM-dd')}`, headers);
}

// Prescriptions Export
export function exportPrescriptionsToCSV(prescriptions: any[]) {
  const headers = {
    prescription_no: 'Prescription No',
    patientName: 'Patient Name',
    patientId: 'Patient ID',
    diagnosis: 'Diagnosis',
    medicineNames: 'Medicines',
    symptomNames: 'Symptoms',
    follow_up_date: 'Follow-up Date',
    created_at: 'Created On',
  };

  const formattedData = prescriptions.map((p) => ({
    prescription_no: p.prescription_no,
    patientName: p.patients?.name || '',
    patientId: p.patients?.patient_id || '',
    diagnosis: p.diagnosis || '',
    medicineNames: Array.isArray(p.medicines)
      ? p.medicines.map((m: any) => m.name).join('; ')
      : '',
    symptomNames: Array.isArray(p.symptoms)
      ? p.symptoms.map((s: any) => s.name).join('; ')
      : '',
    follow_up_date: p.follow_up_date
      ? format(new Date(p.follow_up_date), 'dd/MM/yyyy')
      : '',
    created_at: format(new Date(p.created_at), 'dd/MM/yyyy'),
  }));

  exportToCSV(formattedData, `prescriptions_${format(new Date(), 'yyyy-MM-dd')}`, headers);
}

// Analytics PDF Export
export function exportAnalyticsToPDF(analytics: {
  totalPatients: number;
  thisMonthPatients: number;
  totalPrescriptions: number;
  thisMonthPrescriptions: number;
  topMedicines: { name: string; count: number }[];
  symptomCategories: { name: string; count: number }[];
}, doctorName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Analytics Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text(`Doctor: ${doctorName}`, pageWidth / 2, yPos, { align: 'center' });

  // Summary Stats
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const stats = [
    ['Total Patients', analytics.totalPatients.toString()],
    ['This Month Patients', analytics.thisMonthPatients.toString()],
    ['Total Prescriptions', analytics.totalPrescriptions.toString()],
    ['This Month Prescriptions', analytics.thisMonthPrescriptions.toString()],
  ];

  stats.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, yPos);
    doc.text(value, 100, yPos);
    yPos += 7;
  });

  // Top Medicines
  if (analytics.topMedicines.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Medicines', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    analytics.topMedicines.forEach((medicine, index) => {
      doc.text(`${index + 1}. ${medicine.name}`, 25, yPos);
      doc.text(`${medicine.count} prescriptions`, 120, yPos);
      yPos += 7;
    });
  }

  // Symptom Categories
  if (analytics.symptomCategories.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptom Categories', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    analytics.symptomCategories.forEach((category, index) => {
      doc.text(`${index + 1}. ${category.name}`, 25, yPos);
      doc.text(`${category.count} occurrences`, 120, yPos);
      yPos += 7;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text(
    'Generated by Electro Homoeopathy Clinic Management System',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`analytics_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
