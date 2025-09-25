import { api, handleNetworkError } from '../Shared/route';
import { TransfertLot } from '../Shared/type'; // Assumant un type partagé
import { ReceptionData } from './type';

/**
 * Récupère la liste des lots en transit destinés au magasin de l'utilisateur.
 * @param magasinId L'ID du magasin de l'utilisateur connecté.
 */
export const getLotsARecevoir = async (magasinId: number): Promise<TransfertLot[]> => {
    try {
        const params = new URLSearchParams();
        params.append('magasinId', magasinId.toString());
        
        const response = await api.get('/transfertlot/entransit', { params });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error);
    }
};

/**
 * Valide la réception d'un lot.
 * @param id L'ID du transfert.
 * @param data Les données du formulaire de réception.
 */
export const validerReception = async (id: string, data: ReceptionData): Promise<any> => {
    try {
        const response = await api.put(`/transfertlot/${id}/reception`, data);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error);
    }
};
