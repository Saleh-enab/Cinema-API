import { MailTemplateOptions } from "../types/mailOptions";
import { CustomError } from "../utils/customError";
import { getEmailTemplate } from "../utils/emailTemplate";
import nodemailer from 'nodemailer';
import env from "../env";
import { logger } from "./logger";

export const sendMail = async ({ recipient, OTP, passwordToken, type, customerName }: MailTemplateOptions) => {
    let templateName: string;

    switch (type) {
        case "emailVerification":
            templateName = "emailVerification";
            break;
        case "resetPassword":
            templateName = "resetPassword";
            break;
        default:
            throw new CustomError(500, "Unknown Email type", "EMAIL ERROR");
    }

    const emailVariables = new Map<string, string>([
        ["customerName", customerName || ""],
        ["OTP", OTP || ""],
        ["passwordToken", passwordToken || ""],
    ]);

    if (templateName === "emailVerification" && OTP === "") {
        throw new CustomError(500, "OTP not provided", "EMAIL VERIFICATION ERROR")
    }

    const emailBody = getEmailTemplate(templateName, emailVariables)

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 578,
        secure: false,
        auth: {
            user: env.EMAIL_APP_USER,
            pass: env.EMAIL_APP_PASSWORD,
        },
    })

    const mailOptions = {
        from: {
            name: "Saleh Enab",
            address: "salehenab850@gmail.com"
        },
        bcc: recipient,
        subject: "Email Verification",
        html: emailBody,
    }

    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            throw new CustomError(500, err.message, "SENDING EMAIL ERROR")
        }
        logger.info("Email has been sent " + info.accepted)
    })
};