export interface Client {
  id: number;
  nom: string;
  adresse?: string;
  telephoneFixe?: string;
  telephoneMobile?: string;
  fax?: string;
  rowVersionKey?: number[];
  creationUtilisateur?: string;
  modificationUtilisateur?: string;
}

export type ModalMode = 'view' | 'edit' | 'create';