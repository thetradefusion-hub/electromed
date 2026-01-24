import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { registerDevanagariFont, setHindiFont, setDefaultFont } from './fonts/notoSansDevanagari';

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
  indications?: string;
  contraIndications?: string;
  notes?: string;
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

// Pure Hindi labels for prescription
const HINDI_LABELS = {
  electroHomoeopathy: 'इलेक्ट्रो-होम्योपैथी प्रिस्क्रिप्शन',
  prescriptionNo: 'प्रिस्क्रिप्शन नंबर',
  date: 'तारीख',
  patientName: 'मरीज़ का नाम',
  patientId: 'मरीज़ आईडी',
  ageGender: 'आयु/लिंग',
  mobile: 'मोबाइल',
  symptoms: 'लक्षण',
  diagnosis: 'निदान',
  medicineDetailsTitle: 'दवाई विवरण एवं लाभ',
  use: 'उपयोग',
  avoid: 'परहेज़',
  do: 'करें',
  advice: 'सलाह',
  followUpDate: 'फॉलो-अप की तारीख',
  footer: 'यह प्रिस्क्रिप्शन कंप्यूटर द्वारा जनरेट है और बिना हस्ताक्षर के मान्य है।',
  generatedOn: 'जनरेट की तारीख',
  dosage: 'खुराक',
  duration: 'अवधि',
  instructions: 'निर्देश',
  severity: {
    low: 'हल्का',
    medium: 'मध्यम',
    high: 'गंभीर'
  },
  durationUnits: {
    days: 'दिन',
    weeks: 'सप्ताह',
    months: 'महीने'
  },
  gender: {
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य'
  },
  years: 'वर्ष'
};

const ENGLISH_LABELS = {
  electroHomoeopathy: 'Electro-Homoeopathy Prescription',
  prescriptionNo: 'Prescription No',
  date: 'Date',
  patientName: 'Patient Name',
  patientId: 'Patient ID',
  ageGender: 'Age/Gender',
  mobile: 'Mobile',
  symptoms: 'SYMPTOMS',
  diagnosis: 'DIAGNOSIS',
  medicineDetailsTitle: 'MEDICINE DETAILS & BENEFITS',
  use: 'Use',
  avoid: 'Avoid',
  do: 'Do',
  advice: 'ADVICE',
  followUpDate: 'Follow-up Date',
  footer: 'This prescription is computer-generated and is valid without a signature.',
  generatedOn: 'Generated on',
  dosage: 'Dosage',
  duration: 'Duration',
  instructions: 'Instructions',
  severity: {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  },
  durationUnits: {
    days: 'days',
    weeks: 'weeks',
    months: 'months'
  },
  gender: {
    male: 'Male',
    female: 'Female',
    other: 'Other'
  },
  years: 'y'
};

// Helper to set appropriate font based on language
const setFont = (doc: jsPDF, language: 'en' | 'hi', style: 'normal' | 'bold' = 'normal'): void => {
  if (language === 'hi') {
    setHindiFont(doc);
  } else {
    setDefaultFont(doc, style);
  }
};

