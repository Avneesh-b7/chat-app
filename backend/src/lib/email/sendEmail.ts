import { getResendClient } from "./resendClient.js";
import { buildWelcomeEmailTemplate } from "./welcomeEmail.js";

/* ----------------------------- TYPES ----------------------------- */
type SendEmailParams = {
  to: string;
  subject: string;
  userName: string;
};

type SendEmailResult = {
  success: boolean;
  messageId: string;
};

/* -------------------------- SEND EMAIL -------------------------- */
export const sendEmail = async (
  params: SendEmailParams
): Promise<SendEmailResult> => {
  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[EMAIL] sendEmail invoked", {
    to: params?.to,
    subject: params?.subject,
  });

  const { to, subject, userName } = params;

  /* ----------------------------- VALIDATION ----------------------------- */
  // if (!to || typeof to !== "string") {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to || typeof to !== "string" || !emailRegex.test(to)) {
    console.warn("[EMAIL] Validation failed: invalid recipient", { to });
    throw new Error("Invalid recipient email");
  }

  if (!subject || typeof subject !== "string") {
    console.warn("[EMAIL] Validation failed: invalid subject", { subject });
    throw new Error("Invalid email subject");
  }

  if (!userName || typeof userName !== "string") {
    console.warn("[EMAIL] Validation failed: invalid userName", { userName });
    throw new Error("Invalid email template data");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    console.error("[EMAIL] Missing RESEND_FROM_EMAIL");
    throw new Error("Email sender is not configured");
  }

  const resend = getResendClient();
  const html = buildWelcomeEmailTemplate(userName);

  /* ----------------------------- SEND ----------------------------- */
  try {
    console.info("[EMAIL] Sending email via Resend", { to });

    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (response.error || !response.data) {
      console.error("[EMAIL] Resend API error", {
        error: response.error,
      });
      throw new Error("Email provider rejected the request");
    }

    console.info("[EMAIL] Email sent successfully", {
      messageId: response.data.id,
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error: any) {
    console.error("[EMAIL] Failed to send email", {
      message: error?.message,
      stack: error?.stack,
    });

    throw new Error("Failed to send email");
  }
};
