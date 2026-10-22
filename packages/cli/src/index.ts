import { main } from './main';

const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  process.stderr.write(`@akhatmirzo/cli Node.js 18+ talab qiladi (hozir: ${process.version})\n`);
  process.exit(1);
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
