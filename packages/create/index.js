import { input, select, confirm } from '@inquirer/prompts';
import { readdir, cp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const name = await input({
  message: 'Choose a name for your library',
  default: 'redis-gear'
});

const path = await input({
  message: 'Where do you want to create it?',
  default: `../../${name}`
});

const template = await select({
  message: 'Which template do you want to use?',
  choices: (await readdir('./templates')).map(value => ({ value }))
});

const ok = await confirm({
  message: 'Are you sure?'
});

if (ok) {
  await cp(
    `./templates/${template}`,
    resolve(process.cwd(), path),
    { recursive: true }
  );

  await writeFile(resolve(process.cwd(), path, 'package.json'), JSON.stringify({
    name,
    private: true,
    scripts: {
      start: 'gears-sdk index.js'
    },
    devDependencies: {
      '@redis/gears-sdk': 'file:../packages/sdk'
    }
  }, null, 2));

  console.log([
    `cd ${path}`,
    'npm install',
    'npm run start'
  ].join('\n'));
}
