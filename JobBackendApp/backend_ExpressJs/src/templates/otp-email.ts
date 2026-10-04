/** Escapes user-provided text before it is placed in HTML. */
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Same email as the Spring backend's `Data.getMessageBody`. */
export function otpEmailTemplate(otp: string, name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: #ffffff; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
    .body { padding: 20px; color: #333333; text-align: center; }
    .otp { font-size: 24px; font-weight: bold; color: #4CAF50; margin: 20px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #888888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Your OTP Code</h1></div>
    <div class="body">
      <p>Hello <strong>${escapeHtml(name)}</strong>,</p>
      <p>We have received a request to verify your email address. Your OTP code is:</p>
      <div class="otp">${otp}</div>
      <p>This OTP code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
      <p>Thank you for using our service!</p>
    </div>
    <div class="footer"><p>&copy;${new Date().getFullYear()} JobHook . All rights reserved.</p></div>
  </div>
</body>
</html>`;
}
