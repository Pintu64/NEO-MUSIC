export interface PresetData {
  name: string;
  bands: number[];
  bassBoost: number;
  virtualizer: number;
}

export const PRESET_LIST: PresetData[] = [
  {
    name: 'Normal (Flat)',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bassBoost: 0,
    virtualizer: 0,
  },
  {
    name: 'Bass Boost (Deep)',
    bands: [8, 6.5, 4.5, 2, 0, 0, 0, 1, 2, 2.5],
    bassBoost: 75,
    virtualizer: 20,
  },
  {
    name: 'Electronic / EDM',
    bands: [6.5, 5.5, 2.5, -1, 1, 3, 4.5, 6, 7, 7.5],
    bassBoost: 60,
    virtualizer: 40,
  },
  {
    name: 'Rock',
    bands: [5, 4, 2, -2, -1, 1, 3, 5, 6, 6],
    bassBoost: 45,
    virtualizer: 25,
  },
  {
    name: 'Pop',
    bands: [2, 3, 4, 3, 1, -1, 2, 3.5, 4.5, 4],
    bassBoost: 35,
    virtualizer: 30,
  },
  {
    name: 'Jazz & Soul',
    bands: [3.5, 2.5, 1, 2, -1, -1, 1, 2.5, 4, 4.5],
    bassBoost: 25,
    virtualizer: 35,
  },
  {
    name: 'Classical',
    bands: [4, 3.5, 2.5, 1.5, -1, -1, 0, 2, 3.5, 4],
    bassBoost: 20,
    virtualizer: 45,
  },
  {
    name: 'Vocal Clarity',
    bands: [-2, -2, -1, 2, 5, 6, 5, 3, 1, -1],
    bassBoost: 10,
    virtualizer: 15,
  },
  {
    name: 'Acoustic Warmth',
    bands: [3, 2, 1, 0, 2, 3, 3.5, 4, 4.5, 4],
    bassBoost: 25,
    virtualizer: 20,
  },
  {
    name: 'Audiophile Hi-Fi',
    bands: [1.5, 1, 0.5, 0, 0, 0, 0.5, 1, 1.5, 2],
    bassBoost: 15,
    virtualizer: 10,
  },
];
