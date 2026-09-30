export type Tab = "create" | "users" | "logs";
export type UserData = {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string;
    sudo: boolean,
};