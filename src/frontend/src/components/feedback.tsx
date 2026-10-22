type FeedbackParams = {
    success: boolean,
    message: string|undefined|null,
}

export default function Feedback({ success, message }: FeedbackParams) {
    if (!message) return null;

    return (
    <>
        <div
        role={success ? "status" : "alert"}
        className={`alert w-100 ${
            success ? "alert-success" : "alert-danger"
        } d-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 mb-3 small text-break`}
        >
            <span className="text-break">{message}</span>
        </div>
    </>
  );
}
