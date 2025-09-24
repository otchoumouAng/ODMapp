// CORRECTION APPLIQUÉE :
// La méthode AddMouvement ci-dessous a été corrigée pour que l'ordre des paramètres
// corresponde exactement à celui de la procédure stockée V2_MouvementStock_New.
// Ceci est crucial car la procédure stockée en production ne peut pas être modifiée.
// L'ancien ordre pouvait causer une mauvaise interprétation du paramètre @SiteID,
// menant à l'utilisation d'une valeur par défaut incorrecte et à une erreur de clé étrangère.
//
// ACTION REQUISE :
// Remplacez la méthode AddMouvement existante dans votre fichier
// odm_api/Repositories/MouvementStockRepository.cs par le code ci-dessous.

public void AddMouvement(MouvementStock mouvement)
{
    using (var conn = _dbService.GetConnection())
    {
        conn.Open();
        using (var cmd = new SqlCommand("V2_MouvementStock_New", conn))
        {
            cmd.CommandType = CommandType.StoredProcedure;

            // Paramètres obligatoires
            cmd.Parameters.AddWithValue("@magasinId", mouvement.MagasinID);
            cmd.Parameters.AddWithValue("@campagneID", mouvement.CampagneID);
            cmd.Parameters.AddWithValue("@exportateurId", (object)mouvement.ExportateurID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@certificationId", (object)mouvement.CertificationID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@datemouvement", mouvement.DateMouvement);
            cmd.Parameters.AddWithValue("@sens", mouvement.Sens);
            cmd.Parameters.AddWithValue("@mouvementTypeId", mouvement.MouvementTypeID);
            cmd.Parameters.AddWithValue("@objectEnStockID", (object)mouvement.ObjetEnStockID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@objectEnStockType", (object)mouvement.ObjetEnStockType ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@quantite", mouvement.Quantite);
            cmd.Parameters.AddWithValue("@statut", (object)mouvement.Statut ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@reference1", (object)mouvement.Reference1 ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@reference2", (object)mouvement.Reference2 ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@poidsbrut", mouvement.PoidsBrut);
            cmd.Parameters.AddWithValue("@tarebags", mouvement.TareSacs);
            cmd.Parameters.AddWithValue("@tarepalette", mouvement.TarePalettes);
            cmd.Parameters.AddWithValue("@poidsnetlivre", mouvement.PoidsNetLivre);
            cmd.Parameters.AddWithValue("@retention", mouvement.RetentionPoids);
            cmd.Parameters.AddWithValue("@poidsnetaccepte", mouvement.PoidsNetAccepte);
            cmd.Parameters.AddWithValue("@CreationUser", (object)mouvement.CreationUtilisateur ?? DBNull.Value);

            // CORRECTION : Les paramètres optionnels sont maintenant dans le bon ordre
            cmd.Parameters.AddWithValue("@EmplacementID", (object)mouvement.EmplacementID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@sactypeId", (object)mouvement.SacTypeID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@commentaire", (object)mouvement.Commentaire ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@SiteID", mouvement.SiteID); // Ce paramètre est maintenant à la bonne place
            cmd.Parameters.AddWithValue("@produitID", (object)mouvement.ProduitID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@lotID", (object)mouvement.LotID ?? DBNull.Value);

            // Paramètres de sortie
            var idParam = cmd.Parameters.Add(new SqlParameter("@ID", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output });
            var rvParam = cmd.Parameters.Add(new SqlParameter("@RowVersion", SqlDbType.Timestamp) { Direction = ParameterDirection.Output });
            var errParam = cmd.Parameters.Add(new SqlParameter("@ErrorMessage", SqlDbType.VarChar, 1000) { Direction = ParameterDirection.Output });

            cmd.ExecuteNonQuery();

            string errorMessage = errParam.Value is DBNull ? null : errParam.Value.ToString();
            if (!string.IsNullOrEmpty(errorMessage))
            {
                throw new Exception("Erreur retournée par la base de données : " + errorMessage);
            }

            mouvement.ID = idParam.Value is DBNull ? Guid.Empty : (Guid)idParam.Value;
            mouvement.RowVersionKey = rvParam.Value is DBNull ? null : (byte[])rvParam.Value;
        }
    }
}
