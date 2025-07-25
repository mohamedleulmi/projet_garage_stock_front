import axios from "axios";

const API_URL_FACTURES = "http://localhost:8080/api/factures";


  export const createFacture = (facture) => axios.post(API_URL_FACTURES, facture);

export const getFacturePdf = (factureId) => {
  return axios.get(`${API_URL_FACTURES}/${factureId}/pdf`, {
    responseType: "blob",
  });
}
