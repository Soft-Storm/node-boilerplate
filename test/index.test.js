// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const server = require('../src/server');

chai.use(chaiHttp);

// Our parent block
describe('General API Health', () => {
  /*
   * Test the /GET Check OK status
   */

  describe('/GET Check OK status', () => {
    it('it should return OK', (done) => {
      chai
        .request(server)
        .get('/v1/status')
        .end((err, res) => {
          expect(res).to.have.status(300);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(300);
          expect(res.body.message).to.deep.equals('OK');
          done();
        });
    });
  });

  /*
   * Test the /GET Not found
   */
  describe('/GET Not found', () => {
    it('it should return not found', (done) => {
      chai
        .request(server)
        .get('/foo')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(404);
          expect(res.body.message).to.deep.equals('Not Found');
          done();
        });
    });
  });
});
