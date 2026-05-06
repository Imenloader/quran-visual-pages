const fs = require('fs');
const content = fs.readFileSync('src/i18n.ts', 'utf8');
let balance = 0;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') balance++;
    else if (content[i] === '}') balance--;
    if (balance < 0) console.log('Negative balance at index ' + i);
}
console.log('Final balance: ' + balance);
