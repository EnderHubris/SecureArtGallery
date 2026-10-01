import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetBackendStr } from "../utilities/utiliies";
import type { UserData } from "./m_types";

type Props = {
    user: UserData,
    feedback: (success: boolean, message: string) => void;
};

export default function ActionLogs({ user, feedback }: Props) {
    const [render, SetRender] = useState(false);

    const [actionLogs, SetActionLogs] = useState<{
        id: string,
        uid: string,
        username: string,
        email: string,
        src_room_id: number,
        dst_room_id: number,
        src_room_name: string,
        dst_room_name: string,
        action: string,
        ip_address: string,
        created_at: Date,
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") ?? 1);

    const LoadLogs = async () => {
        try {
            const page = searchParams.get("page");

            const endpoint = GetBackendStr(`/${user.role}/get_actions`);
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

            console.log(result);
            SetActionLogs(result.action_logs ?? []);

            feedback(
                result.success,
                result.success ? "Loaded Action Logs" : "Failed to Load Action Logs."
            );
        } catch (error) {
            console.error(error);

            feedback(
                false,
                "Failed to load action logs."
            );
        }
        SetRender(true);
    };

    const setPage = (newPage: number) => {
        setSearchParams((params) => {
            params.set("page", newPage.toString());
            return params;
        });
        window.location.reload();
    };

    useEffect(() => {
        LoadLogs();
    }, []);

    return render && (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Action Logs</h4>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={LoadLogs}
                >
                    Refresh
                </button>
            </div>

            <div className="row g-3">
                {actionLogs.map((a_log) => (
                    <div className="col-12 col-lg-6" key={a_log.id}>
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="card-title mb-1">
                                            {a_log.action}
                                        </h5>

                                        <small className="text-muted">
                                            Log #{a_log.id}
                                        </small>
                                    </div>

                                    <span className="badge bg-secondary">
                                        {a_log.ip_address}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <small className="text-muted d-block">
                                        Room Change
                                    </small>

                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-primary">
                                            {a_log.src_room_name}
                                        </span>

                                        <span className="text-muted">
                                            →
                                        </span>

                                        <span className="badge bg-success">
                                            {a_log.dst_room_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-top pt-3">
                                    <div className="d-flex justify-content-between">
                                        <small className="text-muted">
                                            User
                                        </small>

                                        <small>
                                            ({a_log.uid}) - {a_log.username} | {a_log.email} 
                                        </small>
                                    </div>

                                    <div className="d-flex justify-content-between mt-1">
                                        <small className="text-muted">
                                            IP Address
                                        </small>

                                        <small>
                                            {a_log.ip_address}
                                        </small>
                                    </div>

                                    <div className="d-flex justify-content-between mt-1">
                                        <small className="text-muted">
                                            Date
                                        </small>

                                        <small>
                                            {new Date(a_log.created_at).toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
