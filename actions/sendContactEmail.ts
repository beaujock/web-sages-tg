'use server';

import nodemailer from 'nodemailer';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function sendContactEmail(data: ContactFormData) {
  const { name, email, phone, subject, message } = data;

  if (!name || !email || !message) {
    return {
      success: false,
      message: 'Veuillez remplir tous les champs obligatoires.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER,
      subject: `[SAGES Contact] ${subject || 'Nouveau message de contact'}`,
      text: `
Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non renseigné'}

Message:
${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #005f73;">Nouveau Message de Contact - SAGES</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Message :</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Votre message a été envoyé avec succès !',
    };
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return {
      success: false,
      message: "Erreur lors de l'envoi du message. Veuillez réessayer plus tard.",
    };
  }
}