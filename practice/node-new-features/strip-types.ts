import {stripTypeScriptTypes} from 'node:module';

const tsCode = `
    interface User {
        name: string;
        age: number;
    };
    
    function hiBro(user: User): string {
        return \`Hi, \${user.name}! You are \${user.age} years old.\`;
    }
    
    const user: User = {
        name: 'Bro',
        age: 30
    };
    
    hiBro(user);
`;

const jsCode = stripTypeScriptTypes(tsCode);

console.log(jsCode, '\ntypes striped');
// oxlint-disable-next-line no-eval -- demonstrating stripped output actually executes as valid JS
console.log(eval(jsCode), '\njs code is valid');
