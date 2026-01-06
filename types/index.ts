// NikoKadi Card Game Types

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOK';

export type CardType = 'Answer' | 'Question' | 'Penalty' | 'Jump' | 'Kickback' | 'Wild';
export type PlayStyle = 'aggressive' | 'defensive' | 'balanced';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GamePhase = 'early' | 'mid' | 'late' | 'endgame';

export interface Card {
  id: string;
  suit: Suit | 'joker';
  rank: Rank;
  type: CardType;
  color?: 'red' | 'black' | 'joker';
  value: number;
  // Advanced properties
  isPlayable?: boolean;
  strategicValue?: number;
  comboPotential?: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isAI: boolean;
  rating: number;
  coins: number;
  cosmetics: {
    avatar: string;
    cardBack: string;
    tableTheme: string;
  };
  // Advanced AI properties
  aiConfig?: {
    difficulty: Difficulty;
    playStyle: PlayStyle;
    aggression: number; // 0-1
    cardCountingSkill: number; // 0-1
    bluffingTendency: number; // 0-1
  };
  // Strategic state
  strategicState?: {
    hasAce: boolean;
    hasSpecialCards: boolean;
    suitDistribution: Record<Suit, number>;
    winningProbability: number;
    threatLevel: number;
  };
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: 'clockwise' | 'counterclockwise';
  discardPile: Card[];
  drawPile: Card[];
  activePenaltyStack: number;
  activePenaltyRank?: Rank | 'joker' | null;
  penaltyCarrySuit?: Suit | null;
  penaltyCarryRank?: Rank | null;
  requiredSuit?: Suit | null;
  pendingSkipCount?: number;
  turnNumber?: number;
  nikoDeclaredBy: string | null;
  nikoDeclaredRound: number | null;
  gameMode: 'casual' | 'ranked' | 'tournament';
  status: 'waiting' | 'active' | 'finished';
  winner: string | null;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  mustDrawNextTurn: string | null;
  awaitingAnswer: { playerId: string; suit: Suit } | null;
  lastQuestionSuit?: Suit | null;
  // Advanced game state
  gamePhase: GamePhase;
  strategicAnalysis?: {
    leaderPlayerId: string | null;
    threatLevel: number; // 0-1
    averageHandSize: number;
    suitsInPlay: Record<Suit, number>;
    specialCardsRemaining: Record<Rank, number>;
  };
  // Multi-card tracking
  multiCardPlayEnabled: boolean;
  lastMultiCardPlay?: {
    playerId: string;
    cardCount: number;
    rank: Rank;
  };
  // Psychological tracking
  playerTendencies?: Record<string, {
    aggression: number;
    bluffing: number;
    cardCounting: number;
  }>;
}

export interface GameMove {
  playerId: string;
  cardsPlayed: Card[];
  action: 'play' | 'draw' | 'declare' | 'pass' | 'counter' | 'multi_play';
  timestamp: Date;
  targetPlayer?: string;
  // Advanced move properties
  strategicValue?: number;
  wasBluff?: boolean;
  reactionTime?: number;
  declaredSuit?: Suit;
  penaltyAvoided?: number;
}

export interface GameRules {
  maxPlayers: number;
  startingHandSize: number;
  allowStacking: boolean;
  timeLimit: number;
  penaltyLimits: {
    '2': number;
    '3': number;
    'joker': number;
  };
}

export interface MatchmakingSettings {
  gameMode: 'casual' | 'ranked';
  playerCount: number;
  ratingRange: [number, number];
  privateRoom: boolean;
  roomCode?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'card_mastery' | 'social' | 'competitive' | 'financial';
  requirement: {
    type: string;
    value: number;
  };
  reward: {
    coins: number;
    cosmetic?: string;
  };
  unlocked: boolean;
  progress: number;
}

export interface UserStats {
  userId: string;
  username: string;
  email: string;
  coins: number;
  rating: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  achievements: Achievement[];
  friends: string[];
  cosmetics: string[];
  equippedCosmetics: {
    avatar: string;
    cardBack: string;
    tableTheme: string;
  };
  hasRemovedAds: boolean;
  vipPass: boolean;
  lastActive: Date;
  accountCreated: Date;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'finished';
  startTime: Date;
  maxPlayers: number;
  registeredPlayers: string[];
  rounds: TournamentRound[];
  prizes: TournamentPrize[];
}

export interface TournamentRound {
  id: string;
  roundNumber: number;
  matches: string[];
  status: 'waiting' | 'active' | 'finished';
}

export interface TournamentPrize {
  type: 'coins' | 'cosmetic' | 'vip_pass';
  value: number | string;
  position: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'coins' | 'cosmetic' | 'vip_pass' | 'remove_ads';
  price: number;
  currency: 'USD' | 'coins';
  category: 'card_back' | 'avatar' | 'table_theme' | 'victory_animation';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  limited: boolean;
  endDate?: Date;
}

