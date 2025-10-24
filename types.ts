
export interface Team {
  id: number;
  name: string;
  members: string[];
  color: string;
}

export type Language = 'en' | 'lv' | 'ru';

export type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};
