import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import {app} from '../app.js'; // Ensure this path is correct and `app.js` exports `app`

const chai = use(chaiHttp);

describe('Evenement API', () => {
  it('should create a new event', (done) => {
    chai.request(app)
      .post('/api/evenements')
      .set('Content-Type', 'application/json')
      .send({
        intitule: 'Test Event',
        categorieEvenement: 'Category',
        image: 'http://example.com/image.jpg', // Provide a valid image URL
        description: 'Description',
        dateEvenement: '2023-07-01',
        lieuEvenement: JSON.stringify({ coordinates: [0, 0] }),
        typeEvenement: 'Type',
        nomOrganisateur: 'Organizer',
        capaciteMax: 100,
        modaliteInscription: 'Gratuit', // Provide a valid enum value
        userId: 'user@test.com'
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // Add more tests as needed
});
