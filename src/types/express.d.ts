import { PayloadJwtType } from "../validations/auth.schema.js";

declare global {
    namespace Express {
        interface Request {
            user?: PayloadJwtType;
        }
    }
}
