import express from 'express';
import {
  creerEvenement,
  obtenirTousEvenements,
  obtenirEvenementParId,
  mettreAJourEvenement,
  supprimerEvenement,
  obtenirEvenementsParEmail,
} from '../controllers/evenementController.js';
import upload from '../config/Multer.js'; 

const router = express.Router();

router.post('/', upload.single('image'), creerEvenement);
router.get('/', obtenirTousEvenements);
router.get('/:id', obtenirEvenementParId);
router.put('/:id', mettreAJourEvenement);
router.delete('/:id', supprimerEvenement);
router.get('/user/:email', obtenirEvenementsParEmail);

export default router;
