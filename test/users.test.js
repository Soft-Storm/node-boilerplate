// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const sinon = require('sinon');
const httpStatus = require('http-status');
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

let resHeader;

//* OUR PARENT BLOCK
describe('Users Tests', () => {
  before(async () => {
    try {
      await database.connect();
      await User.deleteMany({});
    } catch (error) {
      console.error(`Database error: ${error}`);
    }
  });
  after(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error(`Database error: ${error}`);
    }
  });

  /*
   * Test the /POST register
   */
  describe('/POST register', () => {
    it('it should return BAD_REQUEST', (done) => {
      const wrongUser = {
        ...user,
        email: 'example-email.dz'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.BAD_REQUEST);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.BAD_REQUEST);
          expect(res.body.message).to.be.an('array');
          expect(res.body.message).to.have.length(1);
          expect(res.body.message[0]).to.contain.keys('email');
          expect(res.body.message[0].email).to.deep.equals(
            '"email" must be a valid email'
          );
          done();
        });
    });
    it('it should return BAD_REQUEST', (done) => {
      const wrongUser = {
        ...user,
        password: '12'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.BAD_REQUEST);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.BAD_REQUEST);
          expect(res.body.message).to.be.an('array');
          expect(res.body.message).to.have.length(1);
          expect(res.body.message[0]).to.contain.keys('password');
          expect(res.body.message[0].password).to.deep.equals(
            '"password" length must be at least 8 characters long'
          );
          done();
        });
    });
    it('it should return BAD_REQUEST', (done) => {
      const wrongUser = {
        ...user,
        userName: 'younes ZADI'
      };
      chai
        .request(server)
        .post('/v1/user/register')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.BAD_REQUEST);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.BAD_REQUEST);
          expect(res.body.message).to.be.an('array');
          expect(res.body.message).to.have.length(1);
          expect(res.body.message[0]).to.contain.keys('userName');
          done();
        });
    });
    it('it should return CREATED', (done) => {
      chai
        .request(server)
        .post('/v1/user/register')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CREATED);
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
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals('Email address already exists');
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
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals('Username already exists');
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
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
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
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
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
          expect(res).to.have.status(httpStatus.NOT_ACCEPTABLE);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.NOT_ACCEPTABLE);
          expect(res.body.message).to.deep.equals(
            'Your email address is not verified. Please verify your email to continue'
          );
          done();
        });
    });
  });

  /*
   * Test the /GET email-verification
   */
  describe('Email Verification Tests', () => {
    let usr;

    before(async () => {
      try {
        usr = await User.findOne({ email: user.email }, { _id: 1, verify_tokens: 1 });
      } catch (error) {
        console.error(`Database error: ${error}`);
      }
    });
    it('it should return UNAUTHORIZED', (done) => {
      chai
        .request(server)
        .get(`/v1/user/email-verification/${usr.verify_tokens.email}foo`)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.UNAUTHORIZED);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.deep.equals('Not an authorized user');
          done();
        });
    });
    it('it should return NO_CONTENT', (done) => {
      chai
        .request(server)
        .get(`/v1/user/email-verification/${usr.verify_tokens.email}`)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.NO_CONTENT);
          const loginData = {
            userName: user.userName,
            password: user.password
          };
          chai
            .request(server)
            .post('/v1/user/login')
            .send(loginData)
            .end((error, result) => {
              resHeader = { ...result.header };

              expect(result).to.have.status(httpStatus.OK);
              expect(result.body).to.be.an('object');
              expect(result.body).to.contain.keys(
                'email',
                'userName',
                'firstName',
                'lastName'
              );
              expect(result.body.email).to.be.an('string').to.deep.equals(user.email);
              expect(result.body.userName)
                .to.be.an('string')
                .to.deep.equals(user.userName);
              expect(result.body.firstName).to.be.an('string').to.deep.equals('testFN');
              expect(result.body.lastName).to.be.an('string').to.deep.equals('testLN');
              expect(result.header).to.be.an('object');
              expect(result.header).to.contain.keys(
                'authorization',
                'x-refresh-token',
                'x-access-expiry-time',
                'x-refresh-expiry-time'
              );
              expect(result.header.authorization).to.be.an('string');
              expect(result.header['x-refresh-token']).to.be.an('string');
              expect(result.header['x-access-expiry-time']).to.be.an('string');
              expect(result.header['x-refresh-expiry-time']).to.be.an('string');
              done();
            });
        });
    });
  });

  /*
   * Test the /GET is-logged-in
   */
  describe('/GET is-logged-in', () => {
    it('it should return UNAUTHORIZED', (done) => {
      chai
        .request(server)
        .get('/v1/user/is-logged-in')
        .set('authorization', `${resHeader.authorization}foo`)
        .end((error, res) => {
          expect(res).to.have.status(httpStatus.UNAUTHORIZED);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.deep.equals('Unauthorized');
          done();
        });
    });
    it('it should return OK', (done) => {
      chai
        .request(server)
        .get('/v1/user/is-logged-in')
        .set('authorization', resHeader.authorization)
        .end((error, result) => {
          expect(result).to.have.status(httpStatus.OK);
          done();
        });
    });
  });

  /*
   * Test the /PUT refresh-token
   */
  describe('/PUT refresh-token', () => {
    let clock;
    describe('/PUT refresh-token : access_token', () => {
      before((done) => {
        clock = sinon.useFakeTimers({
          now: (parseFloat(resHeader['x-access-expiry-time']) + 1) * 1000,
          shouldAdvanceTime: true
        });
        done();
      });
      after((done) => {
        clock.restore();
        done();
      });
      it('it should return UNAUTHORIZED', (done) => {
        chai
          .request(server)
          .get('/v1/user/is-logged-in')
          .set('authorization', resHeader.authorization)
          .end((error, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED);
            expect(res.body).to.be.an('object');
            expect(res.body).to.contain.keys('code', 'message');
            expect(res.body.code).to.equals(httpStatus.UNAUTHORIZED);
            expect(res.body.message).to.deep.equals('Access token expired');
            done();
          });
      });
      it('it should return CONFLICT', (done) => {
        chai
          .request(server)
          .put('/v1/user/refresh-token')
          .set('authorization', resHeader.authorization)
          .send({ refreshToken: `${resHeader['x-refresh-token']}foo` })
          .end((error, res) => {
            expect(res).to.have.status(httpStatus.CONFLICT);
            expect(res.body).to.be.an('object');
            expect(res.body).to.contain.keys('code', 'message');
            expect(res.body.code).to.equals(httpStatus.CONFLICT);
            expect(res.body.message).to.deep.equals('Refresh token did not match');
            done();
          });
      });
      it('it should return NO_CONTENT', (done) => {
        chai
          .request(server)
          .put('/v1/user/refresh-token')
          .set('authorization', resHeader.authorization)
          .send({ refreshToken: resHeader['x-refresh-token'] })
          .end((err, res) => {
            resHeader = { ...res.header };

            expect(res).to.have.status(httpStatus.NO_CONTENT);
            expect(res.header).to.be.an('object');
            expect(res.header).to.contain.keys(
              'authorization',
              'x-refresh-token',
              'x-access-expiry-time',
              'x-refresh-expiry-time'
            );
            expect(res.header.authorization).to.be.an('string');
            expect(res.header['x-refresh-token']).to.be.an('string');
            expect(res.header['x-access-expiry-time']).to.be.an('string');
            expect(res.header['x-refresh-expiry-time']).to.be.an('string');
            chai
              .request(server)
              .get('/v1/user/is-logged-in')
              .set('authorization', resHeader.authorization)
              .end((error, result) => {
                expect(result).to.have.status(httpStatus.OK);
                done();
              });
          });
      });
    });
    describe('/PUT refresh-token : refresh_token', () => {
      before((done) => {
        clock = sinon.useFakeTimers({
          now: (parseFloat(resHeader['x-refresh-expiry-time']) + 1) * 1000,
          shouldAdvanceTime: true
        });
        done();
      });
      after((done) => {
        clock.restore();
        done();
      });
      it('it should return UNAUTHORIZED', (done) => {
        chai
          .request(server)
          .put('/v1/user/refresh-token')
          .set('authorization', resHeader.authorization)
          .send({ refreshToken: resHeader['x-refresh-token'] })
          .end((error, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED);
            expect(res.body).to.be.an('object');
            expect(res.body).to.contain.keys('code', 'message');
            expect(res.body.code).to.equals(httpStatus.UNAUTHORIZED);
            expect(res.body.message).to.deep.equals('Refresh token expired');
            done();
          });
      });
    });
  });

  /*
   * Test the /PUT logout
   */
  describe('/PUT logout', () => {
    it('it should return CONFLICT', (done) => {
      chai
        .request(server)
        .put('/v1/user/logout')
        .set('authorization', resHeader.authorization)
        .send({ refreshToken: `${resHeader['x-refresh-token']}foo` })
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals('Refresh token did not match');
          done();
        });
    });
    it('it should return NO_CONTENT', (done) => {
      chai
        .request(server)
        .put('/v1/user/logout')
        .set('authorization', resHeader.authorization)
        .send({ refreshToken: resHeader['x-refresh-token'] })
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.NO_CONTENT);
          chai
            .request(server)
            .get('/v1/user/is-logged-in')
            .set('authorization', resHeader.authorization)
            .end((error, result) => {
              expect(result).to.have.status(httpStatus.UNAUTHORIZED);
              done();
            });
        });
    });
  });

  /*
   * Test the /POST forgot-password
   */
  describe('/POST forgot-password', () => {
    it('it should return BAD_REQUEST', (done) => {
      const wrongUser = {
        email: 'wrong@email.com'
      };
      chai
        .request(server)
        .post('/v1/user/forgot-password')
        .send(wrongUser)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.BAD_REQUEST);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.BAD_REQUEST);
          expect(res.body.message).to.deep.equals(
            'Please enter your registered email address'
          );
          done();
        });
    });
    it('it should return NO_CONTENT', (done) => {
      const data = {
        email: user.email
      };
      chai
        .request(server)
        .post('/v1/user/forgot-password')
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.NO_CONTENT);
          done();
        });
    });
  });

  /*
   * Test the /PUT reset-password
   */
  describe('/PUT reset-password', () => {
    let usr;
    before(async () => {
      try {
        usr = await User.findOne({ email: user.email }, { _id: 1, verify_tokens: 1 });
      } catch (error) {
        console.error(`Database error: ${error}`);
      }
    });
    it('it should return UNAUTHORIZED', (done) => {
      const data = { password: user.password };
      chai
        .request(server)
        .put(`/v1/user/reset-password/${usr.verify_tokens.reset_password}foo`)
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.UNAUTHORIZED);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.deep.equals('Not an authorized user');
          done();
        });
    });
    it('it should return CONFLICT', (done) => {
      const data = { password: user.password };
      chai
        .request(server)
        .put(`/v1/user/reset-password/${usr.verify_tokens.reset_password}`)
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals(
            'New password can not same as old password'
          );
          done();
        });
    });
    it('it should return NO_CONTENT', (done) => {
      user.newPassword = 'newDummyPass';

      chai
        .request(server)
        .put(`/v1/user/reset-password/${usr.verify_tokens.reset_password}`)
        .send({ password: user.newPassword })
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.NO_CONTENT);
          const loginData = {
            userName: user.userName,
            password: user.newPassword
          };
          chai
            .request(server)
            .post('/v1/user/login')
            .send(loginData)
            .end((error, result) => {
              resHeader = { ...result.header };

              expect(result).to.have.status(httpStatus.OK);
              expect(result.body).to.be.an('object');
              expect(result.body).to.contain.keys(
                'email',
                'userName',
                'firstName',
                'lastName'
              );
              expect(result.body.email).to.be.an('string').to.deep.equals(user.email);
              expect(result.body.userName)
                .to.be.an('string')
                .to.deep.equals(user.userName);
              expect(result.body.firstName).to.be.an('string').to.deep.equals('testFN');
              expect(result.body.lastName).to.be.an('string').to.deep.equals('testLN');
              expect(result.header).to.be.an('object');
              expect(result.header).to.contain.keys(
                'authorization',
                'x-refresh-token',
                'x-access-expiry-time',
                'x-refresh-expiry-time'
              );
              expect(result.header.authorization).to.be.an('string');
              expect(result.header['x-refresh-token']).to.be.an('string');
              expect(result.header['x-access-expiry-time']).to.be.an('string');
              expect(result.header['x-refresh-expiry-time']).to.be.an('string');
              done();
            });
        });
    });
  });

  /*
   * Test the /PUT change-password
   */
  describe('/PUT reset-password', () => {
    it('it should return CONFLICT', (done) => {
      const wrongData = { oldPassword: 'incorrectPass', password: 'newDummyPass2' };
      chai
        .request(server)
        .put('/v1/user/change-password')
        .set('authorization', resHeader.authorization)
        .send(wrongData)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals('Old password does not matched');
          done();
        });
    });
    it('it should return CONFLICT', (done) => {
      const wrongData = { oldPassword: user.newPassword, password: user.newPassword };
      chai
        .request(server)
        .put('/v1/user/change-password')
        .set('authorization', resHeader.authorization)
        .send(wrongData)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CONFLICT);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.CONFLICT);
          expect(res.body.message).to.deep.equals(
            'New password can not same as old password'
          );
          done();
        });
    });
    it('it should return NO_CONTENT', (done) => {
      user.newPassword2 = 'dummyPassword2';
      const data = { oldPassword: user.newPassword, password: user.newPassword2 };
      chai
        .request(server)
        .put('/v1/user/change-password')
        .set('authorization', resHeader.authorization)
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.NO_CONTENT);
          done();
        });
    });
  });

  /*
   * Test the /PUT edit-profile
   */
  describe('/PUT edit-profile', () => {
    it('it should return NO_CONTENT', (done) => {
      user.firstName2 = 'firstName2';
      user.lastName2 = 'lastName2';

      const data = { firstName: user.firstName2, lastName: user.lastName2 };
      chai
        .request(server)
        .put('/v1/user/edit-profile')
        .set('authorization', resHeader.authorization)
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.OK);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('firstName', 'lastName');
          expect(res.body.firstName).to.be.an('string').to.deep.equals(user.firstName2);
          expect(res.body.lastName).to.be.an('string').to.deep.equals(user.lastName2);
          done();
        });
    });
  });

  /*
   * Test the /GET get-profile
   */
  describe('/GET get-profile', () => {
    it('it should return BAD_REQUEST', (done) => {
      const wrongData = { userName: 'fooUName' };
      chai
        .request(server)
        .get(`/v1/user/${wrongData.userName}`)
        .set('authorization', resHeader.authorization)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.BAD_REQUEST);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('code', 'message');
          expect(res.body.code).to.equals(httpStatus.BAD_REQUEST);
          expect(res.body.message).to.deep.equals('User not found');
          done();
        });
    });
    it('it should return OK', (done) => {
      chai
        .request(server)
        .get(`/v1/user/${user.userName}`)
        .set('authorization', resHeader.authorization)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.OK);
          expect(res.body).to.be.an('object');
          expect(res.body).to.contain.keys('email', 'userName', 'firstName', 'lastName');
          expect(res.body.email).to.deep.equals(user.email);
          expect(res.body.userName).to.deep.equals(user.userName);
          expect(res.body.firstName).to.deep.equals(user.firstName2);
          expect(res.body.lastName).to.deep.equals(user.lastName2);
          done();
        });
    });
  });
});
