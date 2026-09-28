export default function Login() {
    return (
    <>
        <section className="vh-100">
            <div className="container">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card">
                            <div className="card-body p-5 text-center">
                                <div className="pb-4">
                                    <h2 className="fw-bold mb-4 text-uppercase">Login</h2>

                                    <div className="mb-4">
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Username"
                                            className="form-control form-control-lg mb-3"
                                            required
                                        />

                                        <input
                                            id="passwd"
                                            type="password"
                                            placeholder="Password"
                                            className="form-control form-control-lg"
                                            required
                                        />
                                    </div>

                                    <button className="btn btn-outline-primary btn-lg px-5" type="submit">
                                        Login
                                    </button>
                                </div>

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
        </section>
        </>
    );
}