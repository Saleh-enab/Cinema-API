import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

export interface UserPayload extends JwtPayload {
    id: string,
    email: string
    role: UserRole
}