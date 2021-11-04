import { hashPassword } from '../utils/auth';

const employees = [
  {
    number: '00001',
    firstName: 'Jennifer',
    lastName: 'Smith',
    email: 'jennifer.smith@bluejay.com',
    password: 'JenniferTestPassword1',
    dob: '1970-05-11',
  },
  {
    number: '00002',
    firstName: 'John',
    lastName: 'Hilton',
    email: 'john.hilton@bluejay.com',
    password: 'JohnTestPassword1',
    dob: '1980-05-09',
  },
  {
    number: '00003',
    firstName: 'Lisa',
    lastName: 'Verdi',
    email: 'lisa.verdi@bluejay.com',
    password: 'LisaTestPassword1',
    dob: '1988-10-08',
  },
  {
    number: '00004',
    firstName: 'Abdullah',
    lastName: 'Khan',
    email: 'abdullah.khan@bluejay.com',
    password: 'AbdullahTestPassword1',
    dob: '1966-12-28',
  },
  {
    number: '00005',
    firstName: 'Tatyana',
    lastName: 'Melnikova',
    email: 'tatyana.melnikova@bluejay.com',
    password: 'TatyanaTestPassword1',
    dob: '1979-03-20',
  },
  {
    number: '00006',
    firstName: 'Quentin',
    lastName: 'York',
    email: 'quentin.york@bluejay.com',
    password: 'QuentinTestPassword1',
    dob: '1990-01-02',
  },
];

export async function up(
  sql: (
    arg: TemplateStringsArray,
    arg2: string,
    arg3: string,
    arg4: string,
    arg5: string,
    arg6: string,
    arg7: string,
  ) => Promise<string[]>,
) {
  console.log('Inserting employees into employees table...');

  for (const person of employees) {
    const hashedPassword = await hashPassword(person.password);
    await sql`
		INSERT INTO employees
		(number, first_name, last_name, email, password_hashed, dob)
		VALUES
		(${person.number}, ${person.firstName}, ${person.lastName}, ${person.email}, ${hashedPassword}, ${person.dob});
			`;
  }
  return;
}

export async function down(
  sql: (arg: TemplateStringsArray) => Promise<string[]>,
) {
  console.log('Deleting employees from employees table');
  await sql`
	DELETE FROM employees;
	`;
}
