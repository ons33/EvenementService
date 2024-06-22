import mongoose from 'mongoose';

const ParticipationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evenement', required: true },
  userId: { type: String , required: true },
  participationDate: { type: Date, default: Date.now }
});

const Participation = mongoose.model('Participation', ParticipationSchema);

export default Participation;
