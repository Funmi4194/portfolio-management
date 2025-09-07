export interface IUser {
    // tablename = users
    id: string; // uuid
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
