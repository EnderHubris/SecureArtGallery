import { GetBackendStr } from "../utilities/utiliies";

type NavbarParams = {
    loggedIn: boolean,
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        image: string;
    }
};

export default function Navbar({ loggedIn, user }: NavbarParams ) {
    async function handleLogout() {
        const endpoint = GetBackendStr("/logout");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include"
        });

        const result = await response.json();
        if (result.success) {
            window.location.reload();
        }
    }

    return (
        <nav className="vert-nav d-flex flex-column flex-shrink-0 vh-100 p-3 gap-3">
            <a className="nav-link" href="/">Home</a>
            <a className="nav-link" href="#">Link</a>
            <div className="d-flex flex-column flex-grow-1"></div>
            <span>{user.username}</span>
            <img className="pfp" src={GetBackendStr(`/image/${user.image}`)}/>
            {loggedIn ? (
                <>
                    <button className="nav-link" onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <a className="nav-link" href="/login">Login</a>
                </>
            )}
        </nav>
    );
}
