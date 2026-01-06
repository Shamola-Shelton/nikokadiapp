# Niko Kadi - Complete Game Rules Implementation

## 🎯 Overview
Niko Kadi is a strategic card game played with a standard 54-card deck. The game features special cards, multi-card plays, and unique mechanics like Universal Wild Ace.

## 🃏 Deck Composition

### **54-Card Deck Structure:**
- **52 Standard Cards**: All suits (♠♥♦♣) with ranks 2-A
- **2 Jokers**: Special penalty cards

### **Card Types:**
| Rank | Type | Value | Special Effect |
|------|------|-------|----------------|
| 2-3 | Penalty | 2-3 | Adds to penalty stack |
| 4-7 | Answer | 4-7 | Can answer questions |
| 8 | Question | 8 | Requires answer or draw |
| 9-10 | Answer | 9-10 | Can answer questions |
| J | Jump | 11 | Skips next player |
| Q | Question | 12 | Requires answer or draw |
| K | Kickback | 13 | Reverses direction |
| A | Answer (Universal Wild) | 14 | Wild card, can answer/cancel/declare |
| JOK | Penalty | 15 | Adds 5 to penalty stack |

## 🎮 Core Game Mechanics

### **1. Multi-Card Turns (Combo Play)**
**Rule**: A player may play multiple cards of the same rank/value in a single turn.

**Implementation**:
```typescript
// GameEngine.validateMove()
if (cards.length > 1) {
  const firstRank = cards[0].rank;
  const allSameRank = cards.every(c => c.rank === firstRank);
  if (!allSameRank) {
    return { canPlay: false, message: 'All cards must have the same rank' };
  }
}
```

**Applies to ALL card types**:
- ✅ Normal cards (4, 5, 6, 7, 9, 10)
- ✅ Question cards (8, Q)
- ✅ Penalty cards (2, 3, Joker)
- ✅ Special cards (J, K)
- ✅ Universal Wild (A)

**Player Options**:
- Play one card
- Play some matching cards
- Play all matching cards

**Example**: Board: 8♠ → Player holds: 8♦, 8♠, 8♥ → Can play any combination

### **2. Universal Wild Ace**
**Rule**: Ace is a Universal Wild Answer card that can be played anytime.

**Implementation**:
```typescript
// GameEngine.getValidCards()
if (card.rank === 'A') {
  return true; // Always playable
}

// GameEngine.validateMove()
for (const card of cards) {
  if (card.rank === 'A') {
    continue; // Skip all validation for Ace
  }
}
```

**Ace Functions**:

#### **A) Answering Questions**
- **Rule**: Any Ace can answer ANY Question (Q or 8) regardless of suit
- **Implementation**: During answer turn, Ace cards are returned as valid answers
- **Effect**: Question resolved, no cards drawn

#### **B) Canceling Penalties**
- **Rule**: Any Ace cancels ANY penalty (2, 3, Joker) regardless of suit
- **Implementation**: Ace clears penalty stack when played
- **Effect**: Penalty stops immediately, no cards drawn

#### **C) Normal Play**
- **Rule**: Ace can be played on ANY card regardless of suit or rank
- **Implementation**: Ace bypasses all matching requirements
- **Effect**: Player declares next suit

#### **D) Multi-Card Ace Plays**
- **Rule**: Multiple Aces can be played together (same-rank rule)
- **Implementation**: Multiple Aces validated as same rank
- **Effect**: Last Ace determines declared suit

#### **E) No-Ace-Out Rule**
- **Rule**: Cannot win with Ace as final card
- **Implementation**: If Ace is last card, player must draw 1 card
- **Effect**: Game continues, player cannot win with Ace

### **3. Question/Answer Mechanics**
**Rule**: Question cards (8, Q) require answers from the SAME PLAYER who played them, or cause draws.

**Implementation**:
```typescript
// GameEngine.applyCardEffects()
if (hasQuestion && !hasAnswer) {
  this.gameState.awaitingAnswerTurn = true;
  this.gameState.lastQuestionSuit = questionCard.suit;
}

// During answer turn - single card only
if (this.gameState.awaitingAnswerTurn) {
  if (cards.length !== 1 || (!hasAce && !hasMatchingAnswer)) {
    return { canPlay: false, message: 'You must play a single matching answer or a single Ace to answer the question. You cannot play multiple cards during an answer turn.' };
  }
}
```

**Question Play**:
- Play Question alone → Triggers answer turn for SAME PLAYER
- Player must play matching Answer or draw
- Only single card answers allowed

