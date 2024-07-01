import express from 'express';
import {
  createParticipation,
  getParticipationsByEvent,
  getParticipationsByUser,
  requestInvitation,
  approveInvitation,
  confirmInvitation,
  getInvitationRequests,
  validateQRCode,
} from '../controllers/participationController.js';

const router = express.Router();

router.post('/', createParticipation);
router.get('/event/:eventId', getParticipationsByEvent);
router.get('/user/:userId', getParticipationsByUser);
router.post('/invitations/request', requestInvitation);
router.post('/invitations/approve', approveInvitation);
router.get('/invitations', getInvitationRequests);
router.get('/confirm-invitation', confirmInvitation);
router.get('/validate-qr-code', validateQRCode);

export default router;
