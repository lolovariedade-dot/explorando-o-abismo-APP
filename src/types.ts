export interface NasaPhotoItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  nasaId: string;
  telescope: string;
  category: string;
  imageUrl: string;
  highResUrl: string;
  description: string;
  scienceHighlights: string[];
  distanceLy: string;
  massSolar: string;
  coordinates: string;
  countryOrigin?: string;
  observatoryLocation?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceCitation?: string;
}

export interface BlackHolePhysicsRecord {
  id: string;
  name: string;
  type: 'Supermassivo' | 'Estelar' | 'Intermediário' | 'Primordial / Extremo';
  massSolar: number;
  distanceLy: number;
  spinParameter: number;
  accretionRate: string;
  discoveryYear: number;
  hostGalaxy: string;
  description: string;
  funFact: string;
  imageUrl: string;
  highResUrl?: string;
  countryOrigin?: string;
  observatoryLocation?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceCitation?: string;
}

export interface CosmicAlertEvent {
  id: string;
  timestamp: string;
  category: 'Onda Gravitacional (LIGO/Virgo)' | 'Erupção Raio-X (Chandra/NuSTAR)' | 'Descoberta JWST/Hubble' | 'Alerta EHT';
  title: string;
  source: string;
  significance: string;
  physicsDetails: {
    energyReleased?: string;
    targetName: string;
    confidence: string;
    distance?: string;
  };
}

export interface DailyCosmicEnigma {
  dayId: string;
  dateStr: string;
  curiosityTitle: string;
  curiosityBody: string;
  curiosityFactNumber: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  explanation: string;
  xpReward: number;
}

export interface UserProgressState {
  xp: number;
  level: number;
  levelTitle: string;
  dailyStreak: number;
  solvedEnigmas: string[];
  unlockedBadges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  isAnalyzing?: boolean;
}
