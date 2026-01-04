import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PatientInfo {
  name: string;
  patient_id: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string | null;
}

interface DoctorInfo {
  name: string;
  clinic_name: string | null;
  clinic_address: string | null;
  qualification: string;
  registration_no: string;
  specialization: string;
}

interface PrescriptionSymptom {
  name: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

interface PrescriptionMedicine {
  name: string;
  category: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  prescription_no: string;
  created_at: string;
  symptoms: PrescriptionSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis?: string | null;
  advice?: string | null;
  follow_up_date?: string | null;
}

export const generatePrescriptionPDF = (
  prescription: PrescriptionData,
  patient: PatientInfo,
  doctor: DoctorInfo
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header - Clinic Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text(doctor.clinic_name || 'Medical Clinic', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Clinic Address
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (doctor.clinic_address) {
    doc.text(doctor.clinic_address, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
  }

  // Doctor Info
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`${doctor.name} | ${doctor.qualification}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.setFontSize(9);
  doc.text(`Reg. No: ${doctor.registration_no} | ${doctor.specialization}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Prescription Info Row
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Prescription No: ${prescription.prescription_no}`, margin, yPos);
  doc.text(`Date: ${format(new Date(prescription.created_at), 'dd MMM yyyy')}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 12;

  // Patient Info Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPos - 4, pageWidth - 2 * margin, 28, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Patient Name', margin + 5, yPos + 2);
  doc.text('Patient ID', margin + 70, yPos + 2);
  doc.text('Age/Gender', margin + 120, yPos + 2);
  
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.name, margin + 5, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.patient_id, margin + 70, yPos + 10);
  doc.text(`${patient.age}y / ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}`, margin + 120, yPos + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Mobile', margin + 5, yPos + 18);
  doc.setTextColor(30, 30, 30);
  doc.text(patient.mobile, margin + 25, yPos + 18);
  yPos += 34;

  // Symptoms Section
  if (prescription.symptoms.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 153);
    doc.text('SYMPTOMS', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const symptomText = prescription.symptoms
      .map((s) => `${s.name} (${s.severity}, ${s.duration} ${s.durationUnit})`)
      .join(', ');
    const symptomLines = doc.splitTextToSize(symptomText, pageWidth - 2 * margin);
    doc.text(symptomLines, margin, yPos);
    yPos += symptomLines.length * 5 + 8;
  }

  // Diagnosis Section
  if (prescription.diagnosis) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 153);
    doc.text('DIAGNOSIS', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const diagLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 2 * margin);
    doc.text(diagLines, margin, yPos);
    yPos += diagLines.length * 5 + 8;
  }

  // Medicines Section - Rx
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('Rx', margin, yPos);
  yPos += 8;

  prescription.medicines.forEach((med, index) => {
    // Check for page break
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${index + 1}. ${med.name}`, margin + 5, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`(${med.category})`, margin + 5 + doc.getTextWidth(`${index + 1}. ${med.name}`) + 2, yPos);
    yPos += 5;
    
    doc.setTextColor(50, 50, 50);
    doc.text(`Dosage: ${med.dosage}`, margin + 10, yPos);
    doc.text(`Duration: ${med.duration}`, margin + 80, yPos);
    yPos += 5;
    
    if (med.instructions) {
      doc.setTextColor(80, 80, 80);
      doc.text(`Note: ${med.instructions}`, margin + 10, yPos);
      yPos += 5;
    }
    yPos += 3;
  });

  yPos += 5;

  // Advice Section
  if (prescription.advice) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 153);
    doc.text('ADVICE', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const adviceLines = doc.splitTextToSize(prescription.advice, pageWidth - 2 * margin);
    doc.text(adviceLines, margin, yPos);
    yPos += adviceLines.length * 5 + 8;
  }

  // Follow-up Date Box
  if (prescription.follow_up_date) {
    yPos += 5;
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(255, 180, 100);
    doc.roundedRect(margin, yPos - 4, pageWidth - 2 * margin, 16, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 100, 0);
    doc.text('Follow-up Date:', margin + 5, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(prescription.follow_up_date), 'EEEE, dd MMMM yyyy'), margin + 45, yPos + 5);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This prescription is computer-generated and is valid without a signature.', pageWidth / 2, footerY - 3, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, footerY + 3, { align: 'center' });

  // Save the PDF
  doc.save(`${prescription.prescription_no}.pdf`);
};
