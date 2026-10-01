import { useState } from "react";
import { GetBackendStr } from "../utilities/utiliies";
import { BanUser, ChangeRole, DeleteUser, UnbanUser } from "../utilities/admin_utils";
import type { UserData } from "./m_types";
import { KickUser } from "../utilities/employee_utils";

type Props = {
    self: UserData,
    user: UserData,
    feedback: (success: boolean, message: string) => void;
    LoadUsers: () => void;
};

export default function UserCard({ self, user, feedback, LoadUsers }: Props) {
    const [role, SetRole] = useState(user.role);
    const canEdit: boolean = (self.role === "admin" && (self.id !== user.id));

    async function handleDelete(uid: string) {
        if (!window.confirm("Are you sure you want to DELETE this user?"))
            return;
        const result = await DeleteUser(uid);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            setTimeout(() => LoadUsers(), 3200);
    }
    async function handleKick(uid: string) {
        if (!window.confirm("Are you sure you want to KICK this user?"))
            return;
        const result = await KickUser(self.role, uid);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            setTimeout(() => LoadUsers(), 3200);
    }
    async function handleBan(ban_status: boolean, uid: string) {
        if (!window.confirm(`Are you sure you want to ${ ban_status ? "UNBAN" : "BAN" } this user?`))
            return;
        const result = ban_status ? await UnbanUser(uid) : await BanUser(uid);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            setTimeout(() => LoadUsers(), 3200);
    }

    async function handleRoleChange(uid: string) {
        if (!window.confirm("Are you sure you want to CHANGE this user's ROLE?"))
            return;
        const result = await ChangeRole(uid, role);
        feedback(
            result.success,
            result.message
        );
        if (result.success)
            setTimeout(() => LoadUsers(), 3200);
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

                                {user.banned && (
                                    <span className={"m-2 badge bg-danger"}>
                                        BANNED
                                    </span>
                                )}
                            </h5>

                            <small className="text-muted">
                                {user.email}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <span
                            className={`${canEdit ? "roleOption" : ""} badge ${
                                role === "guest"
                                    ? "bg-primary"
                                    : "bg-secondary"
                            }`}
                            onClick={() => { if (canEdit) SetRole("guest") }}
                        >
                            guest
                        </span>

                        <span
                            className={`${canEdit ? "roleOption" : ""} badge ${
                                role === "employee"
                                    ? "bg-warning"
                                    : "bg-secondary"
                            }`}
                            onClick={() => { if (canEdit) SetRole("employee") }}
                        >
                            employee
                        </span>

                        <span
                            className={`${canEdit ? "roleOption" : ""} badge ${
                                role === "admin"
                                    ? "bg-danger"
                                    : "bg-secondary"
                            }`}
                            onClick={() => { if (canEdit) SetRole("admin") }}
                        >
                            admin
                        </span>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        {/* Cannot Self Modify/Delete */}
                        {canEdit && (user.id !== self.id) && (
                            <>
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
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleBan(user.banned, user.id)}
                                >
                                    {user.banned ? (
                                        <>Unban</>
                                    ) : (
                                        <>Ban</>
                                    )}
                                </button>
                            </>
                        )}
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleKick(user.id)}
                        >
                            Kick
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
