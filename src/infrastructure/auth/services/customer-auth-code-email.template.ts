type CustomerCodeEmail = {
  code: string;
  language: 'ar' | 'en';
  expiresInMinutes: number;
};

type EmailPurpose = 'activation' | 'password-reset';

const copy = {
  ar: {
    brand: 'أُلفة',
    brandLine: 'لكل رحلة مكان',
    codeLabel: 'رمز التحقق الخاص بك',
    expires: (minutes: number) => `صالح لمدة ${minutes} دقائق ويُستخدم مرة واحدة فقط.`,
    securityTitle: 'حافظ على أمان حسابك',
    securityText: 'لا تشارك رمز التحقق مع أي شخص، حتى لو ادّعى أنه من فريق أُلفة.',
    footer: 'أُلفة · رسائل أمان الحساب',
    activation: {
      subject: 'رمز تفعيل حسابك | أُلفة',
      eyebrow: 'مرحبًا بك في أُلفة',
      title: 'أكّد بريدك الإلكتروني',
      intro: 'خطوة واحدة تفصلك عن بداية رحلتك. أدخل الرمز التالي في صفحة تفعيل الحساب.',
      warning: 'إذا لم تنشئ حسابًا في أُلفة، يمكنك تجاهل هذه الرسالة.',
      text: (code: string, minutes: number) =>
        `أكّد بريدك الإلكتروني في أُلفة.\n\nرمز التحقق: ${code}\nصالح لمدة ${minutes} دقائق ويُستخدم مرة واحدة فقط.\n\nلا تشارك الرمز مع أي شخص. إذا لم تنشئ حسابًا، تجاهل هذه الرسالة.`,
    },
    'password-reset': {
      subject: 'رمز استعادة كلمة المرور | أُلفة',
      eyebrow: 'أمان حسابك',
      title: 'استعد الوصول إلى حسابك',
      intro:
        'وصلنا طلب لإعادة تعيين كلمة مرور حسابك. أدخل الرمز التالي في صفحة الاستعادة للمتابعة.',
      warning: 'إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة؛ لن تتغير كلمة مرورك.',
      text: (code: string, minutes: number) =>
        `استعد الوصول إلى حسابك في أُلفة.\n\nرمز التحقق: ${code}\nصالح لمدة ${minutes} دقائق ويُستخدم مرة واحدة فقط.\n\nلا تشارك الرمز مع أي شخص. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.`,
    },
  },
  en: {
    brand: 'ULFA',
    brandLine: 'A place for every journey',
    codeLabel: 'YOUR VERIFICATION CODE',
    expires: (minutes: number) => `Valid for ${minutes} minutes and one use only.`,
    securityTitle: 'Keep your account secure',
    securityText: 'Never share this code with anyone, even if they claim to be from ULFA.',
    footer: 'ULFA · Account security',
    activation: {
      subject: 'Verify your ULFA email',
      eyebrow: 'Welcome to ULFA',
      title: 'Verify your email address',
      intro: 'Your next journey is one step away. Enter this code on the account activation page.',
      warning: 'If you did not create a ULFA account, you can safely ignore this email.',
      text: (code: string, minutes: number) =>
        `Verify your ULFA email address.\n\nVerification code: ${code}\nValid for ${minutes} minutes and one use only.\n\nNever share this code. If you did not create an account, ignore this email.`,
    },
    'password-reset': {
      subject: 'Reset your ULFA password',
      eyebrow: 'Account security',
      title: 'Get back into your account',
      intro:
        'We received a request to reset your password. Enter this code on the recovery page to continue.',
      warning:
        'If you did not request a reset, ignore this email; your password will stay the same.',
      text: (code: string, minutes: number) =>
        `Recover your ULFA account.\n\nVerification code: ${code}\nValid for ${minutes} minutes and one use only.\n\nNever share this code. If you did not request a reset, ignore this email.`,
    },
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

export function buildCustomerAuthCodeEmail(purpose: EmailPurpose, email: CustomerCodeEmail) {
  const language = copy[email.language];
  const message = language[purpose];
  const isArabic = email.language === 'ar';
  const alignment = isArabic ? 'right' : 'left';
  const safeCode = escapeHtml(email.code);

  return {
    subject: message.subject,
    text: message.text(email.code, email.expiresInMinutes),
    html: `<!doctype html>
<html lang="${email.language}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${message.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f2ed;color:#253029;font-family:${isArabic ? 'Tahoma,Arial,Helvetica,sans-serif' : 'Arial,Helvetica,sans-serif'};">
  <div style="display:none!important;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${message.intro}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#f4f2ed;">
    <tr><td align="center" style="padding:30px 14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;background-color:#fffdfa;border:1px solid #e7e1d8;border-radius:20px;overflow:hidden;">
        <tr><td align="${alignment}" dir="${isArabic ? 'rtl' : 'ltr'}" style="padding:30px 36px;background-color:#26342b;color:#ffffff;">
          <div style="font-size:27px;font-weight:700;letter-spacing:1px;line-height:1.3;">${language.brand}</div>
          <div style="margin-top:5px;color:#d8e0d8;font-size:12px;line-height:1.5;">${language.brandLine}</div>
        </td></tr>
        <tr><td align="${alignment}" dir="${isArabic ? 'rtl' : 'ltr'}" style="padding:36px 36px 30px;">
          <div style="color:#b65b45;font-size:12px;font-weight:700;letter-spacing:.6px;line-height:1.5;">${message.eyebrow}</div>
          <h1 style="margin:12px 0 14px;color:#253029;font-size:27px;font-weight:700;line-height:1.35;">${message.title}</h1>
          <p style="margin:0 0 28px;color:#5f6962;font-size:15px;line-height:1.85;">${message.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;border-spacing:0;background-color:#f7f4ee;border:1px solid #e8ded2;border-radius:14px;">
            <tr><td align="center" style="padding:23px 12px 22px;">
              <div style="color:#68716a;font-size:11px;font-weight:700;letter-spacing:.8px;line-height:1.5;">${language.codeLabel}</div>
              <div dir="ltr" style="margin-top:10px;color:#27332a;font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:700;letter-spacing:6px;line-height:1.3;white-space:nowrap;">${safeCode}</div>
              <div style="margin-top:10px;color:#7a827a;font-size:12px;line-height:1.6;">${language.expires(email.expiresInMinutes)}</div>
            </td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-top:24px;border-collapse:collapse;">
            <tr><td style="padding-${isArabic ? 'right' : 'left'}:14px;border-${isArabic ? 'right' : 'left'}:3px solid #b65b45;">
              <div style="color:#334137;font-size:13px;font-weight:700;line-height:1.6;">${language.securityTitle}</div>
              <div style="margin-top:4px;color:#68716a;font-size:13px;line-height:1.7;">${language.securityText}</div>
            </td></tr>
          </table>
          <p style="margin:26px 0 0;color:#7a827a;font-size:13px;line-height:1.7;">${message.warning}</p>
        </td></tr>
        <tr><td align="${alignment}" dir="${isArabic ? 'rtl' : 'ltr'}" style="padding:20px 36px;border-top:1px solid #e9e5dc;background-color:#faf8f3;color:#7a827a;font-size:12px;line-height:1.6;">${language.footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
