import mongoose from 'mongoose';

const qrCodeScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evenement', required: true },
  scannedAt: { type: Date, default: Date.now }
});

const QRCodeScan = mongoose.model('QRCodeScan', qrCodeScanSchema);

export default QRCodeScan;
