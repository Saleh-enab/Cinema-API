export interface MailTemplateOptions {
    recipient: string;
    OTP?: string | null;
    resetPasswordUrl?: string | null;
    type: "emailVerification" | "resetPassword";
    customerName: string;
}