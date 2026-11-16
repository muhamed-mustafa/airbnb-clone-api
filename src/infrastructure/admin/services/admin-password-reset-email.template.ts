import type { AdminPasswordResetEmail } from '@application/admin/services/admin-password-reset-email-sender';

const copy = {
  en: {
    direction: 'ltr',
    alignment: 'left',
    eyebrow: 'ACCOUNT SECURITY',
    title: 'Reset your admin password',
    intro: 'Use the verification code below to continue. It can only be used once.',
    codeLabel: 'YOUR VERIFICATION CODE',
    expires: (minutes: number) => `This code expires in ${minutes} minutes.`,
    warning: 'If you did not request this change, you can safely ignore this email.',
    footer: 'STAYS Admin · Account security',
    text: (code: string, minutes: number) =>
      `Your STAYS admin verification code is ${code}.\n\nIt expires in ${minutes} minutes and can only be used once. If you did not request this change, ignore this email.`,
  },
  ar: {
    direction: 'rtl',
    alignment: 'right',
    eyebrow: 'أمان الحساب',
    title: 'إعادة تعيين كلمة مرور الإدارة',
    intro: 'استخدم رمز التحقق التالي للمتابعة. يمكن استخدامه مرة واحدة فقط.',
    codeLabel: 'رمز التحقق',
    expires: (minutes: number) => `تنتهي صلاحية الرمز خلال ${minutes} دقائق.`,
    warning: 'إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان.',
    footer: 'STAYS للإدارة · أمان الحساب',
    text: (code: string, minutes: number) =>
      `رمز التحقق لحساب إدارة STAYS هو ${code}.\n\nتنتهي صلاحيته خلال ${minutes} دقائق، ويمكن استخدامه مرة واحدة فقط. إذا لم تطلب إعادة التعيين، فتجاهل هذه الرسالة.`,
  },
} as const;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export function buildAdminPasswordResetEmail(email: AdminPasswordResetEmail) {
  const languageCopy = copy[email.language];
  const safeCode = escapeHtml(email.code);
  const direction = languageCopy.direction;
  const alignment = languageCopy.alignment;

  return {
    subject:
      email.language === 'ar'
        ? 'رمز إعادة تعيين كلمة مرور STAYS'
        : 'Your STAYS admin verification code',
    text: languageCopy.text(safeCode, email.expiresInMinutes),
    html: `<!doctype html>
<html lang="${email.language}" dir="${direction}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#252b27;">
    <main style="max-width:520px;margin:0 auto;line-height:1.7;text-align:${alignment};">
      <p style="margin:0 0 8px;color:#68716b;font-size:13px;font-weight:700;">STAYS ADMIN · ${languageCopy.eyebrow}</p>
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.35;">${languageCopy.title}</h1>
      <p style="margin:0 0 16px;">${languageCopy.intro}</p>
      <p style="margin:0 0 4px;color:#68716b;font-size:12px;">${languageCopy.codeLabel}</p>
      <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:#b8503e;"><bdi dir="ltr">${safeCode}</bdi></p>
      <p style="margin:0 0 18px;">${languageCopy.expires(email.expiresInMinutes)}</p>
      <hr style="border:0;border-top:1px solid #e8e3da;margin:0 0 14px;">
      <p style="margin:0;color:#68716b;font-size:13px;">${languageCopy.warning}</p>
      <p style="margin:20px 0 0;color:#8a918c;font-size:11px;">${languageCopy.footer}</p>
    </main>
  </body>
</html>`,
  };
}
