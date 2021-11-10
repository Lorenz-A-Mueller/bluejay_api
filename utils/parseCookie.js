const parseCustomerSessionCookie = (cookiesString) => {
  // console.log('cookiesString', cookiesString);

  const cookieStringSplit = cookiesString.split(' ');
  // console.log('cookieStringSplit', cookieStringSplit);
  const customerSessionCookieString = cookieStringSplit.filter((segment) => {
    return segment.includes('customerSessionToken');
  })[0];
  // console.log('customerSessionCookieString', customerSessionCookieString);
  const sessionCookieString = customerSessionCookieString.split(
    'customerSessionToken=',
  )[1];

  const sessionCookie = sessionCookieString
    .replace(/%3D/g, '=')
    .replace(/%2B/g, '+')
    .replace(/%2F/g, '/')
    .replace(/;/g, '');
  // console.log('SESSIONCOOKIE', sessionCookie);

  return sessionCookie;
};

const parseEmployeeSessionCookie = (cookiesString) => {
  // console.log('cookiesString', cookiesString);

  const cookieStringSplit = cookiesString.split(' ');
  // console.log('cookieStringSplit', cookieStringSplit);
  const employeeSessionCookieString = cookieStringSplit.filter((segment) => {
    return segment.includes('employeeSessionToken');
  })[0];
  // console.log('customerSessionCookieString', customerSessionCookieString);
  const sessionCookieString = employeeSessionCookieString.split(
    'employeeSessionToken=',
  )[1];

  const sessionCookie = sessionCookieString
    .replace(/%3D/g, '=')
    .replace(/%2B/g, '+')
    .replace(/%2F/g, '/')
    .replace(/;/g, '');
  // console.log('SESSIONCOOKIE', sessionCookie);

  return sessionCookie;
};

module.exports.parseCustomerSessionCookie = parseCustomerSessionCookie;
module.exports.parseEmployeeSessionCookie = parseEmployeeSessionCookie;
