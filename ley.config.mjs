import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();
export const options = {};
if (process.env.NODE_ENV === 'production') {
  options.ssl = { rejectUnauthorized: false };
}
