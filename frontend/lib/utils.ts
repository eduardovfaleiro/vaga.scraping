export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle numbers with or without 55 country code
  let cleanDigits = digits;
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    cleanDigits = digits.substring(2);
  }

  if (cleanDigits.length === 11) {
    // (XX) XXXXX-XXXX
    return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`;
  } else if (cleanDigits.length === 10) {
    // (XX) XXXX-XXXX
    return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`;
  }

  return phone;
}
