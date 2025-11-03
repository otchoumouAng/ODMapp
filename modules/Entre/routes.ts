import { api, handleNetworkError } from '../Shared/route';
// Le type TransfertLot est défini dans un fichier partagé
import { TransfertLot } from '../Shared/type'; 
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
        // --- MODIFICATION --- : Ajout du contexte
        throw handleNetworkError(error, 'getLotsARecevoir');
    }
};

/**
 * Valide la réception d'un lot.
 * @param id L'ID du transfert (GUID).
 * @param data Les données du formulaire de réception.
 */
export const validerReception = async (id: string, data: ReceptionData): Promise<any> => {
    try {
        const response = await api.put(`/transfertlot/${id}/reception`, data);
        return response.data;
    } catch (error) {
        // --- MODIFICATION --- : Ajout du contexte
        // Affiche l'erreur de validation de l'API (ex: "Prière vérifier le magasin...")
        const serverMessage = error.response?.data?.message || error.response?.data?.title || error.message;
        throw new Error(serverMessage || "Une erreur inattendue est survenue lors de la validation de la réception.");
    }
};
