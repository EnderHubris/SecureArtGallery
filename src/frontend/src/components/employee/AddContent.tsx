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

    const [images, SetImages] = useState<File[]>([]);
    const [room_id, SetRoomID] = useState<string>("1");

    // keep the state and the file-list in sync
    function syncFiles(files: File[]) {
        SetImages(files);
        if (galleryImgRef.current) {
            const dt = new DataTransfer();
            files.forEach((f) => dt.items.add(f));
            galleryImgRef.current.files = dt.files;
        }
    }

    function updateImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
        syncFiles(Array.from(e.target.files ?? []));
    }

    function removeImage(index: number) {
        syncFiles(images.filter((_, i) => i !== index));
    }

    async function handleCreation(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (images.length === 0) {
            alert("Select at least one image!");
            return;
        }

        const formData = new FormData();
        formData.append("room", room_id);
        images.forEach((img) => formData.append("g_img", img));

        const endpoint = GetBackendStr(`/${user.role}/upload_content`);
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const result = await response.json();
        if (result.success) syncFiles([]);

        feedback(result.success, result.message);
        if (result.success)
            setTimeout(() => LoadContent(), 3200);
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
                            Add Images to Gallery
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
                        <label htmlFor="g_img" className="form-label fw-semibold mb-1">
                            Gallery Images
                        </label>

                        <input
                            id="g_img"
                            type="file"
                            multiple
                            className="form-control"
                            accept="image/png,image/jpeg"
                            onChange={updateImageFiles}
                            ref={galleryImgRef}
                        />

                        {images.length > 0 && (
                            <ul className="list-group mt-3">
                                {images.map((img, i) => (
                                    <li
                                        key={`${img.name}-${img.lastModified}`}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <span className="text-truncate me-3">{img.name}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeImage(i)}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="d-grid mt-4">
                        <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                            disabled={images.length === 0}
                        >
                            Add {images.length > 1 ? `${images.length} Images` : "Content"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
