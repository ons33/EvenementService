import cloudinary from 'cloudinary';
import Evenement from '../models/Evenement.js';

// Configuration de Cloudinary
cloudinary.v2.config({
  cloud_name: 'dpk9mpjsd',
  api_key: '348193888992711',
  api_secret: 'qefN7t3DU47Kdpnhi9i8G56XHM0',
});
// creer Evenement
export const creerEvenement = async (req, res) => {
  try {
    const {
      intitule,
      categorieEvenement,
      description,
      dateEvenement,
      lieuEvenement,
      typeEvenement,
      nomOrganisateur,
      capaciteMax,
      modaliteInscription,
      userId,
    } = req.body;

    // Télécharger l'image sur Cloudinary
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const parsedLieuEvenement = JSON.parse(lieuEvenement);

    const newEvenement = new Evenement({
      intitule,
      categorieEvenement,
      image: imageUrl,
      description,
      dateEvenement,
      lieuEvenement: {
        type: 'Point',
        coordinates: [
          parsedLieuEvenement.coordinates[0],
          parsedLieuEvenement.coordinates[1],
        ], // longitude, latitude
      },
      typeEvenement,
      nomOrganisateur,
      capaciteMax,
      modaliteInscription,
      userId,
    });

    await newEvenement.save();
    res.status(201).json(newEvenement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
// obtenir Tout Evenements
export const obtenirTousEvenements = async (req, res) => {
  try {
    const evenements = await Evenement.find();
    res.json(evenements);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
// obtenir Evenement Par Id
export const obtenirEvenementParId = async (req, res) => {
  try {
    const evenementId = req.params.id;
    console.log("evenementId", evenementId);
    const evenement = await Evenement.findById(evenementId);
    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(evenement);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
// obtenir Evenements Par Email
export const obtenirEvenementsParEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const evenements = await Evenement.find({ userId: email });
    res.json(evenements);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
// mettre A Jour Evenement
export const mettreAJourEvenement = async (req, res) => {
  try {
    const evenementId = req.params.id;
    const updatedEvenement = await Evenement.findByIdAndUpdate(
      evenementId,
      req.body,
      { new: true }
    );
    if (!updatedEvenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(updatedEvenement);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
// supprimer Evenement
export const supprimerEvenement = async (req, res) => {
  try {
    const evenementId = req.params.id;
    const deletedEvenement = await Evenement.findByIdAndDelete(evenementId);
    if (!deletedEvenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
