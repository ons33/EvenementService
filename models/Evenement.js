import mongoose from 'mongoose';

const EvenementSchema = new mongoose.Schema({
  intitule: { type: String, required: true },
  categorieEvenement: { type: String, required: true },
  image: { type: String, required: false },

  description: { type: String, required: true },
  dateEvenement: { type: Date, required: true },
  lieuEvenement: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  typeEvenement: { type: String, required: true },
  nomOrganisateur: { type: String, required: true },
  nombreParticipant: { type: Number, default: 0 },
  capaciteMax: { type: Number, required: true },
  modaliteInscription: {
    type: String,
    enum: ['Gratuit', 'Payant', 'Sur invitation'],
    required: true,
  },
  userId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Evenement = mongoose.model('Evenement', EvenementSchema);

export default Evenement;
