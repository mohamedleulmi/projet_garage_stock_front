import axios from "axios";

const API_URL = "http://localhost:8080/api/produits";

export const getProduits = () => axios.get(API_URL);
export const addProduit = (produit) => axios.post(API_URL, produit);
export const updateProduit = (id, produit) => axios.put(`${API_URL}/${id}`, produit);
