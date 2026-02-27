export enum CaseType {
  GUGATAN = 'Gugatan',
  PERMOHONAN = 'Permohonan'
}

export interface CaseData {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  parties: string;       // Kolom Para Pihak
  verdictDate: string;   // Kolom Tgl Putus
  bhtDate?: string;      // Kolom Tgl BHT/Inkracht
  status: string;
  date: string;
}

export interface SearchParams {
  caseNumber: string;
  caseType: CaseType;
  year: string;
}
