/* -------------------------- WELCOME EMAIL TEMPLATE -------------------------- */
export const buildWelcomeEmailTemplate = (userName: string): string => {
  if (!userName || typeof userName !== "string") {
    throw new Error("Invalid template data");
  }

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 32px;">
        <h2 style="color: #111827;">Welcome, ${userName} 👋</h2>

        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          We're excited to have you onboard. Your account has been successfully created.
        </p>

        <p style="color: #374151; font-size: 16px;">
          You can now start chatting and exploring the app.
        </p>

        <hr style="margin: 32px 0;" />

        <p style="color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} Chat App. All rights reserved.
        </p>
      </div>
    </div>
  `;
};
