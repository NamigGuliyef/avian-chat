export function maskPhone(phone?: string) {
    if (!phone) return phone;

    // remove trailing ;
    const clean = phone.replace(';', '');

    // example: 994708230749 → 99470****49
    return clean.replace(/^(\d{5})\d+(\d{2})$/, '$1****$2');
}

export function formatDate(date: Date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}
