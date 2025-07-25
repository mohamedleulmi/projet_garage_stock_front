import React, {useEffect, useState} from "react";
import {getProduits} from "../services/stockApi";
import {createFacture, getFacturePdf} from "../services/invoiceService";
import ClientSelector from "./ClientSelector";
import {calculerTotaux} from "../utils/helper";

function FacturationPage() {
    const [produits, setProduits] = useState([]);
    const [client, setClient] = useState(null);
    const [lignesProduit, setLignesProduit] = useState([]);
    const [prestations, setPrestations] = useState([]);
    const [totaux, setTotaux] = useState({totalHT: 0, totalTVA: 0, totalTTC: 0});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [factureCreee, setFactureCreee] = useState(null);

    useEffect(() => {
        getProduits()
            .then((res) => setProduits(res.data))
            .catch(() => alert("Erreur lors du chargement des produits"));
    }, []);


    useEffect(() => {
        const totauxCalcules = calculerTotaux(lignesProduit, prestations);
        setTotaux(totauxCalcules);
    }, [lignesProduit, prestations]);

    const ajouterLigneProduit = () => {
        setLignesProduit([...lignesProduit, {
            produit: null,
            quantite: 1,
            totalHT: 0,
            totalTTC: 0
        }]);
    };

    const handleProduitChange = (index, field, value) => {
        const lignes = [...lignesProduit];

        if (field === "produit") {
            const produitSelectionne = produits.find(p => p.id === parseInt(value));
            lignes[index].produit = produitSelectionne;
            lignes[index].quantite = 1;
        } else if (field === "quantite") {
            lignes[index].quantite = parseFloat(value);
        }

        const p = lignes[index].produit;
        if (p) {
            lignes[index].totalHT = p.prixUnitaireHT * lignes[index].quantite;
            lignes[index].totalTTC = lignes[index].totalHT * (1 + p.tva / 100);
        }

        setLignesProduit(lignes);
    };

    const ajouterPrestation = () => {
        setPrestations([...prestations, {
            description: "",
            prixHT: 0,
            tva: 20,
            totalTTC: 0
        }]);
    };

    const handlePrestationChange = (index, field, value) => {
        const nouvellesPrestations = [...prestations];
        const prestation = nouvellesPrestations[index];

        if (field === "description") {
            prestation.description = value;
        } else {
            prestation[field] = parseFloat(value);
        }

        prestation.totalTTC = prestation.prixHT * (1 + prestation.tva / 100);
        setPrestations(nouvellesPrestations);
    };

    const handleClientSelected = (clientData) => {
        setClient(clientData);
    };

    const handleSubmit = async () => {
        if (!client) {
            alert("Veuillez sélectionner ou créer un client.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        const facture = {
            client,
            lignesProduit: lignesProduit.map((produitSelected) => ({
                produit: {id: produitSelected.produit.id},
                quantite: produitSelected.quantite,
                prixUnitaireHT: produitSelected.produit.prixUnitaireHT,
                tva: produitSelected.produit.tva,
                totalHT: produitSelected.totalHT,
                totalTTC: produitSelected.totalTTC
            })),
            lignesPrestation: prestations,
            totalHT: totaux.totalHT,
            totalTVA: totaux.totalTVA,
            totalTTC: totaux.totalTTC
        };

        try {
            const factureResponse = await createFacture(facture);
            alert("Facture créée !");
            setFactureCreee(factureResponse.data);

            // 2. Récupération du PDF depuis le back
            const pdfResponse = await getFacturePdf(factureCreee.id);
            const blob = new Blob([pdfResponse.data], {type: "application/pdf"});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            window.open(url, "_blank");


        } catch (err) {
            alert("Erreur lors de la création de la facture");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <h2>Nouvelle Facture</h2>

            <ClientSelector onClientSelected={handleClientSelected}/>

            <h5 className="mt-4">Produits</h5>
            <div className="row g-2 mb-2">
                <div className="col"><strong>Produit</strong></div>
                <div className="col"><strong>Quantité</strong></div>
                <div className="col"><strong>Prix HT</strong></div>
                <div className="col"><strong>TVA</strong></div>
                <div className="col"><strong>Total TTC</strong></div>
            </div>

            {lignesProduit.map((ligne, index) => (
                <div key={index} className="row g-2 mb-2">
                    <div className="col">
                        <select
                            className="form-control"
                            value={ligne.produit ? ligne.produit.id : ""}
                            onChange={(e) => handleProduitChange(index, "produit", e.target.value)}
                        >
                            <option value="">-- Produit --</option>
                            {produits.map((p) => (
                                <option key={p.id} value={p.id}>{p.designation}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col">
                        <input
                            type="number"
                            className="form-control"
                            value={ligne.quantite}
                            onChange={(e) => handleProduitChange(index, "quantite", e.target.value)}
                        />
                    </div>
                    <div className="col">
                        <input
                            className="form-control"
                            value={ligne.produit ? ligne.produit.prixUnitaireHT : ""}
                            readOnly
                        />
                    </div>
                    <div className="col">
                        <input
                            className="form-control"
                            value={ligne.produit ? ligne.produit.tva : ""}
                            readOnly
                        />
                    </div>
                    <div className="col">
                        <input
                            className="form-control"
                            value={ligne.totalTTC.toFixed(2)}
                            readOnly
                        />
                    </div>
                </div>
            ))}

            <button className="btn btn-outline-primary" onClick={ajouterLigneProduit}>+ Produit</button>

            <h5 className="mt-4">Prestations</h5>
            <div className="row g-2 mb-2">
                <div className="col"><strong>Description</strong></div>
                <div className="col"><strong>Prix HT</strong></div>
                <div className="col"><strong>TVA</strong></div>
                <div className="col"><strong>Total TTC</strong></div>
            </div>

            {prestations.map((pres, index) => (
                <div key={index} className="row g-2 mb-2">
                    <input className="form-control col" placeholder="Description" value={pres.description}
                           onChange={(e) => handlePrestationChange(index, "description", e.target.value)}/>
                    <input className="form-control col" type="number" value={pres.prixHT}
                           onChange={(e) => handlePrestationChange(index, "prixHT", e.target.value)}/>
                    <input className="form-control col" type="number" value={pres.tva}
                           onChange={(e) => handlePrestationChange(index, "tva", e.target.value)}/>
                    <input className="form-control col" type="number" value={pres.totalTTC.toFixed(2)} readOnly/>
                </div>
            ))}

            <button className="btn btn-outline-secondary" onClick={ajouterPrestation}>+ Prestation</button>

            <div className="mt-4">
                <h5>Totaux</h5>
                <p>Total HT : {totaux.totalHT.toFixed(2)} €</p>
                <p>Total TVA : {totaux.totalTVA.toFixed(2)} €</p>
                <p>Total TTC : <strong>{totaux.totalTTC.toFixed(2)} €</strong></p>
            </div>

            <button className="btn btn-success mt-3" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Validation en cours..." : "Valider la facture"}
            </button>
        </div>
    );
}

export default FacturationPage;
