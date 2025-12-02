import { api, handleNetworkError } from '../Shared/route';
import { Palette } from './type';

/**
 * Fetches palette details from the API using its ID.
 * The QR code should contain the palette's unique ID (GUID).
 * @param id The unique identifier of the palette.
 */
export const getPaletteById = async (id: string): Promise<Palette> => {
  try {
    // The endpoint is GET /api/palette/{id}
    const response = await api.get(`/palette/${id}`);
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `getPaletteById(${id})`);
  }
};

/**
 * Declares a palette and creates a stock movement.
 * @param palette The full palette object to be declared.
 */
export const declarePalette = async (palette: Palette): Promise<Palette> => {
  try {
    // The endpoint is POST /api/palette/declarer
    const response = await api.post('/palette/declarer', palette);
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `declarePalette(${palette.id})`);
  }
};

/**
 * Fetches the list of declared palettes.
 * Assumes that "declared" palettes have a specific status we can filter by.
 */
export const getDeclaredPalettes = async (): Promise<Palette[]> => {
    try {
        // The endpoint is GET /api/palette, using a filter
        const params = new URLSearchParams();
        params.append('Statut', 'Declared'); // This is an assumption, the exact filter may vary

        const response = await api.get('/palette', { params });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getDeclaredPalettes');
    }
}
