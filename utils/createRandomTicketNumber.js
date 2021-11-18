const createRandomTicketNumber = () => {
  let randomTicketNumber = '';
  for (let i = 0; i < 8; i++) {
    const randomInteger = Math.floor(Math.random() * 10);
    randomTicketNumber = randomTicketNumber + randomInteger;
  }
  return '#' + randomTicketNumber;
};

const createRandomCustomerNumber = () => {
  let randomCustomerNumber = '';
  for (let i = 0; i < 8; i++) {
    const randomInteger = Math.floor(Math.random() * 10);
    randomCustomerNumber = randomCustomerNumber + randomInteger;
  }
  return randomCustomerNumber;
};

module.exports = { createRandomTicketNumber, createRandomCustomerNumber };
