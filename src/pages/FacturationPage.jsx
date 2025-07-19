import React, { useEffect, useState } from "react";
import { getProduits } from "../services/stockApi";
import {createFacture} from "../services/invoiceService";
import { findClients,createClient } from "../services/clientService";
import ClientSelector from "./ClientSelector";

function FacturationPage() {
  const [produits, setProduits] = useState([]);
  const [client, setClient] = useState(null);
  const [lignesProduit, setLignesProduit] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [totaux, setTotaux] = useState({ totalHT: 0, totalTVA: 0, totalTTC: 0 });

  useEffect(() => {
     getProduits()
          .then((res) => setProduits(res.data))
          .catch((err) => alert("Erreur lors du chargement des produits"));
  }, []);

  useEffect(() => {
    calculerTotaux();
  }, [lignesProduit, prestations]);

  const ajouterLigneProduit = () => {
    setLignesProduit([...lignesProduit, { produitId: "", quantite: 1, prixHT: 0, tva: 0, totalHT: 0, totalTTC: 0 }]);
  };

  const ajouterPrestation = () => {
    setPrestations([...prestations, { description: "", prixHT: 0, tva: 20, totalTTC: 0 }]);
  };

  const handleProduitChange = (index, field, value) => {
    const newLignes = [...lignesProduit];
    if (field === "produitId") {
      const produit = produits.find((p) => p.id === parseInt(value));
      if (produit) {
        newLignes[index] = {
          ...newLignes[index],
          produitId: produit.id,
          prixHT: produit.prixUnitaireHT,
          tva: produit.tva,
        };
      }
    } else {
      newLignes[index][field] = parseFloat(value);
    }
    newLignes[index].totalHT = newLignes[index].prixHT * newLignes[index].quantite;
    newLignes[index].totalTTC = newLignes[index].totalHT * (1 + newLignes[index].tva / 100);
    setLignesProduit(newLignes);
  };

  const handlePrestationChange = (index, field, value) => {
    const newPres = [...prestations];
    newPres[index][field] = field === "description" ? value : parseFloat(value);
    newPres[index].totalTTC = newPres[index].prixHT * (1 + newPres[index].tva / 100);
    setPrestations(newPres);
  };

  const handleClientSelected = (clientData) => {
    setClient(clientData);
  };

  const calculerTotaux = () => {
    const totalHT = lignesProduit.reduce((sum, l) => sum + l.totalHT, 0) + prestations.reduce((sum, p) => sum + p.prixHT, 0);
    const totalTVA = lignesProduit.reduce((sum, l) => sum + (l.totalHT * l.tva) / 100, 0) + prestations.reduce((sum, p) => (p.prixHT * p.tva) / 100, 0);
    const totalTTC = totalHT + totalTVA;
    setTotaux({ totalHT, totalTVA, totalTTC });
  };



  const handleSubmit = async () => {
     if (!client) {
      alert("Veuillez sélectionner ou créer un client.");
      return;
    }
    const facture = {
        client,
        lignesProduit: lignesProduit.map((l) => ({
        produit: { id: l.produitId },
        quantite: l.quantite,
        prixUnitaireHT: l.prixHT,
        tva: l.tva,
        totalHT: l.totalHT,
        totalTTC: l.totalTTC,
      })),
      lignesPrestation: prestations,
      totalHT: totaux.totalHT,
      totalTVA: totaux.totalTVA,
      totalTTC: totaux.totalTTC,
    };

    try {
      await createFacture(facture);
      alert("Facture créée !");
    } catch (err) {
      alert("Erreur lors de la création");
    }


   
  };

  return (
    <div className="container">
      <h2>Nouvelle Facture</h2>
  
      
<ClientSelector onClientSelected={handleClientSelected} />

      <h5 className="mt-4">Produits</h5>
      {/* En-tête des colonnes */}
      <div className="row g-2 mb-2">
        <div className="col"><strong>Produit</strong></div>
        <div className="col"><strong>Quantité</strong></div>
        <div className="col"><strong>Prix HT</strong></div>
        <div className="col"><strong>TVA</strong></div>
        <div className="col"><strong>Total TTC</strong></div>
      </div>
      {/* Lignes des produits */}
      {lignesProduit.map((ligne, index) => (
        <div key={index} className="row g-2 mb-2">
          <div className="col">
            <select
              className="form-control"
              value={ligne.produitId}
              onChange={(e) => handleProduitChange(index, "produitId", e.target.value)}
            >
              <option value="">-- Produit --</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.designation}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <input type="number" className="form-control" placeholder="Quantité" value={ligne.quantite} onChange={(e) => handleProduitChange(index, "quantite", e.target.value)} />
          </div>
          <div className="col">
            <input type="number" className="form-control" placeholder="Prix HT" value={ligne.prixHT} readOnly />
          </div>
          <div className="col">
            <input type="number" className="form-control" placeholder="TVA" value={ligne.tva} readOnly />
          </div>
          <div className="col">
            <input type="number" className="form-control" placeholder="Total TTC" value={ligne.totalTTC.toFixed(2)} readOnly />
          </div>
        </div>
      ))}
      <button className="btn btn-outline-primary" onClick={ajouterLigneProduit}>+ Produit</button>
  
      <h5 className="mt-4">Prestations</h5>
      {/* En-tête des colonnes */}
      <div className="row g-2 mb-2">
        <div className="col"><strong>services</strong></div>
        <div className="col"><strong>Prix HT</strong></div>
        <div className="col"><strong>TVA</strong></div>
        <div className="col"><strong>Total TTC</strong></div>
      </div>
      {/* Lignes des produits */}
      {prestations.map((pres, index) => (
        <div key={index} className="row g-2 mb-2">
          <input className="form-control col" placeholder="Description" value={pres.description} onChange={(e) => handlePrestationChange(index, "description", e.target.value)} />
          <input type="number" className="form-control col" placeholder="Prix HT" value={pres.prixHT} onChange={(e) => handlePrestationChange(index, "prixHT", e.target.value)} />
          <input type="number" className="form-control col" placeholder="TVA" value={pres.tva} onChange={(e) => handlePrestationChange(index, "tva", e.target.value)} />
          <input type="number" className="form-control col" placeholder="Total TTC" value={pres.totalTTC.toFixed(2)} readOnly />
        </div>
      ))}
      <button className="btn btn-outline-secondary" onClick={ajouterPrestation}>+ Prestation</button>
  
      <div className="mt-4">
        <h5>Totaux</h5>
        <p>Total HT : {totaux.totalHT.toFixed(2)} €</p>
        <p>Total TVA : {totaux.totalTVA.toFixed(2)} €</p>
        <p>Total TTC : <strong>{totaux.totalTTC.toFixed(2)} €</strong></p>
      </div>
  
      <button className="btn btn-success mt-3" onClick={handleSubmit}>✅ Valider la facture</button>
    </div>
  );
}

export default FacturationPage;