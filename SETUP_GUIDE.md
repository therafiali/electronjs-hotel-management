# 🚀 Electron React TypeScript - Complete Setup & Configuration Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Project Structure](#project-structure)
5. [Configuration Files](#configuration-files)
6. [Development Workflow](#development-workflow)
7. [Build Process](#build-process)
8. [Distribution](#distribution)
9. [Troubleshooting](#troubleshooting)
10. [Customization Guide](#customization-guide)

---

## Project Overview

This is a modern Electron desktop application built with:
- **Electron** - Cross-platform desktop app framework
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundling and development server
- **Modern CSS** - Beautiful UI with gradients and animations

### Key Features
- ✅ Secure IPC communication with context isolation
- ✅ Hot reloading for development
- ✅ TypeScript for both main and renderer processes
- ✅ Modern, responsive UI design
- ✅ Cross-platform compatibility
- ✅ Production build optimization

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control)

### System Requirements
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later
- **Linux**: Ubuntu 18.04+ or equivalent

### Verify Installation
```bash
# Check Node.js version
node --version  # Should be v16.0.0 or higher

# Check npm version
npm --version   # Should be v8.0.0 or higher

# Check Git version
git --version   # Any recent version
```

---

## Initial Setup

### 1. Create Project Directory
```bash
# Create and navigate to project directory
mkdir electron-react-typescript
cd electron-react-typescript
```

### 2. Initialize npm Project
```bash
# Initialize package.json
npm init -y
```

### 3. Install Dependencies

#### Core Dependencies
```bash
# Install React and TypeScript dependencies
npm install react react-dom @types/react @types/react-dom
```

#### Development Dependencies
```bash
# Install Electron and build tools
npm install --save-dev electron electron-builder typescript @types/node

# Install Webpack and loaders
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin ts-loader css-loader style-loader

# Install development utilities
npm install --save-dev concurrently
```

### 4. Create Project Structure
```bash
# Create directory structure
mkdir -p src/main src/renderer dist
```

---

## Project Structure

```
electron-react-typescript/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Main process entry point
│   │   └── preload.ts          # Secure IPC preload script
│   └── renderer/               # React renderer process
│       ├── App.tsx             # Main React component
│       ├── index.tsx           # React entry point
│       ├── index.html          # HTML template
│       └── styles.css          # Modern CSS styles
├── dist/                       # Built files (generated)
├── webpack.config.js           # Webpack configuration
├── tsconfig.json              # TypeScript config for renderer
├── tsconfig.main.json         # TypeScript config for main process
├── package.json               # Dependencies and scripts
├── README.md                  # Project documentation
├── SETUP_GUIDE.md            # This setup guide
└── .gitignore                # Git ignore rules
```

---

## Configuration Files

### 1. package.json
```json
{
  "name": "electron-react-typescript",
  "version": "1.0.0",
  "description": "Electron application with React and TypeScript",
  "main": "dist/main/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "webpack serve --mode development",
    "dev:main": "tsc -p tsconfig.main.json && electron .",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "webpack --mode production",
    "build:main": "tsc -p tsconfig.main.json",
    "dist": "npm run build && electron-builder",
    "postinstall": "electron-builder install-app-deps"
  },
  "build": {
    "appId": "com.example.electron-react-typescript",
    "productName": "Electron React TypeScript",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### 2. tsconfig.json (Renderer Process)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src/renderer"
  ]
}
```

### 3. tsconfig.main.json (Main Process)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": [
    "src/main/**/*"
  ],
  "exclude": [
    "src/renderer/**/*",
    "node_modules"
  ]
}
```

### 4. webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
  },
};
```

### 5. .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
release/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Cache directories
.cache
.parcel-cache
```

---

## Development Workflow

### 1. Development Mode
```bash
# Start development with hot reloading
npm run dev
```

This command:
- Starts webpack dev server on port 3000
- Compiles main process TypeScript
- Launches Electron app
- Enables hot reloading for React components

### 2. Development Scripts Explained

#### `npm run dev`
- Runs both renderer and main process in development mode
- Uses `concurrently` to run multiple commands simultaneously

#### `npm run dev:renderer`
- Starts webpack dev server
- Serves React app on `http://localhost:3000`
- Enables hot module replacement

#### `npm run dev:main`
- Compiles main process TypeScript
- Launches Electron app
- Loads renderer from dev server

### 3. Development Features
- **Hot Reloading**: React components update automatically
- **Source Maps**: Debug TypeScript code directly
- **DevTools**: Electron DevTools open automatically
- **Error Overlay**: Webpack error overlay for React errors

---

## Build Process

### 1. Production Build
```bash
# Build for production
npm run build
```

This command:
- Builds renderer process with webpack
- Compiles main process TypeScript
- Creates optimized production files

### 2. Build Scripts Explained

#### `npm run build:renderer`
- Runs webpack in production mode
- Minifies JavaScript and CSS
- Generates `dist/bundle.js` and `dist/index.html`

#### `npm run build:main`
- Compiles TypeScript to JavaScript
- Outputs to `dist/main/` directory
- Creates `main.js` and `preload.js`

### 3. Build Output Structure
```
dist/
├── bundle.js              # Minified React bundle
├── bundle.js.map          # Source maps
├── index.html             # HTML template
└── main/
    ├── main.js           # Compiled main process
    └── preload.js        # Compiled preload script
```

---

## Distribution

### 1. Create Distributable Packages
```bash
# Create platform-specific installers
npm run dist
```

### 2. Distribution Output
- **Windows**: `.exe` installer in `release/` directory
- **macOS**: `.dmg` file in `release/` directory
- **Linux**: `.AppImage` file in `release/` directory

### 3. Distribution Configuration
The `package.json` build configuration:
- **appId**: Unique identifier for your app
- **productName**: Display name of the application
- **directories.output**: Output directory for installers
- **files**: Files to include in the distribution
- **Platform-specific settings**: Different targets for each OS

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Port 3000 Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process or change port in webpack.config.js
```

#### 2. TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. Electron Build Failures
```bash
# Clear build cache
rm -rf dist/ release/

# Rebuild
npm run build
```

#### 4. Permission Errors (Windows)
```bash
# Run PowerShell as Administrator
# Or use WSL for development
```

#### 5. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm run dev

# Or use Electron debug flags
npm run dev -- --enable-logging
```

---

## Customization Guide

### 1. Adding New Dependencies
```bash
# Add production dependencies
npm install package-name

# Add development dependencies
npm install --save-dev package-name
```

### 2. Modifying the UI
- Edit `src/renderer/App.tsx` for React components
- Edit `src/renderer/styles.css` for styling
- Edit `src/renderer/index.html` for HTML template

### 3. Adding New IPC Methods

#### Step 1: Update Preload Script
```typescript
// src/main/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // Existing methods...
  newMethod: (data: any) => ipcRenderer.send('new-channel', data),
  onNewEvent: (callback: (data: any) => void) => {
    ipcRenderer.on('new-event', (_, data) => callback(data));
  },
});
```

#### Step 2: Handle in Main Process
```typescript
// src/main/main.ts
import { ipcMain } from 'electron';

ipcMain.on('new-channel', (event, data) => {
  // Handle the data
  console.log('Received:', data);
  
  // Send response back to renderer
  event.reply('new-event', { response: 'success' });
});
```

#### Step 3: Use in React Component
```typescript
// src/renderer/App.tsx
useEffect(() => {
  if (window.electronAPI) {
    window.electronAPI.onNewEvent((data) => {
      console.log('Received from main:', data);
    });
  }
}, []);

const handleNewAction = () => {
  window.electronAPI.newMethod({ action: 'test' });
};
```

### 4. Changing App Configuration
- **App Name**: Update `productName` in `package.json`
- **App Icon**: Add icon files and update build configuration
- **Window Size**: Modify `width` and `height` in `main.ts`
- **DevTools**: Control DevTools opening in development mode

### 5. Environment Variables
```bash
# Create .env file
NODE_ENV=development
ELECTRON_IS_DEV=true
```

### 6. Adding Build Targets
```json
// package.json build configuration
"build": {
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] },
      { "target": "portable", "arch": ["x64"] }
    ]
  }
}
```

---

## Security Best Practices

### 1. Context Isolation
- Always enabled in this project
- Prevents direct access to Node.js APIs from renderer

### 2. Preload Scripts
- Only expose necessary APIs
- Validate all inputs
- Use TypeScript for type safety

### 3. Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
```

### 4. Regular Updates
```bash
# Update dependencies regularly
npm audit
npm update
```

---

## Performance Optimization

### 1. Production Builds
- Webpack optimizations enabled
- Code splitting and tree shaking
- Minification and compression

### 2. Development Performance
- Hot module replacement
- Source maps for debugging
- Fast refresh for React components

### 3. Bundle Analysis
```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to webpack config for bundle analysis
```

---

## Testing

### 1. Manual Testing
- Test on all target platforms
- Verify IPC communication
- Check UI responsiveness

### 2. Automated Testing (Future Enhancement)
```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### 3. E2E Testing (Future Enhancement)
```bash
# Install Playwright or Spectron
npm install --save-dev @playwright/test
```

---

## Deployment Checklist

### Before Distribution
- [ ] Test on all target platforms
- [ ] Verify all features work correctly
- [ ] Check for security vulnerabilities
- [ ] Update version number
- [ ] Test installer creation
- [ ] Verify app signing (macOS/Windows)

### Distribution Steps
1. Run `npm run build`
2. Run `npm run dist`
3. Test installers on clean machines
4. Upload to distribution platform
5. Update documentation

---

## Support and Resources

### Official Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Webpack Documentation](https://webpack.js.org/concepts)

### Community Resources
- [Electron Discord](https://discord.gg/electron)
- [React Community](https://reactjs.org/community/support.html)
- [TypeScript Community](https://www.typescriptlang.org/community)

### Troubleshooting Resources
- [Electron Issues](https://github.com/electron/electron/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/electron)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Created by Rafi Ali**  
**Last Updated**: August 2024  
**Version**: 1.0.0 