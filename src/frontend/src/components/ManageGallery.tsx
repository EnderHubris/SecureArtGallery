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
    
    const [users, SetUsers] = useState<Array<{
        uid: number;
        username: string;
        email: string;
    }[]>>([]);

    const [userCounts, SetUserCounts] = useState<number[]>([]);
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
            SetUserCounts(result.counts ?? []);
            SetUsers(result.users ?? []);

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
                <h4>Room Overview</h4>
            </div>

            <div className="row g-3">
                {rooms.map((room, i) => (
                    <div className="col-12 col-md-6 col-lg-4" key={room.id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">
                                    {room.name}
                                </h5>

                                {room.is_restricted && (
                                    <span className="badge text-bg-danger">Restricted</span>
                                )}

                                <p className="card-text text-muted mb-0">
                                    Room ID: {room.id}
                                </p>

                                <p className="card-text text-muted mb-0">
                                    Occupancy: {userCounts[i]} / {room.occupancy}
                                </p>

                                { (users[i] && users[i].length > 0) && (
                                    <details>
                                        <summary>Users:</summary>
                                        <ul className="badge text-bg-primary">
                                            {users[i].map( (user: {
                                                    uid: number;
                                                    username: string;
                                                    email: string;
                                                }) => (
                                                <li key={user.uid}>
                                                    {user.username} - {user.email}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <hr/>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Gallery Images</h4>
            </div>

            <div className="row g-4">
                {images.map((image: GalleryImage) => (
                    <div
                        className="col-12 col-sm-6 col-lg-4 col-xl-3"
                        key={image.id}
                    >
                        <div
                            className="p-2 shadow"
                            style={{
                                backgroundColor: "#5a3a22",
                                border: "8px solid #8b5e34",
                                borderRadius: "4px",
                            }}
                        >
                            <div
                                className="p-2"
                                style={{
                                    backgroundColor: "#1f1f1f",
                                }}
                            >
                                <img
                                    src={GetBackendStr(`/gallery/${image.image}`)}
                                    alt=""
                                    className="w-100 d-block"
                                    style={{
                                        height: "220px",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        </div>
                        <figcaption>Located at Room ID: <b>{image.room_id}</b></figcaption>
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
            <hr />

            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                <AddGalleryContent user={user} rooms={rooms} feedback={feedback} LoadContent={LoadContent} />
            </div>
        </div>
    );
}
