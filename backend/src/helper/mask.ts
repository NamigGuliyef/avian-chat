export function maskPhone(phone?: string) {
    if (!phone) return phone;

    // remove trailing ;
    const clean = phone.replace(';', '');

    // example: 994708230749 → 99470****49
    return clean.replace(/^(\d{5})\d+(\d{2})$/, '$1****$2');
}
