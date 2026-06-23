export function generateNomorPR(_env: string, tahun: number, urutan: number): string {
  return `PR-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorPO(_env: string, tahun: number, urutan: number): string {
  return `PO-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorTicket(tahun: number, urutan: number): string {
  return `TKT-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorMutasi(tahun: number, urutan: number): string {
  return `MTS-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorOpname(tahun: number, urutan: number): string {
  return `STO-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorPenghapusan(tahun: number, urutan: number): string {
  return `PHP-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorPenerimaan(tahun: number, urutan: number): string {
  return `PNB-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorBooking(tahun: number, urutan: number): string {
  return `BKG-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateNomorIssue(tahun: number, urutan: number): string {
  return `ISS-${tahun}-${String(urutan).padStart(5, '0')}`;
}

export function generateKodeVendor(urutan: number): string {
  return `VEN-${String(urutan).padStart(4, '0')}`;
}

export function generateKodeKendaraan(urutan: number): string {
  return `KND-${String(urutan).padStart(4, '0')}`;
}

export function generateKodeLokasi(kodeCabang: string, urutan: number): string {
  return `LOK-${kodeCabang}-${String(urutan).padStart(4, '0')}`;
}
