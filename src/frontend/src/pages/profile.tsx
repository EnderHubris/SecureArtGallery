import { useRef, useState, useEffect } from "react";
import { VerifyLogin, GetBackendStr } from "../utilities/utiliies";

import Feedback from '../components/feedback';
import type { UserData } from "../components/m_types";

export default function Profile({ user } : { user: UserData }) {
    const [render, SetRender] = useState(false);
    
    useEffect(() => {
        const logic = async () => {
            const isValid = await VerifyLogin();
            SetRender(isValid);
            if (isValid) return;
            window.location.href = "/login";
        }
        logic();
    }, []);

    const pfpRef = useRef<HTMLInputElement>(null);
    
    const [n_username, SetUsername] = useState("");
    const [n_email, SetEmail] = useState("");
    const [n_image, SetImage] = useState<File|null|undefined>(null);

    const [n_password, SetNewPassword] = useState("");
    const [password, SetPassword] = useState("");

    const [success, SetSuccess] = useState(false);
    const [msg, SetMsg] = useState<string|undefined|null>("");

    function updateImageFile(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        SetImage(file);
    }
    
    async function updateProfile(e: React.SubmitEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
    
            // needed because image cannot be pushed in a JSON object
            const formData = new FormData();
            formData.append("username", n_username);
            formData.append("email", n_email);
            formData.append("n_password", n_password);
            formData.append("password", password);
            if (n_image) {
                formData.append("pfp", n_image);
            }
    
            const endpoint = GetBackendStr("/user/update");
            const response = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
    
            const result = await response.json();
    
            // clear form information
            if (result.success) {
                SetUsername("");
                SetEmail("");
                SetPassword("");
                SetNewPassword("");
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
                    window.location.reload();
            }, result.success ? 1000 : 3000);
        } catch (e) {
            console.error("[-] Profile Update Failed:", e);
        }
    }

    return render && (
    <>
        <div className="container">
            <div className="row d-flex justify-content-center align-items-start h-100">
            <Feedback success={success} message={msg} />

                {/* Profile Preview */}
                <div className="col-12 col-md-8 col-lg-3 mb-4 mb-lg-0 order-first order-lg-last">
                    <div className="card">
                        <div className="card-body p-4 text-center">
                            <h6 className="text-uppercase text-body-secondary mb-3">
                                Current Profile
                            </h6>

                            <img
                                src={GetBackendStr(`/image/${user.image}`)}
                                className="rounded-circle border mb-3"
                                style={{ width: 96, height: 96, objectFit: "cover", borderRadius: '50%' }}
                            />

                            <h5 className="fw-bold mb-1 text-break">{user.username}</h5>
                            <p className="text-body-secondary small mb-2 text-break">{user.email}</p>
                            <span className="badge text-bg-secondary text-uppercase">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Update Form */}
                <div className="col-12 col-md-8 col-lg-6 offset-lg-3">
                    <div className="card">
                        <div className="card-body p-5 text-center">
                            <form className="pb-4" onSubmit={updateProfile}>
                                <h2 className="fw-bold mb-4 text-uppercase">
                                    Edit Profile
                                </h2>

                                <div className="mb-4">
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="New Username"
                                        className="form-control form-control-lg mb-3"
                                        value={n_username}
                                        onChange={(e) => SetUsername(e.target.value)}
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="New Email"
                                        className="form-control form-control-lg mb-3"
                                        value={n_email}
                                        onChange={(e) => SetEmail(e.target.value)}
                                    />

                                    <input
                                        id="n_passwd"
                                        type="password"
                                        placeholder="New Password"
                                        className="form-control form-control-lg"
                                        value={n_password}
                                        onChange={(e) => SetNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4 text-start">
                                    <label
                                        htmlFor="pfp"
                                        className="form-label fw-semibold mb-1"
                                    >
                                        Profile Image
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
                                        {n_image && (
                                            <p>
                                                Selected: {n_image.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <input
                                        id="passwd"
                                        type="password"
                                        placeholder="Current Password"
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
                                    Update Profile
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}