import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetBackendStr } from "../../utilities/utiliies";

import UserCard from './UserCard';
import type { UserData } from "../m_types";

type Props = {
    user: UserData,
    feedback: (success: boolean, message: string) => void;
};

export default function UserManagement({ user, feedback }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") ?? 1);

    const [render, SetRender] = useState(false);
    const [users, SetUsers] = useState<UserData[]>([]);

    const LoadUsers = async () => {
        try {
            const page = searchParams.get("page");

            const endpoint = GetBackendStr("/admin/get_users");
            const response = await fetch(endpoint ,{
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "page": page
                }),
            });
            const result = await response.json();

            SetUsers(result.users ?? []);

            feedback(
                result.success,
                result.success ? "Loaded Users" : "Failed to Load Users."
            );
            SetRender(true);
        } catch (error) {
            console.error(error);

            feedback(
                false,
                "Failed to Load Users."
            );
            SetRender(true);
        }
    };

    const setPage = (newPage: number) => {
        setSearchParams((params) => {
            params.set("page", newPage.toString());
            return params;
        });
        window.location.reload();
    };

    useEffect(() => {
        LoadUsers();
    }, []);

    return render && (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Users</h4>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={LoadUsers}
                >
                    Refresh
                </button>
            </div>

            <div className="row g-3">
                {users.map((currentUser) => (
                    <UserCard self={user} user={currentUser} feedback={feedback} LoadUsers={LoadUsers} />
                ))}
            </div>

            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                {page > 0 && (
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>
                )}

                <span className="text-muted">
                    Page {page}
                </span>

                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
