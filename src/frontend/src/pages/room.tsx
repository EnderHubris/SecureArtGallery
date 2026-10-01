import { useEffect, useState } from "react";
import { GetBackendStr, GetRoomInfo } from "../utilities/utiliies";
import type { RoomData, GalleryImage } from "../components/m_types";
import { EnterRoom, lobbyRoom } from "../utilities/room_utils";
import Feedback from "../components/feedback";

export default function Room() {
    const [render, SetRender] = useState(false);
    
    const [room, SetRoom] = useState<RoomData>(lobbyRoom);
    const [adjacent, SetAdjacent] = useState<{ id: number, name: string }[]>([]);
    const [userCount, SetUserCount] = useState<number>(1);

    const [galleryImages, SetGalleryImages] = useState<GalleryImage[]>([]);

    const [success, SetSuccess] = useState(false);
    const [msg, SetMsg] = useState<string|undefined|null>("");

    async function GetImages() {
        try {
            const endpoint = GetBackendStr(`/room_content`);
            const response = await fetch(endpoint, {
                credentials: "include",
            });
            const result = await response.json();
            SetGalleryImages(result);
        } catch (e) {
            console.error(e);

            SetGalleryImages([]);
        }
    }

    const FetchRoomData = async () => {
        const data = await GetRoomInfo();
        
        console.log(data);

        SetRoom(data.room);
        SetAdjacent(data.adjacent);
        SetUserCount(data.peopleInRoom);
        
        await GetImages();
    }

    async function ExitRoom(id: number) {
        const result = await EnterRoom(id);

        SetSuccess(result.success);
        SetMsg(result.message);

        if (result.success) {
            await FetchRoomData();
        }

        // clear feedback after some time
        setTimeout(() => {
            SetMsg(null);
        }, result.success ? 1000 : 3000);
    }

    useEffect(() => {
        const logic = async () => {
            await FetchRoomData();
            SetRender(true);
        }
        logic();
    }, []);

    return render && (
    <>
        <div className="container py-4">
            <Feedback success={success} message={msg} />
            
            <div className="card shadow-sm">
                <div className="card-body text-center">
                    <h1 className="display-6 mb-2">Welcome to the {room.name}!</h1>

                    <div className="d-flex align-items-center justify-content-center gap-3">
                        {room.is_restricted ? (
                            <span className="badge text-bg-danger">Restricted Area</span>
                        ) : (
                            <span className="badge text-bg-success">Open to Visitors</span>
                        )}

                        <span className="badge text-bg-primary">Occupancy {room.occupancy} </span>
                        <span className="badge text-bg-secondary">People {userCount} </span>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm mt-4">
                <div className="row g-3">
                    {galleryImages.map((image: GalleryImage) => (
                        <img
                            key={image.id}
                            style={{ width: "400px" }}
                            src={
                                GetBackendStr(`/gallery/${image.image}`)
                            }
                        />
                    ))}
                </div>
            </div>

            <div className="card shadow-sm mt-4">
                <div className="card-header fw-semibold">Where would you like to go?</div>
                <div className="card-body">
                    {adjacent.length === 0 ? (
                        <p className="text-muted mb-0">There are no adjoining rooms.</p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {adjacent.map((room: { id: number, name: string }) => (
                                <button
                                    key={room.id.toString()}
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => { ExitRoom(room.id) }}
                                >
                                    Enter {room.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>
    );
}