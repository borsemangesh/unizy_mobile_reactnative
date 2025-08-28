import { Users } from "../data/Users";

export interface UserRepository {
        login(): Users;
}