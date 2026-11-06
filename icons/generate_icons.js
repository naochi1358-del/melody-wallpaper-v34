const sharp = require('sharp');
(async () => {
  const source = 'icons/icon.svg';
  await sharp(source).resize(180, 180).png().toFile('icons/apple-touch-icon.png');
  await sharp(source).resize(192, 192).png().toFile('icons/icon-192.png');
  await sharp(source).resize(512, 512).png().toFile('icons/icon-512.png');
  console.log('Generated PWA icons from icons/icon.svg');
})().catch(error => { console.error(error); process.exit(1); });
