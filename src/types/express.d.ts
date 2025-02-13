import { UserPayload } from "./userPayload";

export { };


declare global {
    namespace Express {
        export interface Request {
            customer: UserPayload,
            accessToken: string
        }
    }
}