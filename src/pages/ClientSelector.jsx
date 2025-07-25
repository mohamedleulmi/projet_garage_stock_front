import {useEffect, useState} from "react";
import {Button, Form, InputGroup, Modal} from 'react-bootstrap';
import {createClient, findClients} from "../services/clientService";

function ClientSelector({onClientSelected}) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({
        nom: "",
        prenom: "",
        telephone: "",
        vehiculeImatriculation: "",
    });

    useEffect(() => {
        if (query.length >= 2) {
            findClients(query).then(res => {
                const q = query.toLowerCase();
                const filtered = res.data.filter(c =>
                    c.nom.toLowerCase().includes(q)
                );
                setSuggestions(filtered);
            });
        } else {
            setSuggestions([]);
        }
    }, [query]);
    const handleSelect = (client) => {
        onClientSelected(client);
        setQuery(`${client.nom} (${client.vehiculeImatriculation})`);
        setSuggestions([]);
    };

    const handleCreate = async () => {
        const res = await createClient(newClient);
        onClientSelected(res.data);
        setShowModal(false);
        setQuery(`${res.data.nom} (${res.data.vehiculeImatriculation})`);
    };

    return (
        <>
            <Form.Label>Client</Form.Label>
            <InputGroup className="mb-2">
                <Form.Control
                    placeholder="Nom ou Immatriculation"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={() => setShowModal(true)}>+ Nouveau client</Button>
            </InputGroup>
            {suggestions.length > 0 && (
                <ul className="list-group mb-2">
                    {suggestions.map((c) => (
                        <li
                            key={c.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelect(c)}
                            style={{cursor: "pointer"}}
                        >
                            {c.nom} – {c.telephone} ({c.vehiculeImatriculation})
                        </li>
                    ))}
                </ul>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Nouveau client</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control value={newClient.nom}
                                          onChange={(e) => setNewClient({...newClient, nom: e.target.value})}/>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Prenom</Form.Label>
                            <Form.Control value={newClient.prenom}
                                          onChange={(e) => setNewClient({...newClient, prenom: e.target.value})}/>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control value={newClient.telephone}
                                          onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Immatriculation</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex : GH-245-GE"
                                value={newClient.vehiculeImatriculation}
                                onChange={(e) => {
                                    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

                                    // Formater automatiquement LL-NNN-LL
                                    let formatted = "";
                                    if (raw.length >= 2) {
                                        formatted += raw.slice(0, 2);
                                        if (raw.length >= 5) {
                                            formatted += "-" + raw.slice(2, 5);
                                            if (raw.length > 5) {
                                                formatted += "-" + raw.slice(5, 7);
                                            }
                                        } else if (raw.length > 2) {
                                            formatted += "-" + raw.slice(2);
                                        }
                                    } else {
                                        formatted = raw;
                                    }

                                    setNewClient({
                                        ...newClient,
                                        vehiculeImatriculation: formatted
                                    });
                                }}
                                isInvalid={
                                    newClient.vehiculeImatriculation &&
                                    !/^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(newClient.vehiculeImatriculation)
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                Format attendu : 2 lettres - 3 chiffres - 2 lettres (ex : GH-245-GE)
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={handleCreate}>Créer client</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientSelector;
