import { api, handleNetworkError } from '../Shared/route';
import { Palette, DeclaredPalette } from './type';

/**
 * Fetches palette details from the API using a QR code.
 * @param qrCode The QR code string scanned by the user.
 */
export const getPaletteByQRCode = async (qrCode: string): Promise<Palette> => {
  try {
    const response = await api.get(`/declare/${qrCode}`);
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `getPaletteByQRCode(${qrCode})`);
  }
};

/**
 * Validates the declaration of a palette.
 * @param paletteId The ID of the palette to declare.
 */
export const validatePaletteDeclaration = async (paletteId: string): Promise<any> => {
  try {
    // Assuming the endpoint is /api/palette/declare and it's a POST request
    const response = await api.post('/palette/declare', { paletteId });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `validatePaletteDeclaration(${paletteId})`);
  }
};

/**
 * Fetches the list of already declared palettes.
 */
export const getDeclaredPalettes = async (): Promise<DeclaredPalette[]> => {
    try {
        // Assuming the endpoint is /api/palettes/declared
        const response = await api.get('/palettes/declared');
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getDeclaredPalettes');
    }
}
