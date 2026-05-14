export const SCALES_DEF = [
  { id: 'major', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: 'Major Scale', solfeo: 'Do Re Mi Fa Sol La Ti Do', pattern: [0, 2, 4, 5, 7, 9, 11, 12], duration: 3 },
  { id: 'maj_pent', category: 'Pentatonic Scales', badge: 'PENT', badgeColor: 'bg-purple-500/20 text-purple-400', name: 'Major Pentatonic', solfeo: 'Do Re Mi Sol La Do', pattern: [0, 2, 4, 7, 9, 12], duration: 2 },
  { id: 'maj_arp', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: 'Major Arpeggio', solfeo: 'Do Mi Sol Do', pattern: [0, 4, 7, 12], duration: 2 },
  { id: 'nat_min', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Natural Minor', solfeo: 'Do Re Me Fa Sol Le Te Do', pattern: [0, 2, 3, 5, 7, 8, 10, 12], duration: 3 },
  { id: 'min_pent', category: 'Pentatonic Scales', badge: 'PENT', badgeColor: 'bg-purple-500/20 text-purple-400', name: 'Minor Pentatonic', solfeo: 'Do Me Fa Sol Te Do', pattern: [0, 3, 5, 7, 10, 12], duration: 2 },
  { id: 'harm_min', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Harmonic Minor', solfeo: 'Do Re Me Fa Sol Le Ti Do', pattern: [0, 2, 3, 5, 7, 8, 11, 12], duration: 3 },
  { id: 'dorian', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Dorian', solfeo: 'Do Re Me Fa Sol La Te Do', pattern: [0, 2, 3, 5, 7, 9, 10, 12], duration: 3 },
  { id: 'mixo', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Mixolydian', solfeo: 'Do Re Mi Fa Sol La Te Do', pattern: [0, 2, 4, 5, 7, 9, 10, 12], duration: 3 },
  { id: 'chromatic', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Chromatic', solfeo: 'Do Di Re Ri Mi Fa Fi Sol Si La Li Ti Do', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], duration: 4 },
  { id: 'whole', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Whole Tone', solfeo: 'Do Re Mi Fi Si Li Do', pattern: [0, 2, 4, 6, 8, 10, 12], duration: 3 }
];

export const noteToFreq = (noteStr) => {
  const noteMap = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 };
  const note = noteStr.slice(0, -1);
  const octave = parseInt(noteStr.slice(-1));
  const n = noteMap[note] + (octave - 4) * 12;
  return 440 * Math.pow(2, n / 12);
};

import { ALL_NOTES } from '../components/VocalRangeKeyboard';

export const getNoteString = (noteIndex) => {
  if (noteIndex < 0 || noteIndex >= ALL_NOTES.length) return null;
  return ALL_NOTES[noteIndex];
};
