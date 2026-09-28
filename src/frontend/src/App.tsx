// general imports
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// component imports
import Navbar from "./components/navbar.tsx";

// import pages
import Home from './pages/home.tsx'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'

// import styling
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css'

function App() {
    return (
    <>
        <div className="d-flex vh-100 overflow-hidden">
            {/* Navbar */}
            <Navbar />

            <main className="flex-grow-1 overflow-auto p-4">
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </Router>
            </main>
        </div>
    </>
    )
}

export default App
