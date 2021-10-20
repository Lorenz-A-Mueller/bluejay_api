const employees = [
  {
    firstName: 'Jennifer',
    lastName: 'Smith',
    email: 'jennifer.smith@bluejay.com',
    password: 'JenniferTestPassword1',
    dob: '1970-05-11',
    admin: true,
  },
  {
    firstName: 'John',
    lastName: 'Hilton',
    email: 'john.hilton@bluejay.com',
    password: 'JohnTestPassword1',
    dob: '1980-05-09',
    admin: false,
  },
  {
    firstName: 'Lisa',
    lastName: 'Verdi',
    email: 'lisa.verdi@bluejay.com',
    password: 'LisaTestPassword1',
    dob: '1988-10-08',
    admin: false,
  },
  {
    firstName: 'Abdullah',
    lastName: 'Khan',
    email: 'abdullah.khan@bluejay.com',
    password: 'AbdullahTestPassword1',
    dob: '1966-12-28',
    admin: false,
  },
  {
    firstName: 'Tatyana',
    lastName: 'Melnikova',
    email: 'tatyana.melnikova@bluejay.com',
    password: 'TatyanaTestPassword1',
    dob: '1979-03-20',
    admin: false,
  },
  {
    firstName: 'Quentin',
    lastName: 'York',
    email: 'quentin.york@bluejay.com',
    password: 'QuentinTestPassword1',
    dob: '1990-01-02',
    admin: false,
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
    arg7: boolean,
  ) => Promise<string[]>,
) {
  console.log('Inserting employees into employees table...');

  for (const person of employees) {
    await sql`
		INSERT INTO employees
		(first_name, last_name, email, password, dob, admin)
		VALUES
		(${person.firstName}, ${person.lastName}, ${person.email}, ${person.password}, ${person.dob}, ${person.admin});
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
