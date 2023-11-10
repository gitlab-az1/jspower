// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('node:path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('node:fs');

const buildDir = path.resolve(process.cwd(), 'dist');
const srcDir = path.resolve(process.cwd(), 'src');

async function recursiveRemoveDirectoryFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));

    if(stats.isDirectory()) {
      await recursiveRemoveDirectoryFiles(path.join(dir, filename));
    } else {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }

  await fs.promises.rmdir(dir);
}


async function recursiveRemoveTestFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));
    
    if(stats.isDirectory()) {
      await recursiveRemoveTestFiles(path.join(dir, filename));
    } else if(/.spec./.test(filename)) {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }
}


async function main() {
  await recursiveRemoveDirectoryFiles(path.join(buildDir, 'types'));
  await fs.promises.mkdir(path.join(buildDir, 'types'), { mode: 0o755, recursive: true });

  for(const item of (await fs.promises.readdir(path.join(srcDir, 'types')))) {
    const current = path.join(srcDir, 'types', item);
    const stats = await fs.promises.stat(current);

    if(!stats.isFile()) continue;
    await fs.promises.copyFile(current, path.join(buildDir, 'types', item));
  }

  await recursiveRemoveTestFiles(buildDir);
}

main().catch(console.error);