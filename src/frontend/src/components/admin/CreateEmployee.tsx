import { useState } from "react";

type Props = {
    feedback: (success: boolean, message: string) => void;
};

export default function CreateEmployee({ feedback }: Props) {
    const [username, SetUsername] = useState("");
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");
    const [role, SetRole] = useState("employee");

    const [loading, SetLoading] = useState(false);

    const handleNewEmployee = async (e: React.FormEvent) => {
        e.preventDefault();

        SetLoading(true);

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                feedback(
                    false,
                    data.message || "Failed to create employee."
                );
                return;
            }

            feedback(
                true,
                "Employee account created successfully."
            );

            SetUsername("");
            SetEmail("");
            SetPassword("");
            SetRole("employee");

        } catch (error) {
            console.error(error);

            feedback(
                false,
                "An error occurred while creating the employee."
            );
        } finally {
            SetLoading(false);
        }
    };

    return (
        <div className="card shadow-sm">

            <div className="card-header">
                <h5 className="mb-0">
                    Create Employee Account
                </h5>
            </div>

            <div className="card-body">

                <form onSubmit={handleNewEmployee}>

                    <div className="row">

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Username
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) =>
                                    SetUsername(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) =>
                                    SetEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) =>
                                    SetPassword(e.target.value)
                                }
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Role
                            </label>

                            <select
                                className="form-select"
                                value={role}
                                onChange={(e) =>
                                    SetRole(e.target.value)
                                }
                            >
                                <option value="employee">
                                    Employee
                                </option>

                                <option value="admin">
                                    Administrator
                                </option>
                            </select>
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Employee"}
                    </button>

                </form>

            </div>
        </div>
    );
}
