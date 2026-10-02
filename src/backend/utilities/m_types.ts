import * as schema from "../../../database/schema";

export type UserData = {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string;
    banned: boolean;
    sudo: boolean;
}

export const UserDataSelect = {
    id: schema.users.id,
    username: schema.users.username,
    email: schema.users.email,
    role: schema.users.role,
    image: schema.users.image,
    banned: schema.users.banned,
    sudo: schema.users.sudo,
}
