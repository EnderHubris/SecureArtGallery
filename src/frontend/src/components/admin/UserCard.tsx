import { useState } from "react";
import { GetBackendStr } from "../../utilities/utiliies";
import { ChangeRole, DeleteUser } from "../../utilities/admin_utils";

type UserData = {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string;
};

type Props = {
    self: UserData,
    user: UserData,
    feedback: (success: boolean, message: string) => void;
    LoadUsers: () => void;
};

export default function UserCard({ self, user, feedback, LoadUsers }: Props) {
    const [role, SetRole] = useState(user.role);

    async function handleDelete(uid: string) {
        if (!window.confirm("Are you sure you want to delete this user?"))
            return;
        const result = await DeleteUser(uid);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            LoadUsers();
    }

    async function handleRoleChange(uid: string) {
        if (!window.confirm("Are you sure you want to change this user's role?"))
            return;
        const result = await ChangeRole(uid, role);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            setTimeout(() => LoadUsers(), 3200)
    }

    return (
        <div
            className="col-12 col-md-6 col-xl-4"
            key={user.id}
        >
            <div className="card h-100 shadow-sm">
                <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                        <img
                            onError={(e) => {
                                // default image if backend is down
                                e.currentTarget.src = "/default.png";
                            }}
                            src={GetBackendStr(`/image/${user.image}`)}
                            className="rounded-circle me-3"
                            width="50"
                            height="50"
                            alt=""
                            style={{
                                objectFit: "cover",
                            }}
                        />

                        <div>
                            <h5 className="mb-0">
                                {user.username}
                            </h5>

                            <small className="text-muted">
                                {user.email}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <span
                            className={`${self.id !== user.id ? "roleOption" : ""} badge ${
                                role === "guest"
                                    ? "bg-primary"
                                    : "bg-secondary"
                            }`}
                            onClick={() => SetRole("guest")}
                        >
                            guest
                        </span>

                        <span
                            className={`${self.id !== user.id ? "roleOption" : ""} badge ${
                                role === "employee"
                                    ? "bg-warning"
                                    : "bg-secondary"
                            }`}
                            onClick={() => SetRole("employee")}
                        >
                            employee
                        </span>

                        <span
                            className={`${self.id !== user.id ? "roleOption" : ""} badge ${
                                role === "admin"
                                    ? "bg-danger"
                                    : "bg-secondary"
                            }`}
                            onClick={() => SetRole("admin")}
                        >
                            admin
                        </span>
                    </div>

                    {/* Cannot Self Modify/Delete */}
                    {user.id !== self.id && (
                        <div className="d-flex gap-2 mt-3">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleRoleChange(user.id)}
                            >
                                Change Role
                            </button>

                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(user.id)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
