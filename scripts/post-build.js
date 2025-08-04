const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildDir = path.join(__dirname, '../build');

console.log('🚀 Running post-build optimizations...');

// Function to get file size in KB
const getFileSize = (filePath) => {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
};

// Function to recursively get all files with specific extensions
const getFilesRecursively = (dir, extensions) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Optimize HTML files - minify and add performance hints
const optimizeHtmlFiles = () => {
  console.log('📄 Optimizing HTML files...');
  const htmlFiles = getFilesRecursively(buildDir, ['.html']);
  
  htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add performance hints to HTML
    const performanceHints = `
    <script>
      // Performance monitoring
      if ('performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
          }, 0);
        });
      }
      
      // Preload next likely pages
      const preloadPages = ['/about', '/design', '/build'];
      preloadPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    </script>`;
    
    // Insert performance script before closing body tag
    content = content.replace('</body>', `${performanceHints}</body>`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Optimized ${path.basename(filePath)}`);
  });
};

// Generate build report
const generateBuildReport = () => {
  console.log('📊 Generating build report...');
  
  const staticDir = path.join(buildDir, 'static');
  const jsFiles = getFilesRecursively(staticDir, ['.js']);
  const cssFiles = getFilesRecursively(staticDir, ['.css']);
  const imageFiles = getFilesRecursively(buildDir, ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']);
  
  let totalSize = 0;
  const report = {
    timestamp: new Date().toISOString(),
    files: {
      javascript: [],
      css: [],
      images: []
    },
    summary: {}
  };
  
  // Analyze JS files
  jsFiles.forEach(file => {
    const size = parseFloat(getFileSize(file));
    totalSize += size;
    report.files.javascript.push({
      name: path.basename(file),
      size: `${size} KB`,
      path: path.relative(buildDir, file)
    });
  });
  
  // Analyze CSS files
  cssFiles.forEach(file => {
    const size = parseFloat(getFileSize(file));
    totalSize += size;
    report.files.css.push({
      name: path.basename(file),
      size: `${size} KB`,
      path: path.relative(buildDir, file)
    });
  });
  
  // Analyze image files
  imageFiles.forEach(file => {
    const size = parseFloat(getFileSize(file));
    totalSize += size;
    report.files.images.push({
      name: path.basename(file),
      size: `${size} KB`,
      path: path.relative(buildDir, file)
    });
  });
  
  report.summary = {
    totalFiles: jsFiles.length + cssFiles.length + imageFiles.length,
    totalSize: `${totalSize.toFixed(2)} KB`,
    jsFiles: jsFiles.length,
    cssFiles: cssFiles.length,
    imageFiles: imageFiles.length
  };
  
  // Write report
  fs.writeFileSync(
    path.join(buildDir, 'build-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📈 Build Report:');
  console.log(`   Total files: ${report.summary.totalFiles}`);
  console.log(`   Total size: ${report.summary.totalSize}`);
  console.log(`   JS files: ${report.summary.jsFiles}`);
  console.log(`   CSS files: ${report.summary.cssFiles}`);
  console.log(`   Image files: ${report.summary.imageFiles}`);
};

// Run optimizations
try {
  optimizeHtmlFiles();
  generateBuildReport();
  console.log('✅ Post-build optimizations completed successfully!');
} catch (error) {
  console.error('❌ Error during post-build optimization:', error);
  process.exit(1);
}