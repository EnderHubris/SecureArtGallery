import { useState } from "react";
import { GetBackendStr } from "../utilities/utiliies";
import type { GalleryImage, RoomData, UserData } from "./m_types";

type Props = {
    image: GalleryImage;
    user: UserData;
    rooms: RoomData[];
    feedback: (success: boolean, message: string) => void;
    LoadContent: () => void;
};

export default function GallaryImageCard({ image, user, rooms, feedback, LoadContent }: Props) {
    const [open, SetOpen] = useState(false);
    const [busy, SetBusy] = useState(false);

    async function send(path: string, method: "PATCH" | "DELETE", body?: object) {
        SetBusy(true);
        try {
            const uri = GetBackendStr(`/${user.role}/gallery/${image.id}${path}`);
            const response = await fetch(uri, {
                method,
                credentials: "include",
                headers: body ? { "Content-Type": "application/json" } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });
            const result = await response.json();
            feedback(result.success, result.message);
            if (result.success) LoadContent();
        } catch {
            feedback(false, "Request failed!");
        } finally {
            SetBusy(false);
        }
    }

    const changeRoom = (e: React.ChangeEvent<HTMLSelectElement>) =>
        send("/room", "PATCH", { room_id: Number(e.target.value) });

    const toggleVisible = () =>
        send("/visibility", "PATCH", { visible: !image.visible });

    const deleteImage = () => {
        if (window.confirm("Permanently delete this image?"))
            send("", "DELETE");
    };

    return (
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div
                className="p-2 shadow"
                style={{
                    backgroundColor: "#5a3a22",
                    border: "8px solid #8b5e34",
                    borderRadius: "4px",
                }}
            >
                <div className="p-2" style={{ backgroundColor: "#1f1f1f" }}>
                    <img
                        src={GetBackendStr(`/gallery/${image.image}`)}
                        alt=""
                        className="w-100 d-block"
                        style={{
                            height: "220px",
                            objectFit: "cover",
                            opacity: image.visible ? 1 : 0.35,
                        }}
                    />
                </div>
            </div>

            <figcaption className="d-flex justify-content-between align-items-center mt-1">
                <span>
                    Located at Room ID: <b>{image.room_id}</b>
                    {!image.visible && <span className="badge text-bg-secondary ms-2">Hidden</span>}
                </span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => SetOpen((o) => !o)}
                    aria-expanded={open}
                    aria-controls={`controls-${image.id}`}
                >
                    {open ? "Close" : "Manage"}
                </button>
            </figcaption>

            {open && (
                <div id={`controls-${image.id}`} className="card card-body mt-2 p-3">
                    <label htmlFor={`room-${image.id}`} className="form-label fw-semibold mb-1">
                        Move to room
                    </label>
                    <select
                        id={`room-${image.id}`}
                        className="form-select mb-3"
                        value={image.room_id}
                        onChange={changeRoom}
                        disabled={busy}
                    >
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}
                            </option>
                        ))}
                    </select>

                    <div className="form-check form-switch mb-3">
                        <input
                            id={`visible-${image.id}`}
                            type="checkbox"
                            role="switch"
                            className="form-check-input"
                            checked={image.visible}
                            onChange={toggleVisible}
                            disabled={busy}
                        />
                        <label htmlFor={`visible-${image.id}`} className="form-check-label">
                            Viewable in gallery
                        </label>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={deleteImage}
                        disabled={busy}
                    >
                        Delete image
                    </button>
                </div>
            )}
        </div>
    );
}