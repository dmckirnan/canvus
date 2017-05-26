const User = require('./userModel');

const userController = {

  getAllUsers(req, res) {
    User.find({}, (err, results) => {
      if (err) {
        console.log('find all users error', err);
        return res.end();
      }
      return res.status(200).json(results);
    });
  },

  createUser(req, res) {

    User.create(req.body, (err, userRecord) => {
      if (err) {
        console.log('create user error', err);
        return res.end();
      }
      console.log('user created');
      return res.end();
    });
  },

  getUser(req, res) {
    const user = req.params.user;
    User.findOne({ user: user }, (err, results) => {
      if (results === null) {
        return res.status(418).json(err);
      } else {
        return res.status(200).json(results);
      }
    });
  },

  updateUser(req, res) {
    const user = req.params.user;
    const newNotes = req.body.notes;
    console.log(req.body);

    User.update(
      { user: user },
      {
        $set: {
          notes: newNotes
        }
      }, (err, result) => {
        if (err) {
          return res.status(418).json(err);
        }
        console.log('updated!');
        return res.end();
      }
    )
  }
};

module.exports = userController;
