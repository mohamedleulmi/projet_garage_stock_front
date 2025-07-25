import './App.css';
import {Link, Route, Routes} from 'react-router-dom';
import StockPage from './pages/StockPage';
import FacturationPage from './pages/FacturationPage';

function App() {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
                <a className="navbar-brand" href="/">GarageApp</a>
                <div className="navbar-nav">
                    <Link className="nav-link" to="/">Stock</Link>
                    <Link className="nav-link" to="/facture">Nouvelle Facture</Link>
                </div>
            </nav>
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<StockPage/>}/>
                    <Route path="/facture" element={<FacturationPage/>}/>
                </Routes>
            </div>
        </>
    );
}

export default App;
