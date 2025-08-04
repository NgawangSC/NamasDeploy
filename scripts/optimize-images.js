const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const stat = fs.statSync(inputPath);
    
    if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
      const baseName = path.parse(file).name;
      const webpPath = path.join(outputDir, `${baseName}.webp`);
      const jpegPath = path.join(outputDir, `${baseName}.jpg`);
      
      try {
        // Convert to WebP (best compression)
        await sharp(inputPath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);
        
        // Create optimized JPEG fallback
        await sharp(inputPath)
          .jpeg({ quality: 85, progressive: true })
          .toFile(jpegPath);
        
        const originalSize = stat.size;
        const webpSize = fs.statSync(webpPath).size;
        const jpegSize = fs.statSync(jpegPath).size;
        
        console.log(`✅ ${file}:`);
        console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
        console.log(`   WebP: ${(webpSize / 1024).toFixed(1)}KB (${((1 - webpSize/originalSize) * 100).toFixed(1)}% smaller)`);
        console.log(`   JPEG: ${(jpegSize / 1024).toFixed(1)}KB (${((1 - jpegSize/originalSize) * 100).toFixed(1)}% smaller)`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
  }
}

optimizeImages().then(() => {
  console.log('🎉 Image optimization complete!');
}).catch(console.error);