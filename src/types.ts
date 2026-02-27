export enum CaseType {
  GUGATAN = 'Gugatan',
  PERMOHONAN = 'Permohonan'
}

export interface CaseData {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  parties: string;
  status: string;
  date: string;
}

export interface SearchParams {
  caseNumber: string;
  caseType: CaseType;
  year: string;
}