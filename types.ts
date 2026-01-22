export enum WordType {
  PRONOUN = 'PRONOUN',
  VERB = 'VERB',
  NOUN = 'NOUN',
  ADJECTIVE = 'ADJECTIVE',
  QUESTION = 'QUESTION',
  SOCIAL = 'SOCIAL',
}

export interface AACSymbol {
  id: string;
  label: string;
  icon?: string; // We will use Lucide icon names or emojis
  emoji?: string;
  image?: string; // Base64 string for custom user photos
  color: string; // Background color class
  type: WordType;
  pronunciation?: string; // Optional phonetic override
}

export interface Category {
  id: string;
  label: string;
  color: string;
  symbols: AACSymbol[];
}