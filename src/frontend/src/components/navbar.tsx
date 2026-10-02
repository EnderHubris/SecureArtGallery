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
        try {
            const endpoint = GetBackendStr("/logout");
            const response = await fetch(endpoint, {
                method: "POST",
                credentials: "include"
            });
    
            const result = await response.json();
            if (result.success) {
                window.location.href = "/";
            }
        } catch (e) {
            console.error("[-] Logout Failed:", e);
        }
    }

    return (
        <nav
            className="vert-nav d-flex align-items-center flex-column flex-shrink-0 vh-100 p-3 gap-3"
        >
            <a className="nav-link" href="/">Home</a>

            {user.role === "employee" && (
            <>
                <a className="nav-link" href="/employee">Employee</a>
            </>
            )}

            {user.role === "admin" && (
            <>
                <a className="nav-link" href="/admin">Admin</a>
            </>
            )}

            <div className="d-flex flex-column flex-grow-1"></div>
            <span>{user.username}</span>

            {/* role display */}
            {user.role === "guest" && (
                <span
                    className={"badge bg-primary"}
                >
                    guest
                </span>
            )}
            {user.role === "employee" && (
                <span
                    className={"badge bg-warning"}
                >
                    employee
                </span>
            )}
            {user.role === "admin" && (
                <span
                    className={"badge bg-danger"}
                >
                    admin
                </span>
            )}
            
            <img
                className="pfp"
                title="profile picture"
                alt="profile picture"
                onError={(e) => {
                    // default image if backend is down
                    e.currentTarget.src = "/default.png";
                }}
                src={GetBackendStr(`/image/${user.image}`)}
                onClick={() => {
                    if (!loggedIn)
                        window.location.href = "/login";
                    window.location.href = "/profile";
                }}
            />

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
