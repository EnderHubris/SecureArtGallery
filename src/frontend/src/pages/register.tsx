export default function Register() {
    return (
    <>
        <section className="vh-100">
            <div className="container">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card">
                            <div className="card-body p-5 text-center">
                                <div className="pb-4">
                                    <h2 className="fw-bold mb-4 text-uppercase">
                                        Register
                                    </h2>

                                    <div className="mb-4">
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Username"
                                            className="form-control form-control-lg mb-3"
                                            required
                                        />

                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            className="form-control form-control-lg"
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
                                            accept="image/*"
                                        />

                                        <div className="form-text">
                                            You can add a profile picture now or choose
                                            one later.
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <input
                                            id="passwd"
                                            type="password"
                                            placeholder="Password"
                                            className="form-control form-control-lg"
                                            required
                                        />
                                    </div>

                                    <button
                                        className="btn btn-outline-primary btn-lg px-5"
                                        type="submit"
                                    >
                                        Register
                                    </button>
                                </div>

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
        </section>
    </>
    );
}