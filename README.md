# Electron React TypeScript App

A modern Electron application built with React and TypeScript, featuring a beautiful UI and secure IPC communication.

## Features

- ⚡ **Electron** - Cross-platform desktop application framework
- ⚛️ **React** - Modern UI library with hooks
- 🔷 **TypeScript** - Type-safe JavaScript
- 🎨 **Modern UI** - Beautiful, responsive design with CSS Grid and Flexbox
- 🔒 **Secure IPC** - Context isolation and preload scripts
- 📦 **Webpack** - Module bundling and development server
- 🚀 **Hot Reloading** - Fast development experience
- 🏗️ **Build System** - Production builds with electron-builder

## Project Structure

```
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main process entry point
│   │   └── preload.ts  # Preload script for secure IPC
│   └── renderer/       # React renderer process
│       ├── App.tsx     # Main React component
│       ├── index.tsx   # React entry point
│       ├── index.html  # HTML template
│       └── styles.css  # Modern CSS styles
├── dist/               # Built files (generated)
├── webpack.config.js   # Webpack configuration
├── tsconfig.json       # TypeScript config for renderer
├── tsconfig.main.json  # TypeScript config for main process
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd electron-react-typescript
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

This will:
- Start the webpack dev server for the React app
- Compile the main process TypeScript
- Launch the Electron app

### Building

Build for production:

```bash
npm run build
```

### Distribution

Create distributable packages:

```bash
npm run dist
```

This creates platform-specific installers in the `release/` directory.

## Available Scripts

- `npm run dev` - Start development mode with hot reloading
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm start` - Start the built application

## Architecture

### Main Process (`src/main/main.ts`)
- Creates the Electron window
- Handles application lifecycle
- Manages window state

### Preload Script (`src/main/preload.ts`)
- Provides secure API for renderer process
- Exposes only necessary functions
- Maintains context isolation

### Renderer Process (`src/renderer/`)
- React application with TypeScript
- Modern UI components
- Secure communication with main process

## Security Features

- **Context Isolation**: Enabled by default
- **Node Integration**: Disabled for security
- **Preload Scripts**: Secure API exposure
- **Remote Module**: Disabled

## Customization

### Adding New IPC Methods

1. Update the preload script (`src/main/preload.ts`):
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // Add your new methods here
  yourNewMethod: (data: any) => ipcRenderer.send('your-channel', data),
});
```

2. Handle in main process (`src/main/main.ts`):
```typescript
ipcMain.on('your-channel', (event, data) => {
  // Handle the data
});
```

3. Use in React component:
```typescript
window.electronAPI.yourNewMethod(data);
```

### Styling

The app uses modern CSS with:
- CSS Grid and Flexbox for layout
- CSS Custom Properties for theming
- Responsive design
- Smooth animations and transitions

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**: Change the port in `webpack.config.js`
2. **TypeScript errors**: Ensure all dependencies are installed
3. **Build failures**: Clear `dist/` directory and rebuild

### Development Tips

- Use the DevTools in development mode for debugging
- Check the console for any errors
- The app automatically reloads when you make changes

## License

MIT License - feel free to use this project as a starting point for your own applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using Electron, React, and TypeScript 