import { useEffect, useState } from "react";

type ActionLog = {
    id: string;
    userId: string;
    username: string;
    action: string;
    details?: string;
    createdAt: string;
};

type Props = {
    feedback: (success: boolean, message: string) => void;
};

export default function ActionLogs({ feedback }: Props) {
    const [logs, SetLogs] = useState<ActionLog[]>([]);
    const [loading, SetLoading] = useState(true);

    const LoadLogs = async () => {
        SetLoading(true);

        try {
            const response = await fetch(
                "/api/admin/logs",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load logs.");
            }

            const data = await response.json();

            SetLogs(data.logs || []);

        } catch (error) {
            console.error(error);

            feedback(
                false,
                "Failed to load action logs."
            );
        } finally {
            SetLoading(false);
        }
    };

    useEffect(() => {
        LoadLogs();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" />
            </div>
        );
    }

    return (
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
                {logs.map((log) => (
                    <div
                        className="col-12 col-md-6"
                        key={log.id}
                    >
                        <div className="card shadow-sm">

                            <div className="card-body">

                                <div className="d-flex justify-content-between align-items-start">

                                    <h5 className="card-title">
                                        {log.action}
                                    </h5>

                                    <small className="text-muted">
                                        {new Date(
                                            log.createdAt
                                        ).toLocaleString()}
                                    </small>

                                </div>

                                <p className="mb-1">
                                    <strong>User:</strong>{" "}
                                    {log.username}
                                </p>

                                {log.details && (
                                    <p className="text-muted mb-0">
                                        {log.details}
                                    </p>
                                )}

                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