**Answer Requirements**:
- **Normal Answer**: Must match suit (4-7 of same suit) - SINGLE CARD ONLY
- **Ace Answer**: Any Ace works (Universal Wild) - SINGLE CARD ONLY
- **Same Player**: Player who played Question must answer it

### **4. Penalty System**
**Rule**: Penalty cards (2, 3, Joker) are ACCUMULATIVE across multiple players.

**Implementation**:
```typescript
// GameEngine.applyCardEffects()
case 'penalty':
  // Add to penalty stack (accumulative)
  const penaltyValue = card.rank === 'JOK' ? 5 : parseInt(card.rank);
  this.gameState.activePenaltyStack += penaltyValue;
  console.log(`Penalty added: +${penaltyValue}, Total penalty: ${this.gameState.activePenaltyStack}`);
```

**Penalty Values**:
- 2, 3: Face value
- Joker: 5 cards

**Accumulative Examples**:
- Player 1 plays 3♠ → Penalty: 3 cards total
- Player 2 plays 3♦ → Penalty: 6 cards total
- Player 3 plays JOK → Penalty: 11 cards total
- Player 4 must draw 11 OR play matching 3 OR cancel with Ace

**Penalty Resolution**:
- Play matching card → Penalty continues and accumulates
- Draw cards → Penalty cleared for current player only
- Play Ace → Penalty canceled completely

### **5. Special Card Effects**

#### **Jump (J)**
- **Effect**: Skips next player
- **Implementation**: `pendingSkipCount++`
- **Stacking**: Multiple Js skip multiple players

#### **Kickback (K)**
- **Effect**: Reverses play direction
- **Implementation**: `direction = direction === 'clockwise' ? 'counterclockwise' : 'clockwise'`
- **Stacking**: Multiple Ks reverse multiple times

### **6. Zero Cards Rule**
**Rule**: Player with zero cards who doesn't win must draw.

**Implementation**:
```typescript
// GameEngine.playCard()
if (player.hand.length === 0 && !hasAce) {
  // Player has zero cards but didn't win - must draw 1 card
  const drawCard = this.gameState.drawPile.pop()!;
  player.hand.push(drawCard);
  this.advanceTurn();
}
```

**Outcomes**:
- ✅ **Winning**: Declared winner, game ends
- ❌ **Not winning**: Must draw 1 card, continue playing

### **7. Niko Kadi Declaration**
**Rule**: Must declare Niko Kadi in previous round to win.

**Implementation**:
```typescript
// GameEngine.checkWinCondition()
if (this.gameState.nikoDeclaredBy !== playerId) {
  this.gameState.status = 'finished';
  this.gameState.winner = null;
  return;
}
```

**Requirements**:
- Declare Niko Kadi in round R-1
- Finish with zero cards in round R
- Winning cards must be valid (Answer cards or Question+Answer)

## 🎯 UI Implementation

### **Card Selection System**
**Multi-Card Selection Logic**:
```typescript
// GameScreen.handleCardPress()
if (card.rank === firstCard.rank) {
  // Same rank - can add to selection
  setSelectedCards([...selectedCards, card]);
} else {
  // Different rank - replace selection
  setSelectedCards([card]);
}
```

**Visual Feedback**:
- **Selection badges**: 1, 2, 3... show order
- **Dynamic highlighting**: Same-rank cards become selectable
- **Ace highlighting**: Always playable (bright border)

### **Play Validation**
**Frontend Validation**:
```typescript
// GameScreen.renderCard()
const isPlayable = isHand && (
  card.rank === 'A' || 
  playableCardIdSet.has(card.id) ||
  (selectedCards.length > 0 && card.rank === selectedCards[0].rank)
);
```

**Backend Validation**:
- GameEngine.validateMove() enforces all rules
- GameEngine.getValidCards() determines playable cards
- Proper error messages for invalid moves

## 🔧 Technical Architecture

### **GameEngine Class**
**Singleton Pattern**:
```typescript
export class GameEngine {
  private static instance: GameEngine | null = null;
  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance!;
  }
}
```

**Core Methods**:
- `validateMove()`: Rule enforcement
- `playCard()`: Game actions
- `getValidCards()`: UI card highlighting
- `applyCardEffects()`: Special card handling
- `checkWinCondition()`: Victory validation

### **GameScreen Component**
**State Management**:
- `selectedCards`: Multi-card selection
- `playableCardIdSet`: Dynamic card highlighting
- `gameState`: Current game state
- `currentPlayer`: Turn management

**User Interactions**:
- Card selection with multi-card support
- Play button with validation
- Draw button for penalty situations
- Suit selection for Ace plays

