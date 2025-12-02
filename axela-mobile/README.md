# Axela Mobile - React Native Version

This is the React Native mobile version of Axela, converted from the web/Electron version.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio with Android SDK
- For iOS: Xcode (macOS only)

### Installation

1. Navigate to the mobile project:
```bash
cd axela-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update backend URL:
   - Open `src/contexts/AxelaContext.js`
   - Change `API_BASE_URL` to your computer's local IP address
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

4. Start the development server:
```bash
npm start
```

5. Run on device/emulator:
   - Press `a` for Android
   - Press `i` for iOS (macOS only)
   - Scan QR code with Expo Go app

## 📱 Features

### ✅ Converted (Working)
- Chat interface with message history
- Mode switching (Manual/AI/Chat)
- Settings panel with basic controls
- Backend API integration
- Dark theme matching desktop version

### 🚧 In Progress
- Scripts management screen
- Voice input/output
- Full settings implementation
- Command block editor

### 📋 Not Yet Implemented
- Conversation management
- Local storage persistence
- Push notifications
- Offline mode

## 🔧 Backend Setup

Make sure your Axela Python backend is running:

1. In the main project folder:
```bash
cd backend
python main.py --api-mode --host 0.0.0.0 --port 8000
```

2. Update the mobile app's `API_BASE_URL` to point to your computer's IP

## 📦 Project Structure

```
axela-mobile/
├── App.js                 # Main app entry with navigation
├── src/
│   ├── screens/           # Screen components
│   │   ├── ChatScreen.js
│   │   ├── ScriptsScreen.js
│   │   └── SettingsScreen.js
│   └── contexts/          # State management
│       └── AxelaContext.js
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🎨 Design System

- Primary Color: `#f97316` (Orange 500)
- Background: `#0c0a09` (Stone 950)
- Surface: `#1c1917` (Stone 900)
- Text: `#fafaf9` (Stone 50)

## 🔄 Migration Status

| Component | Web | React Native | Status |
|-----------|-----|--------------|--------|
| Chat UI | ✅ | ✅ | Complete |
| Settings | ✅ | 🟡 | Partial |
| Scripts | ✅ | ❌ | Placeholder |
| Auth | ✅ | ❌ | Not started |
| Voice | ✅ | ❌ | Not started |

## 📝 Next Steps

1. Complete Scripts screen with full CRUD
2. Add conversation persistence with AsyncStorage
3. Implement voice recording/playback
4. Add authentication flow
5. Build native modules for advanced features
6. Create production build for app stores

## 🐛 Known Issues

- Backend must allow CORS for mobile access
- Voice features require native implementation
- Some animations need optimization

## 📖 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)

---

**Note:** This is an initial conversion. Some features from the web version are simplified or not yet implemented.
