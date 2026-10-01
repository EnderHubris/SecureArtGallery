import { useEffect, useState } from "react";
import { GetBackendStr } from "../utilities/utiliies";
import { useSearchParams } from "react-router-dom";

import AddGalleryContent from "../components/employee/AddContent"

import type { RoomData, UserData, GalleryImage } from "./m_types";

type Props = {
    user: UserData,
    feedback: (success: boolean, message: string) => void;
};

export default function GalleryManage({ user, feedback }: Props) {
    const [render, SetRender] = useState(false);
    const [rooms, SetRooms] = useState<RoomData[]>([]);
    const [images, SetImages] = useState<GalleryImage[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") ?? 1);
    const setPage = (newPage: number) => {
        setSearchParams((params) => {
            params.set("page", newPage.toString());
            return params;
        });
        window.location.reload();
    };

    const LoadGallery = async () => {
        try {
            const endpoint = GetBackendStr(`/${user.role}/get_rooms`);
            const response = await fetch(endpoint, {
                credentials: "include",
            });
            const result = await response.json();

            console.log(result);

            feedback(
                result.success,
                result.success ? "Fetched Rooms!" : "Failed to Fetch Rooms."
            );

            SetRooms(result.rooms ?? []);
            SetRender(true);
        } catch (error) {
            console.error(error);

            feedback(
                false,
                "Failed to Fetch Rooms."
            );
            SetRender(true);
        }
    };
    const LoadContent = async () => {
        try {
            const endpoint = GetBackendStr(`/${user.role}/get_content`);
            const response = await fetch(endpoint, {
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

            SetImages(result.content);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        LoadGallery();
        LoadContent();
    }, []);

    return render && (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Gallery Images</h4>
            </div>

            <div className="row g-3">
                <ul>
                {images.map((image: GalleryImage) => (
                    <li key={image.id}>
                        <img src={
                            GetBackendStr(`/gallery/${image.image}`)
                        } />
                    </li>
                ))}
                </ul>
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
            <hr />

            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                <AddGalleryContent user={user} rooms={rooms} feedback={feedback} LoadContent={LoadContent} />
            </div>
        </div>
    );
}
