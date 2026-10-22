import { useEffect, useRef } from "react";

type FeedbackParams = {
    success: boolean,
    message: string|undefined|null,
}

export default function Feedback({ success, message }: FeedbackParams) {
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!message || !feedbackRef.current) return;

        feedbackRef.current.focus({ preventScroll: true });
        feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [message]);

    if (!message) return null;

    return (
    <>
        <div
        ref={feedbackRef}
        role={success ? "status" : "alert"}
        tabIndex={-1}
        className={`alert w-100 ${
            success ? "alert-success" : "alert-danger"
        } d-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 mb-3 small text-break`}
        >
            <span className="text-break">{message}</span>
        </div>
    </>
  );
}
