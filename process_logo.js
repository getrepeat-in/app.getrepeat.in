const sharp = require('sharp');

async function processLogo() {
  try {
    const img = sharp('public/splash-logo.png');
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    
    console.log(`Background color detected: rgb(${bgR}, ${bgG}, ${bgB})`);

    await sharp('public/splash-logo.png')
      .trim({
        background: { r: bgR, g: bgG, b: bgB, alpha: 1 },
        threshold: 10
      })
      .toFile('public/trimmed-logo.png');
      
    console.log("Trimmed logo saved to public/trimmed-logo.png");
    
    const trimmedInfo = await sharp('public/trimmed-logo.png').metadata();
    console.log("Trimmed info:", trimmedInfo.width, "x", trimmedInfo.height);
    
    await sharp({
      create: {
        width: 1280,
        height: 1280,
        channels: 3,
        background: { r: bgR, g: bgG, b: bgB }
      }
    })
    .composite([
      {
        input: await sharp('public/trimmed-logo.png')
          .resize({ width: 850, withoutEnlargement: false })
          .toBuffer(),
        gravity: 'center'
      }
    ])
    .toFile('assets/logo.png');
    
    await sharp('assets/logo.png').toFile('assets/splash.png');
    
    console.log("Successfully created enlarged logo.png and splash.png in assets/");
    
  } catch (err) {
    console.error(err);
  }
}

processLogo();
