# Niko Kadi - Card Game
# NikoKadi Testing Guide

A strategic card game built with React Native and Expo.
## 🧪 How to Test the NikoKadi Game

## Features
### **1. Start the Development Server**

```bash
cd NikoKadi
npm start
```

## Game Rules
This will start the Expo development server. You can test on:
- **Web**: Open your browser to the provided URL
- **Mobile**: Use Expo Go app on your phone
- **Simulator**: Use iOS Simulator or Android Emulator

### Card Types
- **Number Cards (2-10)**: Match by rank or suit
- **Jump Cards (J)**: Skip the next player
- **Question Cards (Q)**: Require an Answer card response
- **Kickback Cards (K)**: Reverse play direction
- **Answer Cards (A)**: Answer questions or change suit
- **Penalty Cards (2,3)**: Force next player to draw cards
- **Jokers**: Wild cards with special abilities
### **2. Access the Test Suite**

### How to Win
1. Declare "Niko Kadi" when you have 3 or fewer cards
2. Play all your cards in a single turn after declaring
3. The final cards must be Answer cards or Question+Answer combinations
1. Launch the app
2. Click the red **"Test"** button on the home screen
3. This opens the comprehensive test suite

## Development
### **3. Run Individual Tests**

### Tech Stack
- React Native with Expo
- TypeScript
- Firebase (Firestore, Authentication)
- Expo Vector Icons
- React Navigation
#### **Game Engine Tests**
- Tests card deck creation
- Validates game initialization
- Checks move validation logic
- Verifies special card mechanics

### Project Structure
```
NikoKadi/
├── context/          # Theme context
├── engine/           # Game engine logic
├── navigation/       # Navigation setup
├── screens/          # UI screens
├── services/         # Firebase services
├── types/           # TypeScript definitions
└── assets/          # Images and fonts
```
#### **Firebase Service Tests**
- Tests authentication
- Validates user profile operations
- Checks leaderboard functionality
- Tests real-time game state

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Run on device/simulator: `npm run android` or `npm run ios`
#### **Card Mechanics Tests**
- Validates Jump, Kickback, Penalty cards
- Tests Question-Answer pairs
- Checks Ace wild card functionality
- Verifies Niko Kadi declaration

### Testing
Run the test suite from the Test screen in the app, or use:
```bash
npm test
#### **AI Logic Tests**
- Tests AI move generation
- Validates AI decision making
- Checks difficulty levels

#### **UI Component Tests**
- Tests theme switching
- Validates navigation
- Checks component rendering

### **4. Manual Gameplay Testing**

#### **Start a Quick Match**
1. Go to Play → Quick Match
2. Select 2-4 players
3. Test card playing mechanics
4. Verify special card effects
5. Test Niko Kadi declaration

#### **Test Private Rooms**
1. Go to Play → Private Room
2. Generate or enter room code
3. Test multiplayer functionality

#### **Test Tutorial**
1. Go to Tutorial from home screen
2. Navigate through all tutorial steps
3. Test practice game

### **5. Console Testing**

Open browser developer tools (F12) to see:
- Game engine logs
- Firebase connection status
- Card validation results
- AI decision logs
- Error messages

### **6. Test Checklist**

#### **Core Gameplay**
- [ ] Deck shuffles correctly
- [ ] Cards deal to all players
- [ ] Turn progression works
- [ ] Special cards function properly
- [ ] Penalties stack correctly
- [ ] Questions/Answers pair properly
- [ ] Niko Kadi declaration works
- [ ] Win conditions validate

#### **Multiplayer**
- [ ] Quick match finding
- [ ] Private room creation/joining
- [ ] Real-time game sync
- [ ] Turn notifications
- [ ] Game state persistence

#### **UI/UX**
- [ ] Navigation between screens
- [ ] Theme switching (light/dark)
- [ ] Responsive design
- [ ] Button interactions
- [ ] Form inputs
- [ ] Loading states

#### **Data & Backend**
- [ ] User authentication
- [ ] Profile updates
- [ ] Leaderboard updates
- [ ] Achievement tracking
- [ ] Shop purchases

### **7. Debugging Tips**

#### **Common Issues**
- **Firebase Connection**: Check Firebase config in `FirebaseService.ts`
- **Navigation**: Verify all screen imports in `AppNavigator.tsx`
- **State Management**: Check GameEngine singleton implementation
- **TypeScript Errors**: Verify type definitions in `types/index.ts`

#### **Console Commands**
```javascript
// Access game engine from browser console
const gameEngine = GameEngine.getInstance();
const gameState = gameEngine.getGameState();

// Access Firebase service
const firebaseService = FirebaseService.getInstance();
```

## Contributing
### **8. Performance Testing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
#### **Memory Usage**
- Monitor memory in browser dev tools
- Check for memory leaks in long sessions
- Verify cleanup on component unmount

## License
#### **Network Performance**
- Monitor Firebase calls
- Check for unnecessary re-renders
- Optimize real-time subscriptions

This project is licensed under the MIT License.
### **9. Device Testing**

#### **Mobile Testing**
- Test on different screen sizes
- Verify touch interactions
- Check performance on older devices
- Test offline functionality

#### **Cross-Platform**
- Test on iOS and Android
- Verify platform-specific features
- Check app store compliance

### **10. Automated Testing (Future)**

For production, consider adding:
- Unit tests with Jest
- Integration tests
- E2E tests with Detox
- Performance benchmarks

---

## 🚀 Ready to Test!

The game is now fully functional with comprehensive testing capabilities. Start with the automated test suite, then proceed to manual gameplay testing to ensure everything works as expected.

**Remember**: Open browser dev tools to see detailed console logs during testing!
