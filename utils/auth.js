const bcrypt = require('bcrypt');

const hashPassword = (plaintextPassword) => {
  const passwordHashed = bcrypt.hash(plaintextPassword, 10);
  return passwordHashed;
};

const verifyPassword = (plaintextPassword, hashedPassword) => {
  const passwordIsVerified = bcrypt.compare(plaintextPassword, hashedPassword);
  return passwordIsVerified;
};

module.exports.hashPassword = hashPassword;
module.exports.verifyPassword = verifyPassword;
