export interface IUser {
    // tablename = users
    id: string; // uuid
    email: string;
    password: string;
    created_at: Date;
}
