import { useState } from "react";
import { CreateNewEmployee } from "../../utilities/admin_utils";

type Props = {
    feedback: (success: boolean, message: string) => void;
};

export default function CreateEmployee({ feedback }: Props) {
    const [username, SetUsername] = useState("");
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");
    const [role, SetRole] = useState("employee");

    async function handleCreation(e) {
        e.preventDefault();
        
        const result = await CreateNewEmployee({ username, email, password, role });
        feedback(
            result.success,
            result.message
        );
        if (result.success) {
            SetUsername("");
            SetEmail("");
            SetPassword("");
            SetRole("employee");
        }
    }

    return (
        <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-md-5 d-flex justify-content-center">
                <form
                    className="w-100"
                    style={{ maxWidth: "600px" }}
                    onSubmit={handleCreation}
                >
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-uppercase mb-2">
                            Create Employee
                        </h2>

                        <p className="text-muted mb-0">
                            Create a new employee account
                        </p>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="form-label fw-semibold"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            className="form-control form-control-lg"
                            value={username}
                            onChange={(e) => SetUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="form-label fw-semibold"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            className="form-control form-control-lg"
                            value={email}
                            onChange={(e) => SetEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="role"
                            className="form-label fw-semibold"
                        >
                            Role
                        </label>

                        <select
                            id="role"
                            className="form-select form-select-lg"
                            value={role}
                            onChange={(e) => SetRole(e.target.value)}
                        >
                            <option value="employee">
                                Employee
                            </option>

                            <option value="admin">
                                Administrator
                            </option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="passwd"
                            className="form-label fw-semibold"
                        >
                            Password
                        </label>

                        <input
                            id="passwd"
                            type="password"
                            placeholder="Enter password"
                            className="form-control form-control-lg"
                            value={password}
                            onChange={(e) => SetPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-grid mt-4">
                        <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                        >
                            Create Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
