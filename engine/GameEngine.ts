/* ============================================================
   KENYAN KADI / NIKO KADI – COMPLETE GAME ENGINE
   ============================================================ */

/* =======================
   TYPES & ENUMS
   ======================= */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6'
  | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K'
  | 'JOKER';

export type CardType =
  | 'answer'
  | 'penalty'
  | 'skip'
  | 'reverse'
  | 'wild'
  | 'winning';

export type GamePhase =
  | 'TURN_START'
  | 'RESOLVING'
  | 'ADVANCE_TURN';

export interface Card {
  id: string;
  suit: Suit | null;
  rank: Rank;
  type: CardType;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  declaredKadi: boolean;
  isAI: boolean;
  rating: number;
  coins: number;
}

export interface PendingEffect {
  type: 'penalty' | 'skip' | 'question';
  value?: number;
}

export interface GameState {
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  pendingEffect: PendingEffect | null;
  requiredSuit: Suit | null;
  phase: GamePhase;
  turnNumber: number;
  updatedAt: Date;
  status: 'waiting' | 'active' | 'finished';
  winner: string | null;
  activePenaltyStack: number;
  nikoDeclaredBy: string | null;
}

export interface GameMove {
  playerId: string;
  cardsPlayed: Card[];
  action: 'play' | 'draw' | 'answer';
  timestamp: Date;
}

/* =======================
   GAME ENGINE
   ======================= */

export class GameEngine {
  private state: GameState | null = null;

  /* =======================
     INITIALIZATION
     ======================= */

  public startGame(players: Player[], deck: Card[]): void {
    this.state = {
      players,
      drawPile: this.shuffle(deck),
      discardPile: [],
      currentPlayerIndex: 0,
      direction: 1,
      pendingEffect: null,
      requiredSuit: null,
      phase: 'TURN_START',
      turnNumber: 1,
      updatedAt: new Date(),
      status: 'active',
      winner: null,
      activePenaltyStack: 0,
      nikoDeclaredBy: null
    };

    this.dealInitialCards(5);
    this.flipInitialCard();
  }

  private dealInitialCards(count: number): void {
    const gs = this.assertGame();
    for (let i = 0; i < count; i++) {
      for (const p of gs.players) {
        p.hand.push(gs.drawPile.pop()!);
      }
    }
  }

  private flipInitialCard(): void {
    const gs = this.assertGame();
    let card = gs.drawPile.pop()!;
    while (card.rank === 'JOKER') {
      gs.drawPile.unshift(card);
      card = gs.drawPile.pop()!;
    }
    gs.discardPile.push(card);
  }

  /* =======================
     GETTERS
     ======================= */

  private assertGame(): GameState {
    if (!this.state) throw new Error('Game not started');
    return this.state;
  }

  public get currentPlayer(): Player {
    const gs = this.assertGame();
    return gs.players[gs.currentPlayerIndex];
  }

  private getEffectiveTopCard(): Card {
    const gs = this.assertGame();
    const top = gs.discardPile[gs.discardPile.length - 1];
    if (gs.requiredSuit) {
      return { ...top, suit: gs.requiredSuit };
    }
    return top;
  }

  /* =======================
     CORE PLAY
     ======================= */

  public playCards(playerId: string, cardIds: string[]): GameMove {
    const gs = this.assertGame();
    const player = this.currentPlayer;

    if (player.id !== playerId) throw new Error('Not your turn');
    if (gs.phase !== 'TURN_START') throw new Error('Invalid phase');

    const cards = cardIds.map(id => {
      const c = player.hand.find(h => h.id === id);
      if (!c) throw new Error('Card not found');
      return c;
    });

    // Multi-card validation (same rank)
    const rank = cards[0].rank;
    if (!cards.every(c => c.rank === rank)) {
      throw new Error('Multi-card play must share rank');
    }

    const top = this.getEffectiveTopCard();
    
    // **ACE CARD OVERRIDE - ACE CAN ALWAYS BE PLAYED**
    if (this.isAceCard(cards[0])) {
      // ACE cards bypass all validation and can be played anytime
      console.log('ACE card played - bypassing all validation');
    } else {
      // Normal validation for non-ACE cards
      if (
        rank !== top.rank &&
        cards[0].suit !== top.suit
      ) {
        throw new Error('Illegal play');
      }
    }

    // Remove from hand
    player.hand = player.hand.filter(c => !cardIds.includes(c.id));

    // Place cards
    gs.discardPile.push(...cards);
    gs.requiredSuit = null;
    gs.pendingEffect = null;

    // Resolve effects
    this.resolveCardEffects(cards[cards.length - 1]);

    // Declare Kadi
    if (player.hand.length === 1) {
      player.declaredKadi = true;
    }

    // Win check
    if (player.hand.length === 0) {
      if (!this.checkWinCondition(player)) {
        this.enforceIllegalFinish(player);
      }
    }

    gs.phase = 'ADVANCE_TURN';

    return {
      playerId,
      cardsPlayed: cards,
      action: 'play',
      timestamp: new Date()
    };
  }

