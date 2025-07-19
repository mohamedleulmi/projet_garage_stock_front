import axios from "axios";

const API_URL_PRODUITS = "http://localhost:8080/api/produits";

export const getProduits = () => axios.get(API_URL_PRODUITS);
export const addProduit = (produit) => axios.post(API_URL_PRODUITS, produit);
export const updateProduit = (id, produit) => axios.put(`${API_URL_PRODUITS}/${id}`, produit);
