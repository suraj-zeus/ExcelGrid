
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EmployeeType } from './types.js';




const getEmployeesData = () : EmployeeType[] => {
    const firstNames : string[] = ['Suraj', 'Roshan', 'Anand', 'Sandeep', 'Swayam', 'Joshua', 'Praveen', 'Piyush', 'Abhishek'];
    const lastNames : string[] = ['Prajapati', 'Singh', 'Pawar', 'Patil', 'Pandit', 'Poojary'];
    const ages : number[] = [20, 25, 30, 50, 45, 35, 55, 60];
    const salaries : number[] = [200000, 400000, 2000000, 400000, 340000, 5600000];

    const employees : EmployeeType[] = [];

    for(let i : number = 0; i<50000; i++) {
        const firstName = firstNames[generateRandomIndex(0, firstNames.length - 1)] as string;
        const lastName = lastNames[generateRandomIndex(0, lastNames.length - 1)] as string;
        const age = ages[generateRandomIndex(0, ages.length - 1)] as number;
        const salary = salaries[generateRandomIndex(0, salaries.length - 1)] as number;

        employees.push({
            id : i + 1,
            firstName : firstName,
            lastName : lastName,
            age : age,
            salary : salary
        });
    }

    return employees;

}

const generateRandomIndex = (min : number, max : number) : number => {
    const random : number = Math.random();
    const num : number = Math.floor((random * (max - min - 1))) + (min + 1);
    return num;
}


const createFile = async () : Promise<void> => {
    try {
        const rootPath : string = process.cwd();
        const filePath : string = join(rootPath, 'employees.json');

        const content : EmployeeType[] = getEmployeesData();

        await writeFile(filePath, JSON.stringify(content), 'utf8');
    }
    catch(error) {
        console.error("Error creating file...", error);
    }
}

createFile();