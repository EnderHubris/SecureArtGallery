export type Tab = "manage" | "create" | "users" | "logs";
export type UserData = {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string;
    banned: boolean,
    sudo: boolean,
};
export type RoomData = {
    id: number,
    name: string,
    is_restricted: boolean,
    occupancy: number,
}
export type GalleryImage = {
    id: string,
    image: string,
    room_id: number
}