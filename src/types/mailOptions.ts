export interface MailTemplateOptions {
    recipient: string;
    OTP?: string | null;
    passwordToken?: string | null;
    type: "emailVerification" | "resetPassword";
    customerName: string;
}