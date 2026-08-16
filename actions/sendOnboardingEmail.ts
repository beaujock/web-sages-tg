'use server';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOnboardingEmail(formData: FormData) {
  const schoolFullName = formData.get('schoolFullName') as string;
  const schoolShortName = formData.get('schoolShortName') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  if (!email || !contactName || !schoolFullName) {
    return { success: false, message: 'Veuillez remplir tous les champs obligatoires.' };
  }

  try {
    await transporter.sendMail({
      from: `"SAGES Onboarding" <${process.env.SMTP_USER}>`,
      to: process.env.ONBOARDING_DESTINATION_EMAIL,
      replyTo: email,
      subject: `[SAGES] Nouvelle demande d'intégration: ${schoolFullName}`,
      html: `
        <h2>Nouvelle Demande d'Onboarding SAGES</h2>
        <p><strong>Établissement (Nom complet) :</strong> ${schoolFullName}</p>
        <p><strong>Établissement (Petit nom) :</strong> ${schoolShortName || 'Non spécifié'}</p>
        <hr />
        <p><strong>Nom & Prénom :</strong> ${contactName}</p>
        <p><strong>Email de contact :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Fonction :</strong> ${role || 'Non spécifiée'}</p>
      `,
    });

    return { success: true, message: 'Votre demande a été envoyée avec succès !' };
  } catch (error) {
    console.error('SMTP Email Error:', error);
    return { success: false, message: "Une erreur s'est produite lors de l'envoi du message." };
  }
}