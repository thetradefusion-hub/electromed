import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PatientInfo {
  name: string;
  patient_id: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string | null;
  created_at: string;
  visit_date: string;
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
  id: string;
  prescription_no: string;
  created_at: string;
  symptoms: PrescriptionSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis?: string | null;
  advice?: string | null;
  follow_up_date?: string | null;
}

export const generatePatientHistoryPDF = (
  patient: PatientInfo,
  prescriptions: PrescriptionData[],
  doctor: DoctorInfo
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPos > 270 - requiredSpace) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

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

  // Report Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('PATIENT MEDICAL HISTORY REPORT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Patient Info Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPos - 4, pageWidth - 2 * margin, 40, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Patient Name', margin + 5, yPos + 2);
  doc.text('Patient ID', margin + 80, yPos + 2);
  doc.text('Age/Gender', margin + 130, yPos + 2);
  
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.name, margin + 5, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.patient_id, margin + 80, yPos + 10);
  doc.text(`${patient.age}y / ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}`, margin + 130, yPos + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Mobile', margin + 5, yPos + 20);
  doc.text('Registration Date', margin + 80, yPos + 20);
  doc.text('Last Visit', margin + 130, yPos + 20);
  
  doc.setTextColor(30, 30, 30);
  doc.text(patient.mobile, margin + 5, yPos + 28);
  doc.text(format(new Date(patient.created_at), 'dd MMM yyyy'), margin + 80, yPos + 28);
  doc.text(format(new Date(patient.visit_date), 'dd MMM yyyy'), margin + 130, yPos + 28);
  
  yPos += 48;

  // Summary Stats
  const totalSymptoms = prescriptions.reduce((acc, rx) => acc + rx.symptoms.length, 0);
  const totalMedicines = prescriptions.reduce((acc, rx) => acc + rx.medicines.length, 0);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('Summary:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`${prescriptions.length} Prescriptions | ${totalSymptoms} Symptoms Treated | ${totalMedicines} Medicines Prescribed`, margin + 25, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Medical Timeline
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('MEDICAL TIMELINE', margin, yPos);
  yPos += 10;

  if (prescriptions.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No prescriptions recorded for this patient.', margin, yPos);
  } else {
    prescriptions.forEach((rx, index) => {
      checkPageBreak(50);

      // Prescription header
      doc.setFillColor(240, 245, 250);
      doc.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 12, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 153);
      doc.text(`${rx.prescription_no}`, margin + 3, yPos + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(format(new Date(rx.created_at), 'EEEE, dd MMMM yyyy'), pageWidth - margin - 3, yPos + 5, { align: 'right' });
      yPos += 16;

      // Diagnosis
      if (rx.diagnosis) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('Diagnosis:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        const diagLines = doc.splitTextToSize(rx.diagnosis, pageWidth - 2 * margin - 30);
        doc.text(diagLines, margin + 28, yPos);
        yPos += diagLines.length * 4 + 4;
      }

      // Symptoms
      if (rx.symptoms.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('Symptoms:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        const symptomText = rx.symptoms.map(s => `${s.name} (${s.severity})`).join(', ');
        const symptomLines = doc.splitTextToSize(symptomText, pageWidth - 2 * margin - 30);
        doc.text(symptomLines, margin + 28, yPos);
        yPos += symptomLines.length * 4 + 4;
      }

      // Medicines
      if (rx.medicines.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('Medicines:', margin + 3, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        rx.medicines.forEach((med) => {
          checkPageBreak(10);
          doc.text(`• ${med.name} - ${med.dosage} for ${med.duration}`, margin + 8, yPos);
          yPos += 4;
        });
        yPos += 2;
      }

      // Advice
      if (rx.advice) {
        checkPageBreak(15);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Advice:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        const adviceLines = doc.splitTextToSize(rx.advice, pageWidth - 2 * margin - 25);
        doc.text(adviceLines, margin + 22, yPos);
        yPos += adviceLines.length * 4 + 4;
      }

      // Follow-up
      if (rx.follow_up_date) {
        doc.setFontSize(9);
        doc.setTextColor(200, 100, 0);
        doc.text(`Follow-up: ${format(new Date(rx.follow_up_date), 'dd MMM yyyy')}`, margin + 3, yPos);
        yPos += 5;
      }

      yPos += 8;
    });
  }

  // Footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth - margin, footerY, { align: 'right' });
    doc.text('Confidential Medical Record', margin, footerY);
  };

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Save the PDF
  doc.save(`Patient_History_${patient.patient_id}.pdf`);
};

// Print prescription directly
export const printPrescription = (prescriptionNo: string) => {
  // This will trigger the browser's print dialog with the current page
  // For better control, we can open the PDF and print it
  window.print();
};
