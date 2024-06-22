import mongoose from 'mongoose';

import Participation from '../models/Participation.js';
import Evenement from '../models/Evenement.js';
import nodemailer from 'nodemailer';
import InvitationRequest from '../models/InvitationRequest.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path'; // Add this line to import the path module
import QRCodeScan from '../models/QRCodeScan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurer le transporteur SMTP pour l'envoi d'e-mails (utilisez vos propres informations SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ons.benamorr@gmail.com',
    pass: 'balj ctus kuar ivbm',
  },
});

const sendEmail = (to, subject, text, qrCodeUrl) => {
  const mailOptions = {
    from: 'ons.benamorr@gmail.com',
    to: to,
    subject: subject,
    html: `
      <p>${text}</p>
      <p><img src="${qrCodeUrl}" alt="QR Code" /></p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Function to generate QR code
const generateQRCode = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input for QR code generation');
    }
    const qrCodeDataURL = await QRCode.toDataURL(text);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Function to create PDF with QR code
const createPDFWithQRCode = async (qrCodeDataURL, filePath, data) => {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Set background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F7F7F7');

   
   
   

    // Add "Scan Me" label
    doc.moveDown();
    doc.rect(doc.x, doc.y, 500, 30).fill('#cc143c');
    doc.fillColor('#ffffff').fontSize(16).text('SCAN ME', doc.x, doc.y + 5, {
      align: 'center',
      width: 500,
      margin:30

    });

    // Add QR code image
    const qrCodeSize = 500;
    const qrCodeX = doc.x;
    const qrCodeY = doc.y + 30; // Position QR code below "Scan Me" label
    doc.image(qrCodeDataURL, qrCodeX, qrCodeY, { fit: [qrCodeSize, qrCodeSize] });

    doc.moveDown();
    doc.text('Equipe Espritook;', {
      align: 'right'
    });
    doc.end();

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};



const qrCodeText = 'https://example.com/event';
const pdfFilePath = path.join(__dirname, 'invitations', 'event_invitation.pdf');

QRCode.toDataURL(qrCodeText)
  .then(qrCodeDataURL => createPDFWithQRCode(qrCodeDataURL, pdfFilePath))
  .then(() => console.log('PDF generated successfully'))
  .catch(error => console.error('Error generating PDF:', error));

// Function to send email with QR code PDF
const sendEmailWithPDF = (to, subject, text, pdfFilePath) => {
  const mailOptions = {
    from: 'ons.benamorr@gmail.com',
    to: to,
    subject: subject,
    html: text,
    attachments: [
      {
        filename: 'event_ticket.pdf',
        path: pdfFilePath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Récupérer toutes les participations pour un événement
export const getParticipationsByEvent = async (req, res) => {
  try {
    const participations = await Participation.find({ eventId: req.params.eventId }).populate('userId', 'name email');
    res.json(participations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Récupérer toutes les participations d'un utilisateur
export const getParticipationsByUser = async (req, res) => {
  try {
    const participations = await Participation.find({ userId: req.params.userId }).populate('eventId', 'title date');
    res.json(participations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Créer une nouvelle participation
export const createParticipation = async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    const event = await Evenement.findById(eventId);
console.log(event.modaliteInscription,"ggggggggggg");
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.nombreParticipant >= event.capaciteMax) {
      return res.status(400).json({ message: 'La capacité maximale de l\'événement a été atteinte' });
    }

    if (event.modaliteInscription === 'Gratuit') {
      const newParticipation = new Participation({ eventId, userId });
      await newParticipation.save();
      event.nombreParticipant += 1;

      event.currentParticipants += 1;
      await event.save();

      // Send confirmation email
      sendEmail(userId, 'Confirmation de participation', `Vous vous êtes inscrit avec succès à l'événement: ${event.intitule}`);

      res.status(201).json(newParticipation);
    } else if (event.modaliteInscription === 'Sur invitation') {
      const newRequest = new InvitationRequest({ eventId, userId });
      await newRequest.save();

      res.status(200).json({ message: 'Invitation request sent. Please wait for approval.' });
    } else if (event.modaliteInscription === 'Payant') {
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
      const newParticipation = new Participation({ eventId, userId });
      await newParticipation.save();
      event.nombreParticipant += 1;

      event.currentParticipants += 1;
      await event.save();
      const reservationLink = `http://your-app.com/complete-payment?eventId=${eventId}&userId=${userId}`;
      res.status(200).json({ message: 'Please complete your payment.', reservationLink });}
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Gérer les demandes d'invitation
export const requestInvitation = async (req, res) => {
  try {
    const { eventId, userId } = req.body;
console.log(eventId,userId, "hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    const event = await Evenement.findById(eventId);
    console.log("eventtttt",event);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.modaliteInscription !== 'Sur invitation') {
      return res.status(400).json({ message: 'Cet événement n\'est pas sur invitation.' });
    }

    const newRequest = new InvitationRequest({ eventId, userId});
    console.log("newRequest",newRequest);
    await newRequest.save();

    res.status(200).json({ message: 'Invitation request sent. Please wait for approval.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// QR Code Scan model
const qrCodeScanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  scannedAt: { type: Date, default: Date.now }
});

export const validateQRCode = async (req, res) => {
  try {
    const { email } = req.query;

    const existingScan = await QRCodeScan.findOne({ email });
    if (existingScan) {
      return res.status(400).json({ message: 'QR code has already been used.' });
    }

    const newScan = new QRCodeScan({ email });
    await newScan.save();

    res.status(200).json({ message: 'QR code validated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Approuver une demande d'invitation
export const approveInvitation = async (req, res) => {
  try {
    const { requestId } = req.body;

    const invitationRequest = await InvitationRequest.findById(requestId).populate('eventId');
    if (!invitationRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    invitationRequest.status = 'Approved';
    await invitationRequest.save();

    if (!invitationRequest.userId) {
      throw new Error('User email not found');
    }

    // Create a new participation entry
    const newParticipation = new Participation({
      eventId: invitationRequest.eventId._id,
      userId: invitationRequest.userId,
    });
    await newParticipation.save();

    // Update the event's currentParticipants count
    const event = await Evenement.findById(invitationRequest.eventId._id);
    event.nombreParticipant += 1;

    event.currentParticipants += 1;
    await event.save();

    const qrCodeDataURL = await generateQRCode(invitationRequest.userId);

    // Create PDF with QR code
    const pdfFilePath = join(__dirname, 'invitations', `ticket_${requestId}.pdf`);
    await createPDFWithQRCode(qrCodeDataURL, pdfFilePath);

    const emailContent = `Bonjour,<br><br>
    Vous êtes invité à l'événement : ${invitationRequest.eventId.intitule}.<br><br> 
    Veuillez trouver ci-joint votre billet d'invitation avec un <strong>QR code</strong> pour l'événement.<br><br> 
    Cordialement,<br> 
    L'équipe Espritook`;
    
    // Send email with PDF attachment
    sendEmailWithPDF(invitationRequest.userId, 'Invitation to Event', emailContent, pdfFilePath);

    res.status(200).json({ message: 'Invitation approved and email sent.' });
  } catch (error) {
    console.error('Error approving invitation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};


// Confirmer une invitation
export const confirmInvitation = async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    const event = await Evenement.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.nombreParticipant >= event.capaciteMax) {
      return res.status(400).json({ message: 'La capacité maximale de l\'événement a été atteinte' });
    }

    const newParticipation = new Participation({ eventId, userId });
    await newParticipation.save();
    event.nombreParticipant += 1;

    event.currentParticipants += 1;
    await event.save();

    res.status(201).json(newParticipation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Récupérer toutes les demandes d'invitation pour un événement
export const getInvitationRequests = async (req, res) => {
  try {
    console.log(req.query.eventId);
    const requests = await InvitationRequest.find({ eventId: req.query.eventId });
    console.log("requests",requests);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
