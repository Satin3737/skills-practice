import {glob} from 'fs/promises';

// no need glob package

for await (const file of glob('**/*.ts')) {
    console.log(file);
}