  /* =======================
     CARD EFFECTS
     ======================= */

  private resolveCardEffects(card: Card): void {
    const gs = this.assertGame();

    switch (card.rank) {
      case 'A':
        gs.phase = 'RESOLVING';
        break;

      case '2':
        gs.pendingEffect = { type: 'penalty', value: 2 };
        break;

      case '3':
        gs.pendingEffect = { type: 'penalty', value: 3 };
        break;

      case 'JOKER':
        gs.pendingEffect = { type: 'penalty', value: 5 };
        break;

      case 'J':
        gs.pendingEffect = { type: 'skip', value: 1 };
        break;

      case 'K':
        gs.direction *= -1;
        break;

      default:
        break;
    }
  }

  public declareSuit(playerId: string, suit: Suit): void {
    const gs = this.assertGame();
    if (this.currentPlayer.id !== playerId) throw new Error('Not your turn');
    gs.requiredSuit = suit;
    gs.phase = 'ADVANCE_TURN';
  }

  /* =======================
     DRAW & PENALTY
     ======================= */

  public forceDraw(playerId: string): GameMove {
    const gs = this.assertGame();
    if (this.currentPlayer.id !== playerId) throw new Error('Not your turn');

    let count = 1;
    if (gs.pendingEffect?.type === 'penalty') {
      count = gs.pendingEffect.value!;
      gs.pendingEffect = null;
    }

    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (gs.drawPile.length === 0) this.reshuffle();
      if (gs.drawPile.length === 0) break;
      const c = gs.drawPile.pop()!;
      this.currentPlayer.hand.push(c);
      drawn.push(c);
    }

    gs.phase = 'ADVANCE_TURN';

