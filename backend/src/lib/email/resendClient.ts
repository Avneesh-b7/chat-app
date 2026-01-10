/*
#TASK 
1. help me complete this resend function 
2. i want you to write a fucntion that sends email (bolier plate code attatched)
3. make sure that the email looks professional and cool
4. ensure best practises in the codebase
5. guide me how should i do it , should i create a nre file / a .tsx file or what 


for context here is the resend docs : https://resend.com/docs/send-with-nodejs
*/

import { Resend } from "resend";

let resendClient: Resend | undefined;

/* -------------------------- GET RESEND CLIENT -------------------------- */
export const getResendClient = (): Resend => {
  if (resendClient) {
    return resendClient;
  }

  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[EMAIL] Initializing Resend client");

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || typeof apiKey !== "string") {
    console.error("[EMAIL] Missing RESEND_API_KEY");
    throw new Error("Email service configuration error");
  }

  // return new Resend(apiKey);

  resendClient = new Resend(apiKey);
  return resendClient;
};
