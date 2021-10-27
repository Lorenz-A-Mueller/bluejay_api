import bcrypt from 'bcrypt';

export const hashPassword = (plaintextPassword: string) => {
  const passwordHashed = bcrypt.hash(plaintextPassword, 10);
  return passwordHashed;
};

export const verifyPassword = (
  plaintextPassword: string,
  hashedPassword: string,
) => {
  const passwordIsVerified = bcrypt.compare(plaintextPassword, hashedPassword);
  return passwordIsVerified;
};