    return {
      playerId,
      cardsPlayed: drawn,
      action: 'draw',
      timestamp: new Date()
    };
  }

  /* =======================
     QUESTION / ANSWER
     ======================= */

  public answerQuestion(playerId: string, cardIds: string[]): GameMove {
    const gs = this.assertGame();
    if (this.currentPlayer.id !== playerId) throw new Error('Not your turn');
    if (gs.pendingEffect?.type !== 'question') throw new Error('No question');

    const player = this.currentPlayer;
    const cards = cardIds.map(id => {
      const c = player.hand.find(h => h.id === id);
      if (!c || c.type !== 'winning') throw new Error('Invalid answer');
      return c;
    });

    player.hand = player.hand.filter(c => !cardIds.includes(c.id));
    gs.discardPile.push(...cards);
    gs.pendingEffect = null;
    gs.phase = 'ADVANCE_TURN';

    return {
      playerId,
      cardsPlayed: cards,
      action: 'answer',
      timestamp: new Date()
    };
  }

  /* =======================
     TURN MANAGEMENT
     ======================= */

  public resolveTurn(): void {
    const gs = this.assertGame();
    if (gs.phase !== 'ADVANCE_TURN') throw new Error('Not ready');

    let skip = 0;
    if (gs.pendingEffect?.type === 'skip') {
      skip = gs.pendingEffect.value!;
      gs.pendingEffect = null;
    }

    gs.currentPlayerIndex = this.nextPlayerIndex(1 + skip);
    gs.phase = 'TURN_START';
    gs.turnNumber++;
    gs.updatedAt = new Date();
  }

  private nextPlayerIndex(steps: number): number {
    const gs = this.assertGame();
    const len = gs.players.length;
    let idx = gs.currentPlayerIndex;
    for (let i = 0; i < steps; i++) {
      idx = (idx + gs.direction + len) % len;
    }
    return idx;
  }

  /* =======================
     WIN LOGIC
     ======================= */

  private checkWinCondition(player: Player): boolean {
    const gs = this.assertGame();
    return (
      player.hand.length === 0 &&
      player.declaredKadi &&
      gs.pendingEffect === null
    );
  }

  private enforceIllegalFinish(player: Player): void {
    const gs = this.assertGame();
    for (let i = 0; i < 2; i++) {
      if (gs.drawPile.length === 0) this.reshuffle();
      if (gs.drawPile.length > 0) {
        player.hand.push(gs.drawPile.pop()!);
      }
    }
    player.declaredKadi = false;
  }

  /* =======================
     UTILITIES
     ======================= */

  private reshuffle(): void {
    const gs = this.assertGame();
    if (gs.discardPile.length <= 1) return;
    const top = gs.discardPile.pop()!;
    gs.drawPile = this.shuffle(gs.discardPile);
    gs.discardPile = [top];
  }

  private shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  /* =======================
     ACE CARD HELPER
     ======================= */

  private isAceCard(card: Card): boolean {
    return card.rank === 'A' || card.type === 'wild';
  }

  /* =======================
     GET VALID CARDS (for UI)
     ======================= */

  public getValidCards(hand: Card[]): Card[] {
    const gs = this.assertGame();
    if (gs.discardPile.length === 0) return hand;

    const top = this.getEffectiveTopCard();
    
    return hand.filter(card => {
      // **ACE CARD OVERRIDE - ACE CAN ALWAYS BE PLAYED**
      if (this.isAceCard(card)) {
        return true;
      }
      
      // Check for penalty effects
      if (gs.pendingEffect?.type === 'penalty') {
        // Only penalty cards or ACE can be played during penalty
        return card.type === 'penalty';
      }
      
      // Normal validation
      return card.rank === top.rank || card.suit === top.suit;
    });
  }

  /* =======================
     GET GAME STATE (for UI)
     ======================= */

  public getGameState(): GameState | null {
    return this.state;
  }

  public getTopCard(): Card | null {
    const gs = this.assertGame();
    if (gs.discardPile.length === 0) return null;
    return gs.discardPile[gs.discardPile.length - 1];
  }

  public initializeGame(players: Player[]): void {
    // Create a standard deck
    const deck: Card[] = [];
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        let type: CardType = 'answer';
        if (rank === '2' || rank === '3') type = 'penalty';
        else if (rank === 'J') type = 'skip';
        else if (rank === 'K') type = 'reverse';
        else if (rank === 'A') type = 'wild';
        
        deck.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
          type
        });
      }
    }
    
    // Add jokers
    deck.push({ id: 'joker-1', suit: null, rank: 'JOKER', type: 'penalty' });
    deck.push({ id: 'joker-2', suit: null, rank: 'JOKER', type: 'penalty' });
    
    this.startGame(players, deck);
  }

  public playCard(playerId: string, cardIds: string[], declaredSuit?: Suit): GameMove {
    return this.playCards(playerId, cardIds);
  }

  public drawCard(playerId: string): GameMove {
    return this.forceDraw(playerId);
  }

  public declareNikoKadi(playerId: string): void {
    const gs = this.assertGame();
    const player = gs.players.find(p => p.id === playerId);
    if (player) {
      player.declaredKadi = true;
      gs.nikoDeclaredBy = playerId;
    }
  }

  public getValidMultiCardCombinations(playerId: string): Card[][] {
    const gs = this.assertGame();
    const player = gs.players.find(p => p.id === playerId);
    if (!player) return [];
    
    const combinations: Card[][] = [];
    const hand = player.hand;
    
    // Group cards by rank
    const rankGroups: Record<string, Card[]> = {};
    for (const card of hand) {
      if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
      rankGroups[card.rank].push(card);
    }
    
    // Return groups with 2+ cards
    for (const [rank, cards] of Object.entries(rankGroups)) {
      if (cards.length >= 2) {
        combinations.push(cards.slice(0, Math.min(cards.length, 4))); // Max 4 cards
      }
    }
    
    return combinations;
  }

  public getCardsThatCanBeAdded(playerId: string, currentSelection: Card[]): Card[] {
    const gs = this.assertGame();
    const player = gs.players.find(p => p.id === playerId);
    if (!player) return [];
    
    if (currentSelection.length === 0) {
      return this.getValidCards(player.hand);
    }
    
    const firstRank = currentSelection[0].rank;
    return player.hand.filter(card => 
      card.rank === firstRank && 
      !currentSelection.some(selected => selected.id === card.id)
    );
  }

  public isValidMultiCardCombination(cards: Card[]): boolean {
    if (cards.length < 2) return false;
    const firstRank = cards[0].rank;
    return cards.every(c => c.rank === firstRank);
  }

  public getAIMove(playerId: string): GameMove {
    const gs = this.assertGame();
    const player = gs.players.find(p => p.id === playerId);
    if (!player || !player.isAI) throw new Error('Player not found or not AI');
    
    const validCards = this.getValidCards(player.hand);
    if (validCards.length === 0) {
      return this.forceDraw(playerId);
    }
    
    // Simple AI: play first valid card
    const cardToPlay = validCards[0];
    return this.playCards(playerId, [cardToPlay.id]);
  }
}
