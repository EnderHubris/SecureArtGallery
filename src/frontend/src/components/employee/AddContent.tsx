import { useRef, useState } from "react";
import { GetBackendStr } from "../../utilities/utiliies";
import type { RoomData, UserData } from "../m_types";

type Props = {
    user: UserData,
    rooms: RoomData[],
    feedback: (success: boolean, message: string) => void;
    LoadContent: () => void;
};

export default function AddGalleryContent({ user, rooms, feedback, LoadContent }: Props) {
    const galleryImgRef = useRef<HTMLInputElement>(null);

    const [n_image, SetImage] = useState<File|null|undefined>(null);
    const [room_id, SetRoomID] = useState<string>("1");

    function updateImageFile(e) {
        const file = e.target.files?.[0] ?? null;
        SetImage(file);
    }

    async function handleCreation(e) {
        e.preventDefault();
        
        if (!n_image) {
            alert("Missing required image!");
            return;
        }

        const formData = new FormData();
        formData.append("room", room_id);
        formData.append("g_img", n_image);

        const endpoint = GetBackendStr(`/${user.role}/upload_content`);
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            // clear file input element value
            SetImage(null);

            if (galleryImgRef.current)
                galleryImgRef.current.value = "";
        }
        
        feedback(
            result.success,
            result.message
        );
        if (result.success) {
            LoadContent();
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
                        <h3 className="fw-bold text-uppercase mb-2">
                            Add Image to Gallery
                        </h3>
                    </div>

                    <div className="mb-4 text-start">
                        <label
                            htmlFor="pfp"
                            className="form-label fw-semibold mb-1"
                        >
                            Gallery Room
                        </label>

                        <select
                            id="role"
                            className="form-select form-select-lg"
                            value={room_id}
                            onChange={(e) => {
                                const v = String(e.target.value);
                                SetRoomID(v);
                            }}
                        >
                            {rooms.map((room: RoomData) => (
                                <option key={room.id} value={room.id.toString()}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 text-start">
                        <label
                            htmlFor="pfp"
                            className="form-label fw-semibold mb-1"
                        >
                            Profile Image
                        </label>

                        <input
                            id="pfp"
                            type="file"
                            className="form-control"
                            accept="image/png,image/jpeg"
                            onChange={updateImageFile}
                            ref={galleryImgRef}
                        />

                        <div className="form-text">
                            {n_image && (
                                <p>
                                    Selected: {n_image.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="d-grid mt-4">
                        <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                        >
                            Add Content
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
