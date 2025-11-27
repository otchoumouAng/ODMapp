/**
 * Represents the data of a palette returned by the API after scanning a QR code.
 */
export interface Palette {
  id: string;
  numeroPalette: string;
  produitNom: string;
  poidsNet: number;
  dateCreation: string;
  // Add other relevant fields based on the actual API response
}

/**
 * Represents a palette that has already been declared and is displayed in the list.
 */
export interface DeclaredPalette {
  id: string;
  numeroPalette: string;
  produitNom: string;
  poidsNet: number;
  dateDeclaration: string;
}
