import axios from "axios";

const API_URL_CLIENTS = "http://localhost:8080/api/clients";


  export const findClients = () => axios.get(API_URL_CLIENTS);
  export const createClient = (client) => axios.post(API_URL_CLIENTS, client);