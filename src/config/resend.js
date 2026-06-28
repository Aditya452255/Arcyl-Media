import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "temp_key");

export default resend;
