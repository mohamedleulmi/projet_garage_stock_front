export function calculerTotaux(lignesProduit, prestations) {
    const totalHT =
        lignesProduit.reduce((sum, l) => sum + (l.totalHT || 0), 0) +
        prestations.reduce((sum, p) => sum + (p.prixHT || 0), 0);

    const totalTVA =
        lignesProduit.reduce((sum, l) => {
            const tva = l.produit ? l.produit.tva : 0;
            return sum + ((l.totalHT || 0) * tva) / 100;
        }, 0) +
        prestations.reduce((sum, p) => ((p.prixHT || 0) * (p.tva || 0)) / 100 + sum, 0);

    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA };
}