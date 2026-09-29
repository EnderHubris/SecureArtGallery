import { useState } from 'react';
import { str2sha256, GetBackendStr } from '../utilities/utiliies';

import Feedback from '../components/feedback';

export default function Login({ afterLogin }) {
    const [username, SetUsername] = useState("");
    const [password, SetPassword] = useState("");

    const [success, SetSuccess] = useState(false);
    const [msg, SetMsg] = useState<string|undefined|null>("");
    
    async function sendLogin(e) {
        e.preventDefault();

        const endpoint = GetBackendStr("/login");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": username,
                "password_hash": await str2sha256(password),
            }),
        });

        const result = await response.json();

        SetSuccess(result.success);
        SetMsg(result.message);

        if (result.success) {
            console.log("[+] Login Successful")
            afterLogin();
        }

        // clear feedback after some time
        setTimeout(() => {
            SetMsg(null);
        }, 3000);
    }

    return (
    <>
        <div className="container">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <Feedback success={success} message={msg} />

                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card">
                        <div className="card-body p-5 text-center">
                            <form 
                                className="pb-4"
                                onSubmit={sendLogin}
                            >
                                <h2 className="fw-bold mb-4 text-uppercase">Login</h2>

                                <div className="mb-4">
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Username or Email"
                                        className="form-control form-control-lg mb-3"
                                        value={username}
                                        onChange={(e) => SetUsername(e.target.value)}
                                        required
                                    />

                                    <input
                                        id="passwd"
                                        type="password"
                                        placeholder="Password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => SetPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    className="btn btn-outline-primary btn-lg px-5"
                                    type="submit"
                                >
                                    Login
                                </button>
                            </form>

                            <div>
                                <p>
                                    Don't have an account?<br/>
                                    <a href="/register" className="fw-bold">Sign Up</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}