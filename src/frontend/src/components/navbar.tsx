import { useState } from 'react';

export default function Navbar() {
    const [isLoggedIn, setLoggedIn] = useState<boolean>(false);

    return (
        <nav className="d-flex flex-column flex-shrink-0 vh-100 p-3 gap-3">
            <a className="nav-link" href="/">Home</a>
            <a className="nav-link" href="#">Link</a>
            <div className="d-flex flex-column flex-grow-1"></div>
            {isLoggedIn ? (
                <>
                    <a className="nav-link" href="/logout">Logout</a>
                </>
            ) : (
                <>
                    <a className="nav-link" href="/login">Login</a>
                </>
            )}
        </nav>
    );
}