export interface AdConfig {
  rewardedAds: {
    postLoss: { reward: number; cooldown: number };
    dailyBonus: { reward: number };
    penaltyAvoidance: { reward: string; cooldown: number };
  };
  interstitialAds: {
    postMatch: { frequency: number };
    lobbyTransition: { frequency: number };
  };
  bannerAds: {
    enabled: boolean;
    position: 'bottom' | 'top';
  };
}

export interface NotificationSettings {
  push: {
    turnReminder: boolean;
    dailyBonus: boolean;
    tournamentAlerts: boolean;
    friendInvites: boolean;
  };
  inApp: {
    soundEffects: boolean;
    music: boolean;
    vibrations: boolean;
  };
}

export interface NetworkConfig {
  lan: {
    enabled: boolean;
    maxPlayers: number;
    timeout: number;
  };
  internet: {
    matchmakingTimeout: number;
    reconnectionWindow: number;
    latencyThreshold: number;
  };
}

export interface AnalyticsEvent {
  name: string;
  parameters: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

// Game Action Types
export type GameAction = 
  | { type: 'START_GAME'; payload: { gameMode: string; playerCount: number } }
  | { type: 'PLAY_CARD'; payload: { cardIds: string[]; targetPlayerId?: string; declaredSuit?: Suit } }
  | { type: 'PLAY_MULTI_CARD'; payload: { cardIds: string[]; declaredSuit?: Suit } }
  | { type: 'DRAW_CARD' }
  | { type: 'DECLARE_NIKO' }
  | { type: 'COUNTER_PLAY'; payload: { cardId: string } }
  | { type: 'PASS_TURN' }
  | { type: 'END_GAME'; payload: { winnerId: string } }
  | { type: 'RECONNECT'; payload: { gameState: GameState } }
  | { type: 'ANALYZE_POSITION'; payload: { playerId: string } }
  | { type: 'UPDATE_STRATEGY'; payload: { playerId: string; strategy: AIStrategy } };

// Advanced game events
export interface GameEvent {
  type: 'penalty_stacked' | 'multi_card_play' | 'strategic_bluff' | 'game_turning_point' | 'psychological_move';
  playerId: string;
  timestamp: Date;
  data: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

// UI popup types
export interface PopupConfig {
  type: 'suit_selection' | 'niko_declaration' | 'penalty_response' | 'multi_card_confirmation' | 'strategic_advice' | 'game_analysis';
  title: string;
  message: string;
  options?: Array<{ label: string; action: string; value?: any }>;
  timeout?: number;
}

// UI State Types
export interface UIState {
  currentScreen: 'home' | 'lobby' | 'game' | 'profile' | 'shop' | 'settings' | 'rankings';
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  modals: {
    achievements: boolean;
    shop: boolean;
    settings: boolean;
    friends: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Validation Types
export interface ValidationResult {
  valid: boolean;
  error?: string;
  penalty?: number;
  message?: string;
  // Advanced validation
  canWin?: boolean;
  requiresNikoDeclaration?: boolean;
  multiCardValid?: boolean;
  strategicRecommendation?: string;
  alternativeMoves?: Card[];
}

export interface MoveValidation {
  canPlay: boolean;
  validCards: Card[];
  penalties: number;
  counters: Card[];
  message: string;
  // Advanced validation
  multiCardOptions?: Card[][];
  winningMoves?: Card[];
  defensiveMoves?: Card[];
  aggressiveMoves?: Card[];
  strategicScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

// Advanced AI types
export interface AIStrategy {
  name: string;
  evaluateMove: (gameState: GameState, player: Player, move: Card[]) => number;
  selectCards: (gameState: GameState, player: Player, validCards: Card[]) => Card[];
  shouldDeclareNiko: (gameState: GameState, player: Player) => boolean;
  shouldBluff: (gameState: GameState, player: Player) => boolean;
}

export interface CardCountingState {
  playedCards: Set<string>;
  remainingCards: Record<Rank, Record<Suit | 'joker', number>>;
  suitDistribution: Record<Suit, number>;
  specialCardsRemaining: Record<Rank, number>;
}

export interface PsychologicalProfile {
  aggression: number; // 0-1
  bluffing: number; // 0-1
  cardCounting: number; // 0-1
  riskTolerance: number; // 0-1
  adaptability: number; // 0-1
  experience: number; // 0-1
}

export interface GameAnalysis {
  winningProbability: Record<string, number>;
  threatAssessment: Record<string, number>;
  recommendedMoves: Record<string, Card[]>;
  psychologicalAdvantage: Record<string, number>;
  gamePhase: GamePhase;
  criticalMoment: boolean;
}
