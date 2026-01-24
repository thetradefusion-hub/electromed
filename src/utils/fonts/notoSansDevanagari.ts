// Noto Sans Devanagari Regular - Base64 encoded TTF font for Hindi text rendering in jsPDF
// This is a subset of the font optimized for common Hindi characters used in prescriptions

import jsPDF from 'jspdf';

// Font loading utility - fetches the font from Google Fonts CDN and converts to base64
let fontLoaded = false;
let fontBase64: string | null = null;

export const loadDevanagariFont = async (): Promise<string> => {
  if (fontBase64) return fontBase64;
  
  try {
    // Fetch Noto Sans Devanagari from Google Fonts
    const fontUrl = 'https://fonts.gstatic.com/s/notosansdevanagari/v26/TuGOUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Devanagari font');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    fontBase64 = btoa(binary);
    
    return fontBase64;
  } catch (error) {
    console.error('Error loading Devanagari font:', error);
    throw error;
  }
};

export const registerDevanagariFont = async (doc: jsPDF): Promise<boolean> => {
  try {
    const base64Font = await loadDevanagariFont();
    
    // Register the font with jsPDF
    doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', base64Font);
    doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');
    
    fontLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to register Devanagari font:', error);
    return false;
  }
};

export const setHindiFont = (doc: jsPDF): void => {
  if (fontLoaded) {
    doc.setFont('NotoSansDevanagari', 'normal');
  }
};

export const setDefaultFont = (doc: jsPDF, style: 'normal' | 'bold' = 'normal'): void => {
  doc.setFont('helvetica', style);
};

export const isFontLoaded = (): boolean => fontLoaded;
