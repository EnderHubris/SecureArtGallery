// general imports
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// component imports
import Navbar from "./components/navbar.tsx";

// import pages
import Home from './pages/home.tsx'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Profile from './pages/profile.tsx'
import AdminPanel from './pages/admin.tsx'
import EmployeePanel from './pages/employee.tsx'

// import styling
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css'
import { useEffect, useState } from 'react';
import { GetBackendStr } from './utilities/utiliies.ts';
import type { UserData } from './components/m_types.ts';

const defaultUser: UserData = {
    id: "0",
    username: "guest",
    email: "",
    role: "guest",
    image: "guest.png",
    banned: false,
    sudo: false,
}

function App() {
    const [render, SetRender] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<UserData>(defaultUser);

    const getUserInfo = async () => {
        try {
            const endpoint = GetBackendStr("/info");
            const response = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
            });
    
            const result = await response.json();
            setLoggedIn(result.success);
            setUser(result.user);
        } catch (e) {
            console.error("[-] Get User Info Failed:", e);
            setLoggedIn(false);
            setUser(defaultUser);
        }
        SetRender(true);
    };

    useEffect(() => {
        getUserInfo();
    }, []);
    
    return render && (
    <>
        <div className="d-flex vh-100 overflow-hidden">
            {/* Navbar */}
            <Navbar loggedIn={loggedIn} user={user} />

            <main className="flex-grow-1 overflow-auto p-4">
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/admin" element={<AdminPanel user={user} />} />
                        <Route path="/employee" element={<EmployeePanel user={user} />} />
                        <Route path="/login" element={<Login afterLogin={getUserInfo} />} />
                        <Route path="/profile" element={<Profile user={user} />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </Router>
            </main>
        </div>
    </>
    )
}

export default App
