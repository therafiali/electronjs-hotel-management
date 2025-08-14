# Database Location Guide

## Where to Find Your `hotel.db` File

### Development Mode
When running your app in development mode (`npm run dev`), the database file is created in your project root directory:
```
C:\Users\DELL\Documents\GitHub\electronjs-react-typesript-starter\hotel.db
```

### Release Mode
When you build and distribute your app (`npm run dist`), the database file is created in the Electron app's user data directory:

**Windows:**
```
C:\Users\[YourUsername]\AppData\Roaming\[AppName]\hotel.db
```

**macOS:**
```
~/Library/Application Support/[AppName]/hotel.db
```

**Linux:**
```
~/.config/[AppName]/hotel.db
```

## How to Check Database Location

1. **In the App**: Go to Dashboard → Look for the "📁 Database Location" section
2. **In Debug View**: Go to Debug Data Preview → Database location is shown at the top
3. **Console Logs**: Check the console for "🔍 Database path:" messages

## Why This Happens

- **Development**: Uses `process.cwd()` which points to your project directory
- **Release**: Uses `app.getPath('userData')` which points to the app's data directory

## Finding the Database in Release Mode

1. **Windows**: Press `Win + R`, type `%APPDATA%`, press Enter
2. **Look for a folder with your app name** (e.g., "Electron React TypeScript")
3. **The `hotel.db` file will be inside that folder**

## Troubleshooting

- If you can't find the database, check the app's console logs
- The database is automatically created when the app first runs
- Make sure you have write permissions to the user data directory 