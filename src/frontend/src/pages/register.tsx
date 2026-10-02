import { useRef, useState } from "react";
import { GetBackendStr, str2sha256 } from "../utilities/utiliies";

import Feedback from '../components/feedback';

export default function Register() {
    const pfpRef = useRef<HTMLInputElement>(null);
    
    const [username, SetUsername] = useState("");
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");
    const [image, SetImage] = useState<File|null|undefined>(null);

    const [success, SetSuccess] = useState(false);
    const [msg, SetMsg] = useState<string|undefined|null>("");

    function updateImageFile(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        SetImage(file);
    }
    
    async function sendRegister(e: React.SubmitEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
    
            // needed because image cannot be pushed in a JSON object
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password_hash", await str2sha256(password));
            if (image) {
                formData.append("pfp", image);
            }
    
            const endpoint = GetBackendStr("/register");
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });
    
            const result = await response.json();
    
            // clear form information
            if (result.success) {
                SetUsername("");
                SetEmail("");
                SetPassword("");
                SetImage(null);
    
                // clear file input element value
                if (pfpRef.current)
                    pfpRef.current.value = "";
            }
    
            SetSuccess(result.success);
            SetMsg(result.message);
    
            // clear feedback after some time
            setTimeout(() => {
                SetMsg(null);
                if (result.success)
                    window.location.href = "/login";
            }, result.success ? 1000 : 3000);
        } catch (e) {
            console.error("[-] User Registration Failed:", e);
        }
    }

    return (
    <>
        <div className="container">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <Feedback success={success} message={msg} />
                            
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card">
                        <div className="card-body p-5 text-center">
                            <form className="pb-4" onSubmit={(e) => sendRegister(e)}>
                                <h2 className="fw-bold mb-4 text-uppercase">
                                    Register
                                </h2>

                                <div className="mb-4">
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        className="form-control form-control-lg mb-3"
                                        value={username}
                                        onChange={(e) => SetUsername(e.target.value)}
                                        required
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="form-control form-control-lg"
                                        value={email}
                                        onChange={(e) => SetEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4 text-start">
                                    <label
                                        htmlFor="pfp"
                                        className="form-label fw-semibold mb-1"
                                    >
                                        Profile Image
                                        <span className="text-muted fw-normal ms-2">
                                            (Optional)
                                        </span>
                                    </label>

                                    <input
                                        id="pfp"
                                        type="file"
                                        className="form-control"
                                        accept="image/png,image/jpeg"
                                        onChange={(e) => updateImageFile(e)}
                                        ref={pfpRef}
                                    />

                                    <div className="form-text">
                                        {image ? (
                                            <p>
                                                Selected: {image.name}
                                            </p>
                                        ) : (
                                            <p>
                                                You can add a profile picture now or choose
                                                one later.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
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
                                    Register
                                </button>
                            </form>

                            <div>
                                <p>
                                    Have an account?
                                    <br />
                                    <a href="/login" className="fw-bold">
                                        Log in
                                    </a>
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