import { z } from "zod";
import "dotenv/config";

type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;


const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    ACCESS_TOKEN_TTL: z.custom<StringValue>((val) => {
        return /^\d+[smhdwy]$/.test(val as string);
    }),
    REFRESH_TOKEN_TTL: z.custom<StringValue>((val) => {
        return /^\d+[smhdwy]$/.test(val as string);
    }),
    ACCESS_TOKEN_PUBLIC_KEY: z.string().startsWith("-----BEGIN PUBLIC KEY-----"),
    ACCESS_TOKEN_PRIVATE_KEY: z.string().startsWith("-----BEGIN RSA PRIVATE KEY-----"),
    REFRESH_TOKEN_PUBLIC_KEY: z.string().startsWith("-----BEGIN PUBLIC KEY-----"),
    REFRESH_TOKEN_PRIVATE_KEY: z.string().startsWith("-----BEGIN RSA PRIVATE KEY-----")
});

const env = envSchema.parse(process.env);

export default env;