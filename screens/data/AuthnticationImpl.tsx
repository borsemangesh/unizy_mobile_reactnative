import { UserRepository } from "../domain/UserRepository";
import { Users } from "./Users";

 class AuthnticationImpl implements UserRepository {
    constructor() {
    }
     login(): Users {
         throw new Error("Method not implemented.");
     }
}