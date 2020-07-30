// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const server = require('../src/server');
const database = require('../src/database');
const User = require('../src/api/v1/user/model');

chai.use(chaiHttp);

const user = {
  firstName: 'testFN',
  lastName: 'testLN',
  email: 'younes.zadi.1997@gmail.com',
  userName: 'cocoUer',
  password: 'dummyPassword'
};

// Our parent block
describe('Users Tests', () => {
  before(async () => {
    try {
      await database.connect();
      await User.deleteMany({});
    } catch (error) {
      console.error(`Database error: ${error}`);
    }
  });

  /*
   * Test the /POST register
   */
  describe('/POST register', () => {
    it('it should return BAD REQUEST', (done) => {
      const wrongUser = {
        ...user,
        email: 'example-email.dz'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(400);
          expect(res.body.message).to.deep.equals(
            'Please enter valid "email" must be a valid email.'
          );
          done();
        });
    });
    it('it should return BAD REQUEST', (done) => {
      const wrongUser = {
        ...user,
        password: '12'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(400);
          expect(res.body.message).to.deep.equals(
            'Please enter valid "password" length must be at least 8 characters long.'
          );
          done();
        });
    });
    it('it should return BAD REQUEST', (done) => {
      const wrongUser = {
        ...user,
        userName: 'younes ZADI'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(400);
          done();
        });
    });
    it('it should return CREATED', (done) => {
      chai
        .request(server)
        .post('/v1/user/register')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(201);
          done();
        });
    });
    it('it should return CONFLICT', (done) => {
      const wrongUser = {
        ...user,
        userName: 'diffUserName'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(409);
          expect(res.body.message).to.deep.equals('Email address already exists.');
          done();
        });
    });
    it('it should return CONFLICT', (done) => {
      const wrongUser = {
        ...user,
        email: 'diffrent.email@email.io'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(409);
          expect(res.body.message).to.deep.equals('Username already exists.');
          done();
        });
    });
  });

  /*
   * Test the /POST login
   */
  describe('/POST login', () => {
    it('it should return CONFLICT', (done) => {
      const loginData = {
        userName: 'unexistantUser',
        password: user.password
      };
      chai
        .request(server)
        .post('/v1/user/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(409);
          expect(res.body.message).to.deep.equals('Credentials did not match');
          done();
        });
    });
    it('it should return CONFLICT', (done) => {
      const loginData = {
        userName: user.userName,
        password: 'fooPasswooord'
      };
      chai
        .request(server)
        .post('/v1/user/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(409);
          expect(res.body.message).to.deep.equals('Credentials did not match');
          done();
        });
    });
    it('it should return NOT_ACCEPTABLE', (done) => {
      const loginData = {
        userName: user.userName,
        password: user.password
      };
      chai
        .request(server)
        .post('/v1/user/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(406);
          expect(res).to.be.an('object');
          expect(res.body.code).to.equals(406);
          expect(res.body.message).to.deep.equals(
            'Your email address is not verified. Please verify your email to continue.'
          );
          done();
        });
    });
    describe('Users Login Tests', () => {
      before(async () => {
        try {
          await database.connect();
          const query = { email: user.email };
          const update = {
            is_verified: true,
            'verify_tokens.email': ''
          };
          await User.findOneAndUpdate(query, update);
        } catch (error) {
          console.error(`Database error: ${error}`);
        }
      });
      it('it should return OK', (done) => {
        const loginData = {
          userName: user.userName,
          password: user.password
        };
        chai
          .request(server)
          .post('/v1/user/login')
          .send(loginData)
          .end((err, res) => {
            console.log(res.body);
            expect(res).to.have.status(200);
            expect(res).to.be.an('object');
            expect(res.body.email).to.be.an('string').to.deep.equals(user.email);
            expect(res.body.userName).to.be.an('string').to.deep.equals(user.userName);
            expect(res.body.firstName).to.be.an('string').to.deep.equals('testFN');
            expect(res.body.lastName).to.be.an('string').to.deep.equals('testLN');
            expect(res.header.authorization).to.be.an('string');
            expect(res.header['x-refresh-token']).to.be.an('string');
            expect(res.header['x-token-expiry-time']).to.be.an('string');
            chai
              .request(server)
              .get('/v1/user/is-logged-in')
              .set('authorization', res.header.authorization)
              .end((error, result) => {
                expect(result).to.have.status(200);
              });
            done();
          });
      });
    });
  });
  describe('/PUT refresh-token', () => {});

  describe('/PUT logout', () => {});

  describe('/POST forgot-password', () => {});

  describe('/PUT reset-password', () => {});

  describe('/PUT change-password', () => {});

  describe('/PUT edit-profile', () => {});
});
