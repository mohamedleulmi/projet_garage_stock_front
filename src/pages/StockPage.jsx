import React, { useEffect, useState } from "react";
import { getProduits, addProduit, updateProduit } from "../services/stockApi";
import axios from "axios";

function StockPage() {
  const [produits, setProduits] = useState([]);
  const [newProduit, setNewProduit] = useState({
    reference: "",
    designation: "",
    prixUnitaireHT: 0,
    tva: 20,
    stockActuel: 0,
    seuilAlerte: 0,
  });
  const [editId, setEditId] = useState(null);
  const [editProduit, setEditProduit] = useState({});
  const [filterText, setFilterText] = useState("");

  const chargerProduits = () => {
    getProduits()
      .then((res) => setProduits(res.data))
      .catch((err) => alert("Erreur lors du chargement des produits"));
  };

  useEffect(() => {
    chargerProduits();
  }, []);

  const handleAdd = () => {
    addProduit(newProduit)
      .then(() => {
        alert("Produit ajouté !");
        chargerProduits();
        setNewProduit({ reference: "", designation: "", prixUnitaireHT: 0, tva: 20, stockActuel: 0, seuilAlerte: 0 });
      })
      .catch(() => alert("Erreur lors de l'ajout"));
  };

  const handleEdit = (produit) => {
    setEditId(produit.id);
    setEditProduit({ ...produit });
  };

  const handleSave = () => {
    updateProduit(editId, editProduit)
      .then(() => {
        alert("Produit mis à jour !");
        setEditId(null);
        setEditProduit({});
        chargerProduits();
      })
      .catch(() => alert("Erreur lors de la mise à jour"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Confirmer la suppression de ce produit ?")) {
      axios.delete(`http://localhost:8080/api/produits/${id}`)
        .then(() => {
          alert("Produit supprimé !");
          chargerProduits();
        })
        .catch(() => alert("Erreur lors de la suppression"));
    }
  };

  const handleChangeEdit = (e) => {
    setEditProduit({ ...editProduit, [e.target.name]: e.target.value });
  };

  const handleChangeNew = (e) => {
    setNewProduit({ ...newProduit, [e.target.name]: e.target.value });
  };

  const produitsFiltres = produits.filter(
    (p) =>
      p.reference.toLowerCase().includes(filterText.toLowerCase()) ||
      p.designation.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <h2>Gestion du Stock</h2>

      {/* 🔍 Filtre */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Filtrer par référence ou désignation"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      {/* ➕ Ajout */}
      <div className="card p-3 my-3">
        <h5>Ajouter un produit</h5>
        <div className="row g-2">
          <input name="reference" value={newProduit.reference} onChange={handleChangeNew} placeholder="Réf." className="form-control col" />
          <input name="designation" value={newProduit.designation} onChange={handleChangeNew} placeholder="Désignation" className="form-control col" />
          <input name="prixUnitaireHT" type="number" value={newProduit.prixUnitaireHT} onChange={handleChangeNew} placeholder="Prix HT" className="form-control col" />
          <input name="tva" type="number" value={newProduit.tva} onChange={handleChangeNew} placeholder="TVA (%)" className="form-control col" />
          <input name="stockActuel" type="number" value={newProduit.stockActuel} onChange={handleChangeNew} placeholder="Stock" className="form-control col" />
          <input name="seuilAlerte" type="number" value={newProduit.seuilAlerte} onChange={handleChangeNew} placeholder="Seuil alerte" className="form-control col" />
          <button className="btn btn-success col" onClick={handleAdd}>Ajouter</button>
        </div>
      </div>

      {/* 📦 Tableau */}
      <table className="table table-striped table-hover mt-4">
        <thead>
          <tr>
            <th>Réf</th>
            <th>Désignation</th>
            <th>Prix HT</th>
            <th>TVA</th>
            <th>Stock</th>
            <th>Vendus</th>
            <th>Seuil Alerte</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produitsFiltres.map((produit) => (
            <tr key={produit.id} className={produit.stockActuel < produit.seuilAlerte ? "table-danger" : ""}>
              {editId === produit.id ? (
                <>
                  <td><input name="reference" value={editProduit.reference} onChange={handleChangeEdit} className="form-control" /></td>
                  <td><input name="designation" value={editProduit.designation} onChange={handleChangeEdit} className="form-control" /></td>
                  <td><input name="prixUnitaireHT" type="number" value={editProduit.prixUnitaireHT} onChange={handleChangeEdit} className="form-control" /></td>
                  <td><input name="tva" type="number" value={editProduit.tva} onChange={handleChangeEdit} className="form-control" /></td>
                  <td><input name="stockActuel" type="number" value={editProduit.stockActuel} onChange={handleChangeEdit} className="form-control" /></td>
                  <td>{produit.stockVendu}</td>
                  <td><input name="seuilAlerte" type="number" value={editProduit.seuilAlerte} onChange={handleChangeEdit} className="form-control" /></td>
                  <td>
                    <button className="btn btn-sm btn-success me-1" onClick={handleSave}>💾</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>❌</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{produit.reference}</td>
                  <td>{produit.designation}</td>
                  <td>{produit.prixUnitaireHT} €</td>
                  <td>{produit.tva} %</td>
                  <td>{produit.stockActuel}</td>
                  <td>{produit.stockVendu}</td>
                  <td>{produit.seuilAlerte}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(produit)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(produit.id)}>🗑️</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockPage;
