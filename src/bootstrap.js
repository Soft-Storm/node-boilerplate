const User = require('./api/v1/user/model');
const { BOOTSTRAP } = require('./config');

const createAdmin = async () => {
  // eslint-disable-next-line consistent-return
  User.findOne({ role: 'admin' }, (err, res) => {
    if (err) {
      console.log('error finding admin user \n', err);
    } else {
      if (res) {
        console.log('admin user exists \n Admin Email ', res.email, '\n');

        return true;
      }
      const admins = [
        {
          email: BOOTSTRAP.email,
          first_name: BOOTSTRAP.first_name,
          is_verified: true,
          last_name: BOOTSTRAP.last_name,
          password: BOOTSTRAP.password,
          userName: BOOTSTRAP.user_name,
          role: 'admin'
        }
      ];

      User.insertMany(admins, (error, response) => {
        if (error) {
          console.log('Error creating admin user');

          return true;
        }
        console.log('Admin user created \n', JSON.stringify(response), '\r\n');

        return true;
      });
    }
  });
};

module.exports = {
  createAdmin
};
