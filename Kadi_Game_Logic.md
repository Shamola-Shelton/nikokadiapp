# Kadi: Digital Game Logic Outline

This document outlines the core logic and data structures required to build a digital version of the Kenyan card game, Kadi.

## 1. Core Data Structures

To represent the game state, you will need the following structures.

### Card
A simple object to represent a single playing card.
```typescript
interface Card {
  suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades' | 'Joker';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number; // For ranking or special identification
  type: 'Answer' | 'Question' | 'Jump' | 'Kickback' | 'Control' | 'Penalty';
}
```

### Player
An object to represent a player in the game.
```typescript
interface Player {
  id: string;
  name: string;
  hand: Card[];
  hasDeclaredKadi: boolean;
  isSkipped: boolean;
}
```

### GameState
A main object to hold the entire state of the game at any given time.
```typescript
interface GameState {
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  playDirection: 'forward' | 'backward';
  activeSuit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
  penaltyStack: {
    cardsToDraw: number;
  };
  winner: Player | null;
}
```

## 2. Game Flow & Main Loop

The game progresses in a loop, managed by the `GameState`.

1.  **Initialization (`initGame`)**
    *   Create a deck of 52 cards (and optional Jokers).
    *   Shuffle the deck.
    *   Create Player objects.
    *   Deal the initial hand of cards to each player.
    *   Set up the `GameState`:
        *   Place remaining cards in `drawPile`.
        *   Turn over the first valid `Answer Card` to start the `discardPile`.
        *   Set `currentPlayerIndex` to 0.
        *   Set `playDirection` to 'forward'.
        *   Set `activeSuit` to the suit of the first card.
        *   Initialize `penaltyStack` and `winner`.

2.  **Turn Loop**
    *   The game waits for input from the `players[currentPlayerIndex]`.
    *   Check if the current player `isSkipped`. If so, un-skip them and advance to the next player.
    *   The player can either play a card or draw a card.

3.  **Player Action: Play Card (`playCard`)**
    *   The player selects one or more cards from their `hand`.
    *   **Validation:**
        *   Check if the played card(s) are a legal move (match suit or rank, or are a valid multi-card play).
        *   If the move is illegal, reject it and inform the player.
    *   **Execution:**
        *   Move the card(s) from the player's `hand` to the top of the `discardPile`.
        *   Update `activeSuit` based on the played card.
        *   Trigger `applyCardEffect()` for the played card.
        *   Check for a win condition with `checkForWin()`.
        *   If no win, advance to the next player using `advanceTurn()`.

4.  **Player Action: Draw Card (`drawCard`)**
    *   The player requests to draw a card.
    *   Move one card from `drawPile` to the player's `hand`.
    *   If the `drawPile` is empty, shuffle the `discardPile` (except the top card) to recreate the `drawPile`.
    *   The player's turn ends. Advance to the next player using `advanceTurn()`.

5.  **Winning and Game End**
    *   If `checkForWin()` returns true, set the `winner` in the `GameState`.
    *   End the game loop and display the winner.

## 3. Core Functions

These functions manipulate the `GameState`.

*   **`createDeck(): Card[]`**: Generates a full, sorted deck of cards with their properties.

*   **`shuffle(deck: Card[]): Card[]`**: Randomizes the order of a deck.

*   **`deal(players: Player[], deck: Card[])`**: Distributes cards to players' hands.

*   **`isValidMove(card: Card, topOfDiscard: Card, activeSuit: string, penaltyStack: object): boolean`**: Checks if a card can be legally played.

*   **`applyCardEffect(card: Card, gameState: GameState)`**: The logic hub. This function contains a `switch` statement based on the `card.rank` (or `type`) to apply all special card effects:
    *   **'2', '3', 'Joker':** Update `gameState.penaltyStack`.
    *   **'J':** Set `isSkipped` on the next player.
    *   **'K':** Reverse `gameState.playDirection`.
    *   **'A':** Prompt the active player to choose a new `activeSuit`.
    *   **'Q', '8':** (Requires more complex logic) Set a flag requiring the next player to "answer".

*   **`advanceTurn(gameState: GameState): number`**: Calculates the index of the next player based on `currentPlayerIndex` and `playDirection`.

*   **`checkForWin(player: Player): boolean`**:
    *   Checks if `player.hand.length === 0`.
    *   Checks if `player.hasDeclaredKadi` is true.
    *   If both are true, the player has won.

*   **`handlePlayerInput(playerId: string, action: object)`**: The entry point for player actions, which then calls the appropriate functions like `playCard` or `drawCard`.

## 4. Player Declaration Logic

*   The UI must provide a "Niko Kadi!" button.
*   A player can press this button at the end of their turn.
*   **`declareKadi(player: Player)`**: This function checks if the player is in a state where they *could* win on their next turn. If so, it sets `player.hasDeclaredKadi = true`. This logic can be complex and may be simplified in a digital version to allow declaration at any point.

This outline provides a robust starting point for developing a digital version of Kadi, covering the essential data, flow, and functional components.
