const uuidv4 = require("uuid/v4");

const createUser = ({ name = "" } = {}) => ({
  id: uuidv4(),
  name
});

module.exports = {
  createUser
};
