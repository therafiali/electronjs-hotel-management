# 🚀 Quick Reference Card - Electron React TypeScript

## 📋 Essential Commands

### Development
```bash
# Start development with hot reloading
npm run dev

# Start only renderer process (webpack dev server)
npm run dev:renderer

# Start only main process
npm run dev:main
```

### Building
```bash
# Build for production
npm run build

# Build only renderer
npm run build:renderer

# Build only main process
npm run build:main
```

### Running
```bash
# Start built application
npm start

# Create distributable packages
npm run dist
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, and build config |
| `webpack.config.js` | Webpack bundling configuration |
| `tsconfig.json` | TypeScript config for renderer |
| `tsconfig.main.json` | TypeScript config for main process |
| `.gitignore` | Git ignore rules |

## 📁 Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts    # Main entry point
│   └── preload.ts # IPC preload script
└── renderer/      # React renderer process
    ├── App.tsx    # Main React component
    ├── index.tsx  # React entry point
    ├── index.html # HTML template
    └── styles.css # CSS styles
```

## 🔌 IPC Communication

### Preload Script (`src/main/preload.ts`)
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('message', (_, message) => callback(message));
  },
});
```

### Main Process (`src/main/main.ts`)
```typescript
ipcMain.on('message', (event, message) => {
  console.log('Received:', message);
  event.reply('message', 'Response from main');
});
```

### React Component
```typescript
useEffect(() => {
  if (window.electronAPI) {
    window.electronAPI.onMessage((msg) => {
      console.log('Received:', msg);
    });
  }
}, []);

const sendMessage = () => {
  window.electronAPI.sendMessage('Hello from React!');
};
```

## 🎨 UI Customization

### Main Component
- Edit: `src/renderer/App.tsx`
- Styles: `src/renderer/styles.css`
- Template: `src/renderer/index.html`

### Window Configuration
```typescript
// src/main/main.ts
const mainWindow = new BrowserWindow({
  width: 1200,        // Window width
  height: 800,        // Window height
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change port in `webpack.config.js` |
| TypeScript errors | Run `npm install` and rebuild |
| Build failures | Clear `dist/` and rebuild |
| Permission errors | Run as Administrator (Windows) |

### Debug Commands
```bash
# Debug mode
DEBUG=* npm run dev

# With logging
npm run dev -- --enable-logging

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies

### Core Dependencies
- `react` - UI library
- `react-dom` - React DOM rendering
- `@types/react` - TypeScript types for React
- `@types/react-dom` - TypeScript types for React DOM

### Development Dependencies
- `electron` - Desktop app framework
- `electron-builder` - Build and package tool
- `typescript` - TypeScript compiler
- `webpack` - Module bundler
- `ts-loader` - TypeScript loader for webpack
- `css-loader` - CSS loader for webpack
- `style-loader` - Style loader for webpack
- `html-webpack-plugin` - HTML plugin for webpack
- `concurrently` - Run multiple commands

## 🔒 Security Features

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Secure preload scripts
- ✅ TypeScript for type safety

## 🌐 Development URLs

- **Development**: `http://localhost:3000`
- **Production**: `file:///path/to/dist/index.html`

## 📱 Platform Support

- ✅ Windows (NSIS installer)
- ✅ macOS (DMG file)
- ✅ Linux (AppImage)

## 🎯 Build Output

```
dist/
├── bundle.js          # React bundle
├── index.html         # HTML template
└── main/
    ├── main.js       # Main process
    └── preload.js    # Preload script
```

## 📚 Useful Links

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://reactjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Webpack Docs](https://webpack.js.org/concepts)

---

**Created by Rafi Ali**  
**Quick Reference v1.0** 