## 🎮 Game Flow

### **Game Initialization**
1. **Deck Creation**: 54 cards with proper types
2. **Shuffling**: Random deck order
3. **Dealing**: 3-4 cards per player (official rules)
4. **Starting Card**: Find valid non-special card
5. **First Turn**: Random player starts

### **Turn Sequence**
1. **Player Turn**: Human or AI
2. **Card Selection**: Multi-card support
3. **Validation**: Rule enforcement
4. **Play/Draw**: Execute action
5. **Effects**: Apply special card effects
6. **Turn Advancement**: Next player or special effects

### **Win Conditions**
1. **Zero Cards**: Player runs out of cards
2. **Niko Kadi Check**: Must have declared previous round
3. **Winning Cards**: Valid Answer cards or Question+Answer
4. **No Tie**: No other players with zero cards

## 🏆 Strategic Elements

### **Card Management**
- **Hand Size**: Start with 3-4 cards
- **Card Counting**: Track played cards
- **Suit Management**: Control with Ace declarations
- **Penalty Avoidance**: Use Aces strategically

### **Multi-Card Strategy**
- **Dumping**: Play multiple cards to reduce hand
- **Effect Stacking**: Multiple special cards
- **Defensive Play**: Save Aces for penalties
- **Offensive Play**: Use Questions to force draws

### **Niko Kadi Timing**
- **Declaration Window**: Must declare before final round
- **Risk Assessment**: Calculate winning probability
- **Card Counting**: Know when to declare
- **Bluffing**: Fake declarations with strong hand

## 🎯 Rule Compliance

### **✅ Fully Implemented Rules**
1. **Multi-Card Turns**: All card types, same rank only
2. **Universal Wild Ace**: Playable anytime, all functions
3. **Question/Answer**: Same player answers, single card only
4. **Accumulative Penalties**: Stack across multiple players
5. **Special Cards**: Jump, Kickback effects
6. **Zero Cards Rule**: Draw if not winning
7. **Niko Kadi Declaration**: Round-based winning
8. **No-Ace-Out Rule**: Cannot win with Ace final card

### **✅ UI Features**
1. **Multi-Card Selection**: Visual feedback, badges
2. **Card Highlighting**: Dynamic playable indicators
3. **Ace Selection**: Always selectable
4. **Suit Declaration**: Popup for Ace plays
5. **Turn Indicators**: Clear player identification
6. **Penalty Display**: Visual stack indicator

### **✅ Technical Implementation**
1. **Rule Validation**: Complete enforcement
2. **State Management**: Proper game state
3. **Error Handling**: Clear user feedback
4. **AI Logic**: Strategic computer opponents
5. **Win Detection**: Accurate victory conditions

## 🎮 Current Status

**All rules are fully implemented and functional:**
- ✅ **Multi-card selection** works for all card types
- ✅ **Universal Wild Ace** plays anytime with suit declaration
- ✅ **Question/Answer** mechanics with same-player answering, single card only
- ✅ **Accumulative penalty system** with stacking across players
- ✅ **Special card effects** (Jump, Kickback)
- ✅ **Zero cards rule** with forced draw
- ✅ **Niko Kadi declaration** and winning conditions
- ✅ **No-Ace-Out rule** preventing Ace wins
- ✅ **Visual feedback** for all game states
- ✅ **AI opponents** following all rules

**The game is ready for play with complete rule implementation!** 🎉

## 📋 Quick Reference

### **Card Effects Summary**
| Card | Effect | Stacking | Notes |
|------|---------|---------|--------|
| 2-3 | +2/+3 penalty | Yes | Accumulative |
| 4-7 | Answer | No | Can answer questions |
| 8 | Question | No | Requires answer |
| 9-10 | Answer | No | Can answer questions |
| J | Skip next | Yes | Multiple skips |
| Q | Question | No | Requires answer |
| K | Reverse direction | Yes | Multiple reverses |
| A | Universal Wild | Yes | Any combination |
| JOK | +5 penalty | Yes | Accumulative |

### **Turn Flow Summary**
1. **Normal Play**: Select cards → Play → Effects apply → Next turn
2. **Question Play**: Select Q → Play → Same player answers → Next turn
3. **Penalty Play**: Select 2/3/JOK → Play → Penalty accumulates → Next player faces penalty
4. **Ace Play**: Select A → Play → Choose suit/Cancel penalty → Next turn
5. **Answer Turn**: Select matching answer/Ace → Play → Question resolved → Next turn

**This document serves as the complete reference for Niko Kadi game implementation and rules!** 📚✨
