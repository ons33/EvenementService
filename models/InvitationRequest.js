// models/InvitationRequest.js
import mongoose from 'mongoose';

const InvitationRequestSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evenement',
    required: true,
  },
  userId: { type: String, required: true },
  status: { type: String, default: 'Pending' },
});

const InvitationRequest = mongoose.model(
  'InvitationRequest',
  InvitationRequestSchema
);
export default InvitationRequest;
