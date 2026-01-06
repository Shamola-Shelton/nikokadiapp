import { 
  Card, Player, GameState, GameMove, Suit, Rank, 
  CardType,
  GamePhase, PlayStyle, Difficulty, ValidationResult, 
  MoveValidation, AIStrategy, CardCountingState, 
  PsychologicalProfile, GameAnalysis, PopupConfig,
  GameAction, GameEvent
} from '../types';

export class GameEngine {
  private static instance: GameEngine | null = null;
  private gameState: GameState | null = null;
  private cardCountingState: CardCountingState;
  private psychologicalProfiles: Map<string, PsychologicalProfile>;
  private moveHistory: GameMove[] = [];
  private eventLog: GameEvent[] = [];

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance!;
  }

  constructor() {
    this.cardCountingState = this.initializeCardCounting();
    this.psychologicalProfiles = new Map();
  }

  private initializeCardCounting(): CardCountingState {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const remainingCards: Record<Rank, Record<Suit | 'joker', number>> = {} as any;
    
    // Initialize card counting
    ranks.forEach(rank => {
      remainingCards[rank] = {} as any;
      suits.forEach(suit => {
        remainingCards[rank][suit] = 1;
      });
    });
    
    remainingCards['JOK'] = { joker: 2 } as any;
    
    return {
      playedCards: new Set(),
      remainingCards,
      suitDistribution: { hearts: 13, diamonds: 13, clubs: 13, spades: 13 },
      specialCardsRemaining: { '2': 4, '3': 4, '4': 4, '5': 4, '6': 4, '7': 4, '8': 4, '9': 4, '10': 4, J: 4, Q: 4, K: 4, A: 4, JOK: 2 }
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      const color = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';

      for (const rank of ranks) {
        let type: CardType;
        let value: number;

        switch (rank) {
          case '2':
          case '3':
            type = 'Penalty';
            value = parseInt(rank);
            break;
          case '4':
          case '5':
          case '6':
          case '7':
          case '9':
          case '10':
            type = 'Answer';
            value = parseInt(rank);
            break;
          case '8':
          case 'Q':
            type = 'Question';
            value = rank === 'Q' ? 12 : 8;
            break;
          case 'J':
            type = 'Jump';
            value = 11;
            break;
          case 'K':
            type = 'Kickback';
            value = 13;
            break;
          case 'A':
            type = 'Wild';
            value = 14;
            break;
          default:
            // Should not happen with the defined ranks
            type = 'Answer';
            value = 0;
            break;
        }

        deck.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
          type,
          color,
          value,
        });
      }
    }

    // Add 2 Jokers
    deck.push({
      id: 'joker-1',
      suit: 'joker',
      rank: 'JOK',
      type: 'Penalty',
      color: 'joker',
      value: 15
    });
    
    deck.push({
      id: 'joker-2',
      suit: 'joker',
      rank: 'JOK',
      type: 'Penalty',
      color: 'joker',
      value: 15
    });

    return deck;
  }

  // Game Initialization - Kenyan Kadi rules
  public initializeGame(players: Player[]): void {
    const deck = this.createDeck();
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal 3-4 cards based on number of players (Kenyan Kadi rules)
    const cardsPerPlayer = players.length <= 3 ? 4 : 3;
    players.forEach(player => {
      player.hand = deck.splice(0, cardsPerPlayer);
    });

    // Initialize game state with advanced features
    this.gameState = {
      id: Math.random().toString(36).substr(2, 9),
      players,
      drawPile: deck,
      discardPile: [],
      currentPlayerIndex: 0,
      direction: 'clockwise',
      status: 'active',
      activePenaltyStack: 0,
      activePenaltyRank: null,
      penaltyCarrySuit: null,
      penaltyCarryRank: null,
      requiredSuit: null,
      pendingSkipCount: 0,
      turnNumber: 1,
      mustDrawNextTurn: null,
      nikoDeclaredBy: null,
      nikoDeclaredRound: null,
      awaitingAnswer: null,
      lastQuestionSuit: null,
      gameMode: 'casual',
      winner: null,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Advanced game state
      gamePhase: 'early',
      multiCardPlayEnabled: true,
      strategicAnalysis: this.initializeStrategicAnalysis(players),
      playerTendencies: this.initializePlayerTendencies(players)
    };

    // Find valid starting card (Kenyan Kadi rules)
    this.findValidStartingCard();
  }

  private initializeStrategicAnalysis(players: Player[]) {
    return {
      leaderPlayerId: null,
      threatLevel: 0,
      averageHandSize: players.length <= 3 ? 4 : 3,
      suitsInPlay: { hearts: 13, diamonds: 13, clubs: 13, spades: 13 },
      specialCardsRemaining: { '2': 4, '3': 4, '4': 4, '5': 4, '6': 4, '7': 4, '8': 4, '9': 4, '10': 4, J: 4, Q: 4, K: 4, A: 4, JOK: 2 }
    };
  }

  private initializePlayerTendencies(players: Player[]) {
    const tendencies: Record<string, any> = {};
    players.forEach(player => {
      tendencies[player.id] = {
        aggression: player.isAI ? 0.5 : 0.3,
        bluffing: player.isAI ? 0.3 : 0.1,
        cardCounting: player.isAI ? 0.7 : 0.2
      };
    });
    return tendencies;
  }

  // Find valid starting card (not feeding, special, or ace)
  private findValidStartingCard(): void {
    if (!this.gameState) return;

    while (this.gameState.drawPile.length > 0) {
      const card = this.gameState.drawPile.pop()!;
      
      // A valid starting card is any 'Answer' card
      if (card.type === 'Answer') {
        this.gameState.discardPile.push(card);
        // card.suit may include 'joker' in type union; only assign when it's a real Suit
        this.gameState.requiredSuit = card.suit !== 'joker' ? (card.suit as Suit) : null;
        return;
      }
      
      // Return invalid card to the middle of the deck
      this.gameState.drawPile.splice(Math.floor(this.gameState.drawPile.length / 2), 0, card);
    }
  }

  // Advanced Validation - Comprehensive Kadi rules
  public validateMove(playerId: string, cardIds: string[]): ValidationResult {
    if (!this.gameState) {
      return { valid: false, error: 'Game not initialized' };
    }

    // Enforce the "No-Ace-Out" rule: player must draw.
    if (this.gameState.mustDrawNextTurn === playerId) {
      return { valid: false, error: 'You must draw a card after playing an Ace as your final card.' };
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { valid: false, error: 'Player not found' };
    }

    if (this.gameState.players[this.gameState.currentPlayerIndex].id !== playerId) {
      return { valid: false, error: 'Not your turn.' };
    }

    const cards = cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (cards.length !== cardIds.length || cards.length === 0) {
      return { valid: false, error: 'One or more cards not found in hand.' };
    }

    const cardToValidate = cards[0];

    // **ACE CARD OVERRIDE - ACE CAN ALWAYS BE PLAYED**
    if (this.isAceCard(cardToValidate)) {
      return { valid: true, message: 'Ace can be played anytime and overrides suit requirements.' };
    }

    // If a question is awaiting an answer, only the same player may answer and only with a single Answer or an Ace.
    if (this.gameState.awaitingAnswer) {
      const awaiting = this.gameState.awaitingAnswer;
      if (awaiting.playerId !== playerId) {
        return { valid: false, error: 'Waiting for the questioning player to answer.' };
      }

      // Only single-card answers allowed
      if (cards.length !== 1) {
        return { valid: false, error: 'Only a single card may be used to answer a question.' };
      }

      const answerCard = cards[0];
      // Ace can always answer; otherwise must be an Answer card of the same suit
      if (this.isAceCard(answerCard)) return { valid: true, message: 'Valid answer (Ace).' };
      if (answerCard.type === 'Answer' && answerCard.suit === awaiting.suit) return { valid: true, message: 'Valid answer.' };

      return { valid: false, error: 'Answer must be a single Answer card of the question suit or an Ace.' };
    }

    // **New Rule: Multi-card play of the same rank**
    if (cards.length > 1) {
      const firstRank = cards[0].rank;
      if (!cards.every(c => c.rank === firstRank)) {
        return { valid: false, error: 'All cards in a multi-card play must have the same rank.' };
      }
    }

    // **Penalty State Validation**
    if (this.gameState.activePenaltyStack > 0) {
      // If a penalty is active, the player must play a matching penalty card (or an Ace).
      // activePenaltyRank uses Rank values like '2','3','JOK'
      const activeRank = this.gameState.activePenaltyRank as any;
      // Ace cancels any active penalty
      if (this.isAceCard(cardToValidate)) {
        return { valid: true, message: 'Ace cancels penalty.' };
      }
      if (cardToValidate.type === 'Penalty' && cardToValidate.rank === activeRank) {
        return { valid: true, message: 'Valid penalty counter-play.' };
      }
      return { valid: false, error: `You must counter the penalty with ${String(activeRank)} or an Ace, or draw.` };
    }
    
    // **Standard Play Validation**
    const topCard = this.getEffectiveTopCard();
    if (!topCard) {
        // This should only happen on the first turn of the game. The first player can play anything.
        return { valid: true, message: 'First move of the game.' };
    }
    
    // Check for required suit (if an Ace was played previously)
    // ACE cards are Wild and should bypass suit requirements
    const requiredSuit = this.gameState.requiredSuit;
    if (requiredSuit && !this.isAceCard(cardToValidate)) {
      if (cardToValidate.suit !== requiredSuit) {
        return { valid: false, error: `Card must be of the declared suit: ${requiredSuit}.` };
      }
    }

    // Standard match
    if (cardToValidate.suit === topCard.suit || cardToValidate.rank === topCard.rank) {
      return { valid: true, message: 'Valid move.' };
    }

    return { valid: false, error: `Card must match the top card's suit (${topCard.suit}) or rank (${topCard.rank}).` };
  }

  // Helper function to check if a card is an ACE
  private isAceCard(card: Card): boolean {
    return card.rank === 'A' || card.type === 'Wild';
  }

  private validateWinCondition(player: Player, cards: Card[]): ValidationResult {
    // Check if this would be a winning move
    if (player.hand.length !== cards.length) {
      return { valid: true, message: 'Not a winning move' };
    }
    
    // **New Rule: No-Ace-Out**
    if (cards.some(c => this.isAceCard(c))) {
        return { valid: false, error: 'Cannot win with an Ace as the final card.' };
    }

    // Winning cards must be valid (Answer cards or Question+Answer)
    const isAnswer = cards.every(c => c.type === 'Answer' || c.type === 'Question');
    if (!isAnswer) {
        return { valid: false, error: 'Final card(s) must be Answer or Question cards.' };
    }

    // Must have declared Niko Kadi in the previous round
    if (this.gameState!.nikoDeclaredBy !== player.id) {
      return { valid: false, error: 'Must declare Niko Kadi before winning', requiresNikoDeclaration: true };
    }
    
    const currentRound = this.getCurrentRound();
    if (this.gameState!.nikoDeclaredRound !== currentRound - 1) {
        return { valid: false, error: 'Niko Kadi must be declared in the immediately preceding round.' };
    }

    return { valid: true, message: 'Valid winning move', canWin: true };
  }

  private getStrategicRecommendation(player: Player, cards: Card[]): string {
    const analysis = this.analyzeGamePosition(player);
    
    if (analysis.criticalMoment) {
      return 'Critical moment - play defensively unless you have a winning move';
    }
    
    if (cards.length > 1) {
      return 'Multi-card play detected - consider saving for strategic advantage';
    }
    
    if (cards[0].rank === 'A') {
      return 'Ace played - choose suit wisely based on hand composition';
    }
    
    if (cards[0].type === 'Answer') {
      return 'Answer card - good for reducing hand size but be mindful of penalties';
    }
    
    return 'Standard play - maintain card advantage';
  }

  public getEffectiveTopCard(): Card | null {
    if (!this.gameState || this.gameState.discardPile.length === 0) {
      return null;
    }
    
    const topCard = this.gameState.discardPile[this.gameState.discardPile.length - 1];
    
    // If there's a required suit from an Ace, the effective top card has that suit
    if (this.gameState.requiredSuit && topCard.rank !== 'A') {
      return {
        ...topCard,
        suit: this.gameState.requiredSuit
      };
    }
    
    return topCard;
  }

  // Advanced Move Validation with strategic analysis
  public getMoveValidation(playerId: string): MoveValidation {
    if (!this.gameState) {
      return { canPlay: false, validCards: [], penalties: 0, counters: [], message: 'Game not initialized' };
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { canPlay: false, validCards: [], penalties: 0, counters: [], message: 'Player not found' };
    }

    const topCard = this.getEffectiveTopCard();
    if (!topCard) {
      return { canPlay: false, validCards: [], penalties: 0, counters: [], message: 'No top card' };
    }

    // Get all valid cards
    const validCards = this.getValidCards(player.hand);
    
    // Analyze multi-card options (only if we have valid cards)
    const multiCardOptions = validCards.length > 0 ? this.getMultiCardOptions(player.hand, topCard) : [];
    
    // Get penalty counters
    const counters = this.getPenaltyCounters(player.hand);
    
    // Calculate penalties
    const penalties = this.gameState.activePenaltyStack;
    
    // Categorize moves
    const winningMoves = validCards.filter(c => c.type === 'Answer');
    const defensiveMoves = validCards.filter(c => ['J', 'K'].includes(c.rank));
    const aggressiveMoves = validCards.filter(c => c.type === 'Answer');
    
    // Calculate strategic score
    const strategicScore = this.calculateStrategicScore(player, validCards);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(player, validCards);
    
    return {
      canPlay: validCards.length > 0,
      validCards,
      penalties,
      counters,
      message: this.getValidationMessage(player, validCards, penalties),
      multiCardOptions,
      winningMoves,
      defensiveMoves,
      aggressiveMoves,
      strategicScore,
      riskLevel
    };
  }

  private getMultiCardOptions(hand: Card[], topCard: Card): Card[][] {
    const options: Card[][] = [];
    const rankGroups: Record<string, Card[]> = {};
    
    // Group cards by rank
    hand.forEach(card => {
      if (!rankGroups[card.rank]) {
        rankGroups[card.rank] = [];
      }
      rankGroups[card.rank].push(card);
    });
    
    // Find valid multi-card combinations
    Object.values(rankGroups).forEach(group => {
      if (group.length >= 2) {
        // ACE CAN ALWAYS BE PLAYED - Kenyan Kadi rule
        if (group[0].rank === 'A') {
          options.push(group.slice(0, Math.min(group.length, 4))); // Max 4 cards
          return; // Skip further checks for Aces
        }
        
        const suitMatch = group[0].suit === topCard.suit;
        const rankMatch = group[0].rank === topCard.rank;
        
        if (suitMatch || rankMatch) {
          options.push(group.slice(0, Math.min(group.length, 4))); // Max 4 cards
        }
      }
    });
    
    return options;
  }

  private getPenaltyCounters(hand: Card[]): Card[] {
    return hand.filter(card => 
      card.rank === 'A' || 
      (card.rank === '2' && this.gameState!.activePenaltyRank === '2') ||
      (card.rank === '3' && this.gameState!.activePenaltyRank === '3') ||
      (card.rank === 'JOK' && this.gameState!.activePenaltyRank === 'JOK')
    );
  }

  private calculateStrategicScore(player: Player, validCards: Card[]): number {
    let score = 0;
    
    // Hand size advantage
    score += (10 - player.hand.length) * 2;
    
    // Special control cards (J, K)
    score += validCards.filter(c => ['J','K'].includes(c.rank)).length * 3;
    
    // Answer (winning) cards
    score += validCards.filter(c => c.type === 'Answer').length * 2;
    
    // Multi-card potential
    const rankGroups: Record<string, number> = {};
    player.hand.forEach(card => {
      rankGroups[card.rank] = (rankGroups[card.rank] || 0) + 1;
    });
    Object.values(rankGroups).forEach(count => {
      if (count >= 2) score += count;
    });
    
    return Math.min(score, 100);
  }

  private assessRiskLevel(player: Player, validCards: Card[]): 'low' | 'medium' | 'high' {
    const handSize = player.hand.length;
    const penaltyStack = this.gameState!.activePenaltyStack;
    
    if (handSize <= 2) return 'high';
    if (penaltyStack >= 5) return 'high';
    if (handSize <= 4 || penaltyStack >= 3) return 'medium';
    return 'low';
  }

  private getValidationMessage(player: Player, validCards: Card[], penalties: number): string {
    if (validCards.length === 0) {
      return penalties > 0 ? `Must draw ${penalties} penalty cards` : 'No valid cards - must draw';
    }
    
    if (penalties > 0) {
      return `Can play or draw ${penalties} penalty cards`;
    }
    
    return `${validCards.length} valid card(s) available`;
  }

  // Get playable cards for a player
  public getValidCards(hand: Card[]): Card[] {
    if (!this.gameState) return [];
    
    const topCard = this.getEffectiveTopCard();
    if (!topCard) return [];
    
    console.log(`GAME ENGINE: getValidCards called with hand: [${hand.map(c => `${c.rank}${c.suit}`).join(', ')}], top card: ${topCard.rank}${topCard.suit}`);
    
    // Check if there's an active penalty stack (2 or 3 cards)
    const hasActivePenalty = this.gameState.activePenaltyStack > 0;
    const penaltyRank = this.gameState.activePenaltyRank;
    
    const validCards = hand.filter(card => {
      // **ACE CARD OVERRIDE - ACE CAN ALWAYS BE PLAYED**
      if (this.isAceCard(card)) {
        console.log(`GAME ENGINE: Ace ${card.rank}${card.suit} is always playable`);
        return true;
      }
      
      // If there's an active penalty, only allow penalty counters or Ace
      if (hasActivePenalty && penaltyRank) {
        // Only allow cards of the same penalty rank to counter
        if (penaltyRank === '2' && card.rank === '2') {
          return true;
        }
        if (penaltyRank === '3' && card.rank === '3') {
          return true;
        }
        if (penaltyRank === 'JOK' && card.rank === 'JOK') {
          return true;
        }
        // All other cards are not playable during penalty
        return false;
      }
      
      // Normal play: check if card matches suit or rank
      // Use actual top card suit, not effective suit (ACE should override suit requirements)
      if (!this.gameState || !this.gameState.discardPile || this.gameState.discardPile.length === 0) return false;
      const actualTopCard = this.gameState.discardPile[this.gameState.discardPile.length - 1];
      if (!actualTopCard) return false;
      
      const suitMatch = card.suit === actualTopCard.suit;
      const rankMatch = card.rank === actualTopCard.rank;
      return suitMatch || rankMatch;
    });
    
    // Debug: Log penalty and Ace detection
    const aceCards = validCards.filter(c => c.rank === 'A');
    const penaltyCards = validCards.filter(c => c.rank === '2' || c.rank === '3' || c.rank === 'JOK');
    console.log(`GAME ENGINE DEBUG: Found ${aceCards.length} Ace cards, ${penaltyCards.length} penalty cards. Active penalty: ${hasActivePenalty}, Penalty rank: ${penaltyRank}`);
    
    return validCards;
  }

  // Game Actions - Kenyan Kadi rules
  // Advanced Game Actions with comprehensive effects
  public playCard(playerId: string, cardIds: string[], declaredSuit?: Suit): GameMove {
    console.log(`GAME ENGINE: playCard called by ${playerId} with cards ${cardIds.join(',')} declaredSuit=${declaredSuit}`);
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const validation = this.validateMove(playerId, cardIds);
    console.log('GAME ENGINE: validateMove result', validation);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid move');
    }

    const player = this.gameState.players.find(p => p.id === playerId)!;
    const cards = cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as Card[];
    
    // Create move record before modifying state
    const move: GameMove = {
      playerId,
      cardsPlayed: cards,
      action: cards.length > 1 ? 'multi_play' : 'play',
      timestamp: new Date(),
      declaredSuit,
    };

    // Remove cards from player's hand
    player.hand = player.hand.filter(c => !cardIds.includes(c.id));

    // Add cards to discard pile
    this.gameState.discardPile.push(...cards);
    
    // Apply card effects and determine if the turn should advance
    const turnShouldAdvance = this.applyCardEffects(player, cards, declaredSuit);

    // Check for win condition
    if (player.hand.length === 0) {
      const winValidation = this.validateWinCondition(player, cards);
      if (winValidation.valid) {
        this.gameState.winner = playerId;
        this.gameState.status = 'finished';
        // Game ends, no more moves.
        return move;
      }
    }

    // Advance turn if not handled by a special effect (like a Question)
    if (turnShouldAdvance) {
      this.advanceTurn();
    }
    
    this.gameState.updatedAt = new Date();
    this.moveHistory.push(move);
    return move;
  }

  private applyCardEffects(player: Player, cards: Card[], declaredSuit?: Suit): boolean {
    if (!this.gameState) return false;

    const card = cards[0]; // In multi-play, all cards have the same rank and thus same effect type.

    // Handle "No-Ace-Out" rule consequence
    if (this.gameState.mustDrawNextTurn === player.id) {
        // This player was supposed to draw, but they played. This case should be handled by validation.
        // For safety, we clear the flag and let the move proceed, but log a warning.
        console.warn(`Player ${player.id} played a card when they were required to draw due to the No-Ace-Out rule.`);
        this.gameState.mustDrawNextTurn = null;
    }
    
    // Handle "Awaiting Answer" state
    if (this.gameState.awaitingAnswer?.playerId === player.id) {
        // Player is answering a question.
        const requiredSuit = this.gameState.awaitingAnswer.suit;
        if (this.isAceCard(card) || (card.type === 'Answer' && card.suit === requiredSuit)) {
            this.gameState.awaitingAnswer = null; // Question answered successfully.
            this.gameState.requiredSuit = null; // Clear any suit requirement.
            return true; // Turn advances.
        }
        // If the played card is not a valid answer, this should have been caught by validation.
    }

    // --- Main Card Effect Logic ---
    switch (card.type) {
      case 'Penalty':
        const penaltyValue = card.rank === 'JOK' ? 5 : parseInt(card.rank);
        const totalPenalty = penaltyValue * cards.length;
        this.gameState.activePenaltyStack += totalPenalty;
        this.gameState.activePenaltyRank = card.rank;
        this.gameState.requiredSuit = null; // Penalties reset suit requirements
        return true; // Turn advances

      case 'Wild': // Ace
        // If there's a penalty, the Ace cancels it.
        if (this.gameState.activePenaltyStack > 0) {
          this.gameState.activePenaltyStack = 0;
          this.gameState.activePenaltyRank = null;
        }
        // If this is the player's last card, trigger the "No-Ace-Out" rule
        if (player.hand.length === 0) {
            this.gameState.mustDrawNextTurn = player.id;
        }
        this.gameState.requiredSuit = declaredSuit || null;
        return true; // Turn advances

      case 'Jump':
        this.gameState.pendingSkipCount = (this.gameState.pendingSkipCount || 0) + cards.length;
        this.gameState.requiredSuit = null;
        return true; // Turn advances

      case 'Kickback':
        for (let i = 0; i < cards.length; i++) {
          this.gameState.direction = this.gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
        }
        this.gameState.requiredSuit = null;
        return true; // Turn advances
      
      case 'Question':
        // New rule: Same player must answer.
        this.gameState.awaitingAnswer = { playerId: player.id, suit: card.suit as Suit };
        this.gameState.requiredSuit = null;
        return false; // Turn does NOT advance.

      case 'Answer':
        this.gameState.requiredSuit = null; // An answer card fulfills the suit requirement
        return true; // Turn advances

      default:
        return true; // Turn advances
    }
  }
  
  public drawCard(playerId: string): GameMove {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (this.gameState.players[this.gameState.currentPlayerIndex].id !== playerId) {
      throw new Error('Not your turn');
    }

    // Handle drawing due to "No-Ace-Out"
    if (this.gameState.mustDrawNextTurn === playerId) {
        this.gameState.mustDrawNextTurn = null; // Fulfill the obligation
        // Player draws 1 card and their turn ends
        const drawnCard = this.drawSingleCard(player);
        const move: GameMove = { playerId, cardsPlayed: drawnCard ? [drawnCard] : [], action: 'draw', timestamp: new Date() };
        this.advanceTurn();
        return move;
    }
    
    // Handle drawing because they can't answer a question
    if (this.gameState.awaitingAnswer?.playerId === playerId) {
        this.gameState.awaitingAnswer = null; // Forfeit answering
        const drawnCard = this.drawSingleCard(player);
        const move: GameMove = { playerId, cardsPlayed: drawnCard ? [drawnCard] : [], action: 'draw', timestamp: new Date() };
        this.advanceTurn();
        return move;
    }

    // Handle drawing for a penalty
    let cardsToDraw = 1;
    if (this.gameState.activePenaltyStack > 0) {
      cardsToDraw = this.gameState.activePenaltyStack;
      this.gameState.activePenaltyStack = 0;
      this.gameState.activePenaltyRank = null;
    }

    const drawnCards: Card[] = [];
    for (let i = 0; i < cardsToDraw; i++) {
        const card = this.drawSingleCard(player);
        if (card) drawnCards.push(card);
    }

    const move: GameMove = {
      playerId,
      cardsPlayed: drawnCards,
      action: 'draw',
      timestamp: new Date()
    };

    // Drawing always clears any required suit.
    this.gameState.requiredSuit = null;

    this.advanceTurn();
    this.gameState.updatedAt = new Date();
    return move;
  }
  
  private drawSingleCard(player: Player): Card | null {
      if (!this.gameState) return null;
      if (this.gameState.drawPile.length === 0) {
        this.reshuffleDeck();
      }
      if (this.gameState.drawPile.length > 0) {
        const card = this.gameState.drawPile.pop()!;
        player.hand.push(card);
        return card;
      }
      return null;
  }
  
  private advanceTurn(): void {
    if (!this.gameState) return;
    const direction = this.gameState.direction === 'clockwise' ? 1 : -1;
    let nextPlayerIndex = this.gameState.currentPlayerIndex;

    // Apply skips
    const skips = this.gameState.pendingSkipCount || 0;
    console.log(`GAME ENGINE: advanceTurn current=${this.gameState.currentPlayerIndex} skips=${skips} direction=${this.gameState.direction}`);
    this.gameState.pendingSkipCount = 0;
    
    // Calculate the next player index, including skips
    const totalPlayers = this.gameState.players.length;
    nextPlayerIndex = (nextPlayerIndex + direction * (1 + skips) + totalPlayers) % totalPlayers;

    console.log(`GAME ENGINE: advanceTurn newIndex=${nextPlayerIndex}`);
    this.gameState.currentPlayerIndex = nextPlayerIndex;
    this.gameState.turnNumber = (this.gameState.turnNumber || 1) + 1;
    
    // Check if the new current player must draw due to the No-Ace-Out rule.
    const nextPlayer = this.gameState.players[nextPlayerIndex];
    if (this.gameState.mustDrawNextTurn === nextPlayer.id) {
      // If it's an AI, make them draw automatically.
      if (nextPlayer.isAI) {
        this.drawCard(nextPlayer.id);
      }
      // If it's a human, the UI should prompt them to draw.
    }
  }

  private reshuffleDeck(): void {
    if (!this.gameState) return;

    // Keep top card of discard pile
    const topCard = this.gameState.discardPile.pop()!;
    
    // Move all other cards to draw pile
    this.gameState.drawPile = this.gameState.discardPile;
    this.gameState.discardPile = [topCard];
    
    // Shuffle draw pile
    for (let i = this.gameState.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.gameState.drawPile[i], this.gameState.drawPile[j]] = [this.gameState.drawPile[j], this.gameState.drawPile[i]];
    }
  }

  public declareNikoKadi(playerId: string): GameMove {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (this.gameState.currentPlayerIndex !== this.gameState.players.findIndex(p => p.id === playerId)) {
      throw new Error('Not your turn');
    }

    if (this.gameState.nikoDeclaredBy) {
      throw new Error('Niko Kadi already declared');
    }

    this.gameState.nikoDeclaredBy = playerId;
    this.gameState.nikoDeclaredRound = this.getCurrentRound();

    const move: GameMove = {
      playerId,
      cardsPlayed: [],
      action: 'declare',
      timestamp: new Date()
    };

    this.gameState.updatedAt = new Date();
    return move;
  }

  private getCurrentRound(): number {
    if (!this.gameState) return 0;

    const turnNumber = this.gameState.turnNumber || 1;
    return Math.floor((turnNumber - 1) / this.gameState.players.length) + 1;
  }

  private checkWinCondition(playerId: string, winningMoveCards: Card[]): void {
    if (!this.gameState) return;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || player.hand.length !== 0) return;

    // Cannot win if any other player has zero cards
    const anyOtherCardless = this.gameState.players.some(p => p.id !== playerId && p.hand.length === 0);
    if (anyOtherCardless) {
      this.gameState.status = 'finished';
      this.gameState.winner = null;
      return;
    }

    // Must have declared Niko Kadi in the previous round
    if (this.gameState.nikoDeclaredBy !== playerId) {
      this.gameState.status = 'finished';
      this.gameState.winner = null;
      return;
    }

    const currentRound = this.getCurrentRound();
    if (this.gameState.nikoDeclaredRound == null || this.gameState.nikoDeclaredRound !== currentRound - 1) {
      this.gameState.status = 'finished';
      this.gameState.winner = null;
      return;
    }

    // Check if winning cards are valid (Answer cards or Question+Answer combos)
    const hasInvalidCards = winningMoveCards.some(c => !(c.type === 'Answer' || c.type === 'Question'));
    if (hasInvalidCards) {
      this.gameState.status = 'finished';
      this.gameState.winner = null;
      return;
    }

    // Check if questions have matching answers
    const questions = winningMoveCards.filter(c => c.rank === '8' || c.rank === 'Q');
    const answers = winningMoveCards.filter(c => c.type === 'Answer');
    
    for (const question of questions) {
      const hasMatchingAnswer = answers.some(a => a.suit === question.suit);
      if (!hasMatchingAnswer) {
        this.gameState.status = 'finished';
        this.gameState.winner = null;
        return;
      }
    }

    this.gameState.winner = playerId;
    this.gameState.status = 'finished';
  }

  // Basic game analysis helper (lightweight implementation)
  public analyzeGamePosition(player: Player): GameAnalysis {
    if (!this.gameState) {
      return { winningProbability: {}, threatAssessment: {}, recommendedMoves: {}, psychologicalAdvantage: {}, gamePhase: 'early', criticalMoment: false };
    }

    const winningProbability: Record<string, number> = {};
    this.gameState.players.forEach(p => {
      winningProbability[p.id] = p.hand.length === 0 ? 1 : Math.max(0, 1 - p.hand.length / 10);
    });

    return {
      winningProbability,
      threatAssessment: {},
      recommendedMoves: {},
      psychologicalAdvantage: {},
      gamePhase: this.gameState.gamePhase,
      criticalMoment: false
    };
  }

  // Simple heuristic for winning probability used by AI
  private calculateWinningProbability(player: Player): number {
    if (!this.gameState) return 0;
    if (player.hand.length === 0) return 1;
    if (player.hand.length === 1) return 0.8;
    if (player.hand.length === 2) return 0.5;
    return Math.max(0.05, 1 - player.hand.length / 10);
  }

  // Validate multi-card play according to same-rank rule and top card
  private validateMultiCardPlay(cards: Card[], topCard: Card): ValidationResult {
    if (cards.length < 2) return { valid: false, error: 'Multi-card play requires at least 2 cards' };
    const rank = cards[0].rank;
    if (!cards.every(c => c.rank === rank)) return { valid: false, error: 'All cards must share the same rank' };

    // First card must be playable relative to top card (or be Ace)
    const first = cards[0];
    if (this.isAceCard(first)) return { valid: true, message: 'Valid multi-Ace play' };
    if (first.suit === topCard.suit || first.rank === topCard.rank) return { valid: true, message: 'Valid multi-card play' };
    return { valid: false, error: 'First card in multi-play must match top card suit or rank' };
  }

  // Convenience wrappers used by UI/tests
  public getPlayableCards(player: Player): Card[] {
    return this.getValidCards(player.hand);
  }

  public playCards(playerId: string, cardIds: string[], declaredSuit?: Suit): GameMove {
    return this.playCard(playerId, cardIds, declaredSuit);
  }

  public runAITurn(playerId: string): GameMove | null {
    return this.executeAITurn(playerId);
  }

  // Advanced AI System with strategic intelligence
  public getAIMove(playerId: string): GameMove | null {
    if (!this.gameState) {
      console.log('AI: Game state not initialized');
      return null;
    }

    const player = this.gameState.players.find(p => p.id === playerId && p.isAI);
    if (!player) {
      console.log('AI: Player not found or not AI');
      return null;
    }

    // Check if it's actually this player's turn
    const currentPlayerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (this.gameState.currentPlayerIndex !== currentPlayerIndex) {
      console.log(`AI: Not ${player.name}'s turn. Current player: ${this.gameState.players[this.gameState.currentPlayerIndex].name}`);
      return null;
    }

    const topCard = this.getEffectiveTopCard();
    if (!topCard) {
      console.log('AI: No top card found');
      return null;
    }

    // Get AI configuration
    const aiConfig = player.aiConfig || {
      difficulty: 'medium',
      playStyle: 'balanced',
      aggression: 0.5,
      cardCountingSkill: 0.7,
      bluffingTendency: 0.3
    };

    try {
      console.log(`AI ${player.name} starting turn with ${player.hand.length} cards. Top card: ${topCard.rank}${topCard.suit}`);
      
      // Get move validation with strategic analysis
      const moveValidation = this.getMoveValidation(playerId);
      console.log(`AI ${player.name} validation: canPlay=${moveValidation.canPlay}, validCards=${moveValidation.validCards?.length || 0}`);
      
      if (!moveValidation.canPlay) {
        console.log(`AI ${player.name} cannot play, drawing card`);
        const drawMove = this.drawCard(playerId);
        console.log(`AI ${player.name} completed draw, new hand size: ${player.hand.length}`);
        return drawMove;
      }

      // Select strategy based on difficulty and game phase
      const strategy = this.selectAIStrategy(player, aiConfig, moveValidation);
      console.log(`AI ${player.name} selected strategy: ${strategy}`);
      
      // Execute strategy
      const move = this.executeAIStrategy(player, strategy, moveValidation, aiConfig);
      
      // Ensure the move is actually executed and turn advances
      if (move) {
        console.log(`AI ${player.name} executed move: ${move.action} with ${move.cardsPlayed.length} cards. New hand size: ${player.hand.length}`);
        console.log(`AI ${player.name} turn completed, next player: ${this.gameState.players[this.gameState.currentPlayerIndex].name}`);
        return move;
      }
      
      // Fallback to draw if strategy execution fails
      console.log(`AI ${player.name} strategy failed, drawing card`);
      const fallbackMove = this.drawCard(playerId);
      console.log(`AI ${player.name} fallback draw completed, new hand size: ${player.hand.length}`);
      return fallbackMove;
    } catch (error) {
      console.error(`AI ${player.name} move execution failed:`, error);
      // Fallback to simple draw card
      console.log(`AI ${player.name} emergency fallback draw`);
      const emergencyMove = this.drawCard(playerId);
      console.log(`AI ${player.name} emergency draw completed, new hand size: ${player.hand.length}`);
      return emergencyMove;
    }
  }

  private selectAIStrategy(player: Player, aiConfig: any, moveValidation: MoveValidation): string {
    const gamePhase = this.gameState!.gamePhase;
    const handSize = player.hand.length;
    const riskLevel = moveValidation.riskLevel;
    
    // Early game: conservative play
    if (gamePhase === 'early') {
      return aiConfig.playStyle === 'aggressive' ? 'aggressive_early' : 'conservative_early';
    }
    
    // Mid game: balanced approach
    if (gamePhase === 'mid') {
      return 'balanced_mid';
    }
    
    // Late game: high stakes
    if (gamePhase === 'late' || gamePhase === 'endgame') {
      if (handSize <= 2) return 'desperate_endgame';
      if (riskLevel === 'high') return 'defensive_late';
      return 'aggressive_late';
    }
    
    return 'balanced';
  }

  private executeAIStrategy(player: Player, strategy: string, moveValidation: MoveValidation, aiConfig: any): GameMove {
    try {
      switch (strategy) {
        case 'aggressive_early':
          return this.aggressiveEarlyStrategy(player, moveValidation);
        
        case 'conservative_early':
          return this.conservativeEarlyStrategy(player, moveValidation);
        
        case 'balanced_mid':
          return this.balancedMidStrategy(player, moveValidation);
        
        case 'aggressive_late':
          return this.aggressiveLateStrategy(player, moveValidation);
        
        case 'defensive_late':
          return this.defensiveLateStrategy(player, moveValidation);
        
        case 'desperate_endgame':
          return this.desperateEndgameStrategy(player, moveValidation);
        
        default:
          return this.balancedMidStrategy(player, moveValidation);
      }
    } catch (error) {
      console.error('AI strategy execution failed:', error);
      // Fallback to simple AI
      return this.simpleAIFallback(player, moveValidation);
    }
  }

  private simpleAIFallback(player: Player, moveValidation: MoveValidation): GameMove {
    // Very simple AI: just play any valid card or draw
    if (moveValidation.validCards && moveValidation.validCards.length > 0) {
      const card = moveValidation.validCards[0];
      
      // Handle Ace suit declaration
      if (card.rank === 'A') {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        return this.playCard(player.id, [card.id], randomSuit);
      }
      
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private aggressiveEarlyStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // Try multi-card plays first
    if (moveValidation.multiCardOptions && moveValidation.multiCardOptions.length > 0) {
      const multiCardOption = moveValidation.multiCardOptions[0];
      return this.playCard(player.id, multiCardOption.map(c => c.id));
    }
    
    // Play feeding cards aggressively
    if (moveValidation.aggressiveMoves && moveValidation.aggressiveMoves.length > 0) {
      const card = moveValidation.aggressiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Play special cards strategically
    if (moveValidation.defensiveMoves && moveValidation.defensiveMoves.length > 0) {
      const card = moveValidation.defensiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Default to winning cards
    if (moveValidation.winningMoves && moveValidation.winningMoves.length > 0) {
      const card = moveValidation.winningMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private conservativeEarlyStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // Save special cards, play winning cards
    if (moveValidation.winningMoves && moveValidation.winningMoves.length > 0) {
      const card = moveValidation.winningMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Play feeding cards conservatively
    if (moveValidation.aggressiveMoves && moveValidation.aggressiveMoves.length > 0) {
      const card = moveValidation.aggressiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Use special cards only when necessary
    if (moveValidation.defensiveMoves && moveValidation.defensiveMoves.length > 0) {
      const card = moveValidation.defensiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private balancedMidStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // Consider Niko Kadi declaration
    if (player.hand.length <= 3 && !this.gameState!.nikoDeclaredBy) {
      const winningProbability = this.calculateWinningProbability(player);
      if (winningProbability > 0.7) {
        this.declareNikoKadi(player.id);
      }
    }
    
    // Multi-card plays for advantage
    if (moveValidation.multiCardOptions && moveValidation.multiCardOptions.length > 0 && Math.random() < 0.6) {
      const multiCardOption = moveValidation.multiCardOptions[0];
      return this.playCard(player.id, multiCardOption.map(c => c.id));
    }
    
    // Balanced card selection
    const allValidCards = moveValidation.validCards || [];
    if (allValidCards.length > 0) {
      // Prioritize based on strategic value
      const sortedCards = allValidCards.sort((a, b) => {
        const valueA = this.calculateCardStrategicValue(a, player);
        const valueB = this.calculateCardStrategicValue(b, player);
        return valueB - valueA;
      });
      
      const selectedCard = sortedCards[0];
      
      // Handle Ace suit declaration
      if (selectedCard.rank === 'A') {
        const bestSuit = this.chooseBestSuit(player.hand);
        return this.playCard(player.id, [selectedCard.id], bestSuit);
      }
      
      return this.playCard(player.id, [selectedCard.id]);
    }
    
    return this.drawCard(player.id);
  }

  private aggressiveLateStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // High risk, high reward plays
    if (moveValidation.multiCardOptions && moveValidation.multiCardOptions.length > 0) {
      const largestMultiCard = moveValidation.multiCardOptions.reduce((largest, current) => 
        current.length > largest.length ? current : largest
      );
      return this.playCard(player.id, largestMultiCard.map(c => c.id));
    }
    
    // Use special cards for maximum impact
    if (moveValidation.defensiveMoves && moveValidation.defensiveMoves.length > 0) {
      const card = moveValidation.defensiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Play any valid card aggressively
    if (moveValidation.validCards && moveValidation.validCards.length > 0) {
      const card = moveValidation.validCards[0];
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private defensiveLateStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // Avoid risky plays
    if (moveValidation.winningMoves && moveValidation.winningMoves.length > 0) {
      const card = moveValidation.winningMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Use defensive special cards
    if (moveValidation.defensiveMoves && moveValidation.defensiveMoves.length > 0) {
      const card = moveValidation.defensiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Conservative feeding cards
    if (moveValidation.aggressiveMoves && moveValidation.aggressiveMoves.length > 0) {
      const card = moveValidation.aggressiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private desperateEndgameStrategy(player: Player, moveValidation: MoveValidation): GameMove {
    // Try to win at all costs
    if (moveValidation.winningMoves && moveValidation.winningMoves.length > 0) {
      const card = moveValidation.winningMoves[0];
      
      // Check if this is a winning move
      if (player.hand.length === 1) {
        // Declare Niko Kadi if needed
        if (!this.gameState!.nikoDeclaredBy) {
          this.declareNikoKadi(player.id);
        }
      }
      
      return this.playCard(player.id, [card.id]);
    }
    
    // Use any special cards to change the game state
    if (moveValidation.defensiveMoves && moveValidation.defensiveMoves.length > 0) {
      const card = moveValidation.defensiveMoves[0];
      return this.playCard(player.id, [card.id]);
    }
    
    // Play anything valid
    if (moveValidation.validCards && moveValidation.validCards.length > 0) {
      const card = moveValidation.validCards[0];
      return this.playCard(player.id, [card.id]);
    }
    
    return this.drawCard(player.id);
  }

  private calculateCardStrategicValue(card: Card, player: Player): number {
    let value = 0;
    
    // Base value by type/rank
    if (card.type === 'Answer') value += 2;
    if (card.rank === 'J' || card.rank === 'K') value += 3;
    if (this.isAceCard(card)) value += 4; // Aces are powerful
    
    // Game phase adjustments
    const gamePhase = this.gameState!.gamePhase;
    if (gamePhase === 'late' || gamePhase === 'endgame') {
      if (card.type === 'Answer') value += 2;
    }
    
    // Hand size considerations
    if (player.hand.length <= 3) {
      if (card.type === 'Answer') value += 3;
      if (card.rank === 'J' || card.rank === 'K') value += 1;
    }
    
    // Penalty considerations
    if (this.gameState!.activePenaltyStack > 0) {
      if (card.rank === 'A') value += 5; // Ace can cancel penalties
    }
    
    return value;
  }

  private chooseBestSuit(hand: Card[]): Suit {
    const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
    
    hand.forEach(card => {
      if (card.suit !== 'joker') {
        suitCounts[card.suit as Suit]++;
      }
    });
    
    return (Object.keys(suitCounts) as Suit[]).reduce((best, suit) => 
      suitCounts[suit] > suitCounts[best] ? suit : best
    , 'hearts' as Suit);
  }

  // Advanced Getters and UI Integration
  public getGameState(): GameState | null {
    return this.gameState;
  }

  public setGameState(gameState: GameState | null): void {
    this.gameState = gameState;
  }

  public getCurrentPlayer(): Player | null {
    if (!this.gameState) return null;
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  public getTopCard(): Card | null {
    if (!this.gameState || this.gameState.discardPile.length === 0) return null;
    return this.gameState.discardPile[this.gameState.discardPile.length - 1];
  }

  // UI Popup Integration
  public getRequiredPopup(playerId: string): PopupConfig | null {
    if (!this.gameState) return null;
    
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return null;
    
    // Check for suit selection (after playing Ace)
    if (this.gameState.requiredSuit === null && this.moveHistory.length > 0) {
      const lastMove = this.moveHistory[this.moveHistory.length - 1];
      if (lastMove.playerId === playerId && lastMove.cardsPlayed.some(c => c.rank === 'A')) {
        return {
          type: 'suit_selection',
          title: 'Choose Suit',
          message: 'You played an Ace! Choose the suit for the next player.',
          options: [
            { label: '♥ Hearts', action: 'declare_suit', value: 'hearts' },
            { label: '♦ Diamonds', action: 'declare_suit', value: 'diamonds' },
            { label: '♣ Clubs', action: 'declare_suit', value: 'clubs' },
            { label: '♠ Spades', action: 'declare_suit', value: 'spades' }
          ]
        };
      }
    }
    
    // Check for Niko Kadi declaration opportunity
    if (player.hand.length <= 3 && !this.gameState.nikoDeclaredBy) {
      const winningProbability = this.calculateWinningProbability(player);
      if (winningProbability > 0.6) {
        return {
          type: 'niko_declaration',
          title: 'Niko Kadi',
          message: 'You have a good chance of winning! Declare Niko Kadi?',
          options: [
            { label: 'Declare Niko Kadi', action: 'declare_niko' },
            { label: 'Wait', action: 'pass' }
          ]
        };
      }
    }
    
    // Check for penalty response
    if (this.gameState.activePenaltyStack > 0) {
      const counters = this.getPenaltyCounters(player.hand);
      if (counters.length > 0) {
        return {
          type: 'penalty_response',
          title: 'Penalty Alert',
          message: `You must draw ${this.gameState.activePenaltyStack} cards or play a counter.`,
          options: [
            { label: `Draw ${this.gameState.activePenaltyStack} cards`, action: 'draw' },
            { label: 'Play Counter', action: 'play_counter' }
          ]
        };
      }
    }
    
    // Check for multi-card confirmation
    const validCards = this.getValidCards(player.hand);
    const multiCardOptions = this.getMultiCardOptions(player.hand, this.getEffectiveTopCard()!);
    if (multiCardOptions.length > 0) {
      return {
        type: 'multi_card_confirmation',
        title: 'Multi-Card Play',
        message: `You can play ${multiCardOptions[0].length} cards of the same rank!`,
        options: [
          { label: `Play ${multiCardOptions[0].length} cards`, action: 'multi_play', value: multiCardOptions[0] },
          { label: 'Play Single Card', action: 'single_play' }
        ]
      };
    }
    
    // Strategic advice for human players
    if (!player.isAI && player.hand.length <= 5) {
      const analysis = this.analyzeGamePosition(player);
      if (analysis.criticalMoment) {
        return {
          type: 'strategic_advice',
          title: 'Strategic Advice',
          message: 'Critical moment! Consider playing defensively unless you have a winning move.',
          timeout: 5000
        };
      }
    }
    
    return null;
  }

  // Game Analysis and Statistics
  public getGameAnalysis(): GameAnalysis {
    if (!this.gameState) {
      return {
        winningProbability: {},
        threatAssessment: {},
        recommendedMoves: {},
        psychologicalAdvantage: {},
        gamePhase: 'early',
        criticalMoment: false
      };
    }
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return {
        winningProbability: {},
        threatAssessment: {},
        recommendedMoves: {},
        psychologicalAdvantage: {},
        gamePhase: 'early',
        criticalMoment: false
      };
    }
    
    return this.analyzeGamePosition(currentPlayer);
  }

  // Advanced Game Actions
  public playMultiCard(playerId: string, cardIds: string[], declaredSuit?: Suit): GameMove {
    return this.playCard(playerId, cardIds, declaredSuit);
  }

  public counterPlay(playerId: string, cardId: string): GameMove {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Check if this is a valid counter
    const counters = this.getPenaltyCounters(player.hand);
    const counterCard = counters.find(c => c.id === cardId);
    
    if (!counterCard) {
      throw new Error('Invalid counter card');
    }

    // Play the counter
    const move = this.playCard(playerId, [cardId]);
    move.action = 'counter';
    
    return move;
  }

  public passTurn(playerId: string): GameMove {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (this.gameState.currentPlayerIndex !== this.gameState.players.findIndex(p => p.id === playerId)) {
      throw new Error('Not your turn');
    }

    const move: GameMove = {
      playerId,
      cardsPlayed: [],
      action: 'pass',
      timestamp: new Date()
    };

    this.advanceTurn();
    this.gameState.updatedAt = new Date();
    
    return move;
  }

  // Game State Export/Import for Multiplayer
  public exportGameState(): string {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const exportData = {
      gameState: this.gameState,
      cardCountingState: this.cardCountingState,
      psychologicalProfiles: Object.fromEntries(this.psychologicalProfiles),
      moveHistory: this.moveHistory,
      eventLog: this.eventLog
    };

    return JSON.stringify(exportData);
  }

  public importGameState(data: string): void {
    try {
      const importData = JSON.parse(data);
      
      this.gameState = importData.gameState;
      this.cardCountingState = importData.cardCountingState;
      this.psychologicalProfiles = new Map(Object.entries(importData.psychologicalProfiles));
      this.moveHistory = importData.moveHistory || [];
      this.eventLog = importData.eventLog || [];
    } catch (error) {
      throw new Error('Invalid game state data');
    }
  }

  // Public method to execute AI turn (for debugging and external calls)
  public executeAITurn(playerId: string): GameMove | null {
    try {
      // Double-check if it's actually this AI's turn
      if (!this.gameState) return null;
      
      const currentPlayerIndex = this.gameState.players.findIndex(p => p.id === playerId);
      if (this.gameState.currentPlayerIndex !== currentPlayerIndex) {
        console.log(`AI ${playerId} tried to play but it's not their turn. Current player: ${this.gameState.players[this.gameState.currentPlayerIndex].id}`);
        return null;
      }
      
      const move = this.getAIMove(playerId);
      if (move) {
        // Ensure the move is recorded and game state is updated
        this.moveHistory.push(move);
        this.gameState.updatedAt = new Date();
        console.log(`AI ${playerId} executed move:`, move.action, move.cardsPlayed.length, 'cards');
      }
      return move;
    } catch (error) {
      console.error('Failed to execute AI turn:', error);
      // Force advance turn to prevent game from getting stuck
      this.advanceTurn();
      return null;
    }
  }

  // Helper method to check if it's a player's turn
  public isPlayerTurn(playerId: string): boolean {
    if (!this.gameState) return false;
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    return this.gameState.currentPlayerIndex === playerIndex;
  }

  // Get valid multi-card combinations for a player
  public getValidMultiCardCombinations(playerId: string): Card[][] {
    if (!this.gameState) return [];
    
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return [];
    
    const topCard = this.getEffectiveTopCard();
    if (!topCard) return [];
    
    return this.getMultiCardOptions(player.hand, topCard);
  }

  // Check if a specific card combination is valid for multi-card play
  public isValidMultiCardCombination(playerId: string, cardIds: string[]): boolean {
    if (!this.gameState) return false;
    
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return false;
    
    const cards = cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (cards.length < 2) return false;
    
    const topCard = this.getEffectiveTopCard();
    if (!topCard) return false;
    
    const validation = this.validateMultiCardPlay(cards, topCard);
    return validation.valid;
  }

  // Get cards that can be added to current selection based on the new "same rank" multi-play rule.
  public getCardsThatCanBeAdded(playerId: string, currentSelection: Card[]): Card[] {
    if (!this.gameState) return [];
    
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return [];
    
    // If no card is selected yet, return all individually playable cards.
    if (currentSelection.length === 0) {
      return this.getValidCards(player.hand);
    }
    
    const firstCardRank = currentSelection[0].rank;
    
    // According to the new rules, any card of the same rank can be played together.
    // Therefore, we only need to find other cards in the hand with the same rank.
    return player.hand.filter(card => 
      card.rank === firstCardRank && 
      !currentSelection.some(selected => selected.id === card.id)
    );
  }

  // Game Reset
  public resetGame(): void {
    this.gameState = null;
    this.cardCountingState = this.initializeCardCounting();
    this.psychologicalProfiles.clear();
    this.moveHistory = [];
    this.eventLog = [];
  }

  // Statistics and Analytics
  public getGameStatistics(): any {
    if (!this.gameState) return null;

    return {
      totalMoves: this.moveHistory.length,
      totalEvents: this.eventLog.length,
      averageTurnTime: this.calculateAverageTurnTime(),
      mostPlayedCard: this.getMostPlayedCard(),
      penaltyStacksTriggered: this.eventLog.filter(e => e.type === 'penalty_stacked').length,
      multiCardPlays: this.eventLog.filter(e => e.type === 'multi_card_play').length,
      bluffsDetected: this.eventLog.filter(e => e.type === 'strategic_bluff').length,
      gameDuration: Date.now() - this.gameState.createdAt.getTime(),
      currentPhase: this.gameState.gamePhase
    };
  }

  private calculateAverageTurnTime(): number {
    if (this.moveHistory.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < this.moveHistory.length; i++) {
      const timeDiff = this.moveHistory[i].timestamp.getTime() - this.moveHistory[i - 1].timestamp.getTime();
      totalTime += timeDiff;
    }
    
    return totalTime / (this.moveHistory.length - 1);
  }

  private getMostPlayedCard(): Rank | null {
    const cardCounts: Record<string, number> = {};
    
    this.moveHistory.forEach(move => {
      move.cardsPlayed.forEach(card => {
        cardCounts[card.rank] = (cardCounts[card.rank] || 0) + 1;
      });
    });
    
    let maxCount = 0;
    let mostPlayedRank: Rank | null = null;
    
    Object.entries(cardCounts).forEach(([rank, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostPlayedRank = rank as Rank;
      }
    });
    
    return mostPlayedRank;
  }
}