export const generatePrescriptionPDF = async (
  prescription: PrescriptionData,
  patient: PatientInfo,
  doctor: DoctorInfo,
  language: 'en' | 'hi' = 'en'
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;
  
  const labels = language === 'hi' ? HINDI_LABELS : ENGLISH_LABELS;
  const isHindi = language === 'hi';

  // Load Devanagari font for Hindi
  if (isHindi) {
    const fontLoaded = await registerDevanagariFont(doc);
    if (!fontLoaded) {
      console.warn('Devanagari font could not be loaded. Using default font with limited Hindi support.');
    }
  }

  // Header - Clinic Name
  doc.setFontSize(18);
  setDefaultFont(doc, 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text(doctor.clinic_name || 'Medical Clinic', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Electro-Homoeopathy subtitle
  doc.setFontSize(10);
  setFont(doc, language, 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(labels.electroHomoeopathy, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Clinic Address
  doc.setFontSize(10);
  setDefaultFont(doc, 'normal');
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
  doc.setDrawColor(0, 102, 153);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Prescription Info Row
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  setFont(doc, language, 'normal');
  doc.text(`${labels.prescriptionNo}: ${prescription.prescription_no}`, margin, yPos);
  doc.text(`${labels.date}: ${format(new Date(prescription.created_at), 'dd MMM yyyy')}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 12;

  // Patient Info Box
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(0, 102, 153);
  doc.roundedRect(margin, yPos - 4, pageWidth - 2 * margin, 28, 3, 3, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  setFont(doc, language, 'normal');
  doc.text(labels.patientName, margin + 5, yPos + 2);
  doc.text(labels.patientId, margin + 70, yPos + 2);
  doc.text(labels.ageGender, margin + 120, yPos + 2);
  
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  setDefaultFont(doc, 'bold');
  doc.text(patient.name, margin + 5, yPos + 10);
  setDefaultFont(doc, 'normal');
  doc.text(patient.patient_id, margin + 70, yPos + 10);
  
  // Gender text with translation
  const genderKey = patient.gender.toLowerCase() as keyof typeof labels.gender;
  const genderText = isHindi 
    ? (labels.gender[genderKey] || patient.gender)
    : patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1);
  
  setFont(doc, language, 'normal');
  const ageGenderText = isHindi 
    ? `${patient.age} ${labels.years} / ${genderText}`
    : `${patient.age}${labels.years} / ${genderText}`;
  doc.text(ageGenderText, margin + 120, yPos + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  setFont(doc, language, 'normal');
  doc.text(labels.mobile, margin + 5, yPos + 18);
  setDefaultFont(doc, 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(patient.mobile, margin + 30, yPos + 18);
  yPos += 34;

  // Symptoms Section
  if (prescription.symptoms.length > 0) {
    doc.setFontSize(11);
    setFont(doc, language, 'normal');
    doc.setTextColor(0, 102, 153);
    doc.text(labels.symptoms, margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    setFont(doc, language, 'normal');
    doc.setTextColor(50, 50, 50);
    
    const getSeverityLabel = (severity: string) => {
      const severityLabels = labels.severity as Record<string, string>;
      return severityLabels[severity] || severity;
    };
    
    const getDurationUnitLabel = (unit: string) => {
      const unitLabels = labels.durationUnits as Record<string, string>;
      return unitLabels[unit] || unit;
    };
    
    const symptomText = prescription.symptoms
      .map((s) => `${s.name} (${getSeverityLabel(s.severity)}, ${s.duration} ${getDurationUnitLabel(s.durationUnit)})`)
      .join(', ');
    const symptomLines = doc.splitTextToSize(symptomText, pageWidth - 2 * margin);
    doc.text(symptomLines, margin, yPos);
    yPos += symptomLines.length * 5 + 8;
  }

  // Diagnosis Section
  if (prescription.diagnosis) {
    doc.setFontSize(11);
    setFont(doc, language, 'normal');
    doc.setTextColor(0, 102, 153);
    doc.text(labels.diagnosis, margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    setFont(doc, language, 'normal');
    doc.setTextColor(50, 50, 50);
    const diagLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 2 * margin);
    doc.text(diagLines, margin, yPos);
    yPos += diagLines.length * 5 + 8;
  }

  // Medicines Section - Rx
  doc.setFontSize(16);
  setDefaultFont(doc, 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('Rx', margin, yPos);
  yPos += 8;

  prescription.medicines.forEach((med, index) => {
    // Check for page break
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    setDefaultFont(doc, 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${index + 1}. ${med.name}`, margin + 5, yPos);
    
    doc.setFontSize(9);
    setDefaultFont(doc, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`(${med.category})`, margin + 5 + doc.getTextWidth(`${index + 1}. ${med.name}`) + 2, yPos);
    yPos += 5;
    
    setFont(doc, language, 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`${labels.dosage}: ${med.dosage}`, margin + 10, yPos);
    doc.text(`${labels.duration}: ${med.duration}`, margin + 90, yPos);
    yPos += 5;
    
    if (med.instructions) {
      doc.setTextColor(80, 80, 80);
      doc.text(`${labels.instructions}: ${med.instructions}`, margin + 10, yPos);
      yPos += 5;
    }
    yPos += 3;
  });

  yPos += 5;

  // Medicine Details & Benefits Section
  const medicinesWithDetails = prescription.medicines.filter(
    (med) => med.indications || med.contraIndications || med.notes
  );

  if (medicinesWithDetails.length > 0) {
    // Check for page break before adding section
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Section Header with background
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 10, 2, 2, 'FD');
    
    doc.setFontSize(11);
    setFont(doc, language, 'normal');
    doc.setTextColor(22, 101, 52);
    doc.text(labels.medicineDetailsTitle, margin + 5, yPos + 5);
    yPos += 15;

    medicinesWithDetails.forEach((med) => {
      // Check for page break
      if (yPos > 245) {
        doc.addPage();
        yPos = 20;
      }

      // Medicine name
      doc.setFontSize(10);
      setDefaultFont(doc, 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`${med.name}:`, margin + 5, yPos);
      yPos += 5;

      // Indications/Use
      if (med.indications) {
        doc.setFontSize(9);
        setFont(doc, language, 'normal');
        doc.setTextColor(0, 102, 153);
        doc.text(`${labels.use}: `, margin + 8, yPos);
        setFont(doc, language, 'normal');
        doc.setTextColor(60, 60, 60);
        const indicationText = doc.splitTextToSize(med.indications, pageWidth - margin * 2 - 30);
        doc.text(indicationText, margin + 25, yPos);
        yPos += indicationText.length * 4 + 2;
      }

      // Contra-indications/Avoid
      if (med.contraIndications) {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(9);
        setFont(doc, language, 'normal');
        doc.setTextColor(180, 50, 50);
        doc.text(`${labels.avoid}: `, margin + 8, yPos);
        setFont(doc, language, 'normal');
        doc.setTextColor(60, 60, 60);
        const avoidText = doc.splitTextToSize(med.contraIndications, pageWidth - margin * 2 - 30);
        doc.text(avoidText, margin + 28, yPos);
        yPos += avoidText.length * 4 + 2;
      }

      // Notes/Do
      if (med.notes) {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(9);
        setFont(doc, language, 'normal');
        doc.setTextColor(34, 139, 34);
        doc.text(`${labels.do}: `, margin + 8, yPos);
        setFont(doc, language, 'normal');
        doc.setTextColor(60, 60, 60);
        const notesText = doc.splitTextToSize(med.notes, pageWidth - margin * 2 - 25);
        doc.text(notesText, margin + 20, yPos);
        yPos += notesText.length * 4 + 2;
      }

      yPos += 3;
    });

    yPos += 5;
  }

  // Advice Section
  if (prescription.advice) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(11);
    setFont(doc, language, 'normal');
    doc.setTextColor(0, 102, 153);
    doc.text(labels.advice, margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    setFont(doc, language, 'normal');
    doc.setTextColor(50, 50, 50);
    const adviceLines = doc.splitTextToSize(prescription.advice, pageWidth - 2 * margin);
    doc.text(adviceLines, margin, yPos);
    yPos += adviceLines.length * 5 + 8;
  }

  // Follow-up Date Box
  if (prescription.follow_up_date) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 5;
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(255, 180, 100);
    doc.roundedRect(margin, yPos - 4, pageWidth - 2 * margin, 16, 3, 3, 'FD');
    
    doc.setFontSize(10);
    setFont(doc, language, 'normal');
    doc.setTextColor(200, 100, 0);
    doc.text(`${labels.followUpDate}:`, margin + 5, yPos + 5);
    setDefaultFont(doc, 'normal');
    doc.text(format(new Date(prescription.follow_up_date), 'EEEE, dd MMMM yyyy'), margin + 70, yPos + 5);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(0, 102, 153);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  setFont(doc, language, 'normal');
  doc.text(labels.footer, pageWidth / 2, footerY - 3, { align: 'center' });
  doc.text(`${labels.generatedOn}: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, footerY + 6, { align: 'center' });

  // Save the PDF
  const suffix = language === 'hi' ? '_Hindi' : '';
  doc.save(`${prescription.prescription_no}${suffix}.pdf`);
};
