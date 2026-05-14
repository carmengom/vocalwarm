export const SCALES_DEF = [
  // Major Scales
  { id: 'maj_3', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: '3-Tone Major', solfeo: 'Do Re Mi Re Do', pattern: [0, 2, 4, 2, 0], isFull: true, duration: 2 },
  { id: 'maj_5', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: '5-Tone Major', solfeo: 'Do Re Mi Fa Sol Fa Mi Re Do', pattern: [0, 2, 4, 5, 7, 5, 4, 2, 0], isFull: true, duration: 3 },
  { id: 'major', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: 'Octave Major', solfeo: 'Do Re Mi Fa Sol La Ti Do Ti La Sol Fa Mi Re Do', pattern: [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0], isFull: true, duration: 3 },
  { id: 'maj_arp', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: 'Major Arpeggio', solfeo: 'Do Mi Sol Do Sol Mi Do', pattern: [0, 4, 7, 12, 7, 4, 0], isFull: true, duration: 2 },
  { id: 'maj_pent', category: 'Major Scales', badge: 'MAJ', badgeColor: 'bg-orange-500/20 text-orange-400', name: 'Major Pentatonic', solfeo: 'Do Re Mi Sol La Do', pattern: [0, 2, 4, 7, 9, 12], duration: 2 },

  // Minor Scales
  { id: 'min_3', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: '3-Tone Minor', solfeo: 'Do Re Me Re Do', pattern: [0, 2, 3, 2, 0], isFull: true, duration: 2 },
  { id: 'min_5', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: '5-Tone Minor', solfeo: 'Do Re Me Fa Sol Fa Me Re Do', pattern: [0, 2, 3, 5, 7, 5, 3, 2, 0], isFull: true, duration: 3 },
  { id: 'nat_min', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Octave Minor', solfeo: 'Do Re Me Fa Sol Le Te Do', pattern: [0, 2, 3, 5, 7, 8, 10, 12], duration: 3 },
  { id: 'min_arp', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Minor Arpeggio', solfeo: 'Do Me Sol Do Sol Me Do', pattern: [0, 3, 7, 12, 7, 3, 0], isFull: true, duration: 2 },
  { id: 'min_pent', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Minor Pentatonic', solfeo: 'Do Me Fa Sol Te Do', pattern: [0, 3, 5, 7, 10, 12], duration: 2 },
  { id: 'harm_min', category: 'Minor Scales', badge: 'MIN', badgeColor: 'bg-gray-500/20 text-gray-300', name: 'Harmonic Minor', solfeo: 'Do Re Me Fa Sol Le Ti Do', pattern: [0, 2, 3, 5, 7, 8, 11, 12], duration: 3 },

  // Extended Scales
  { id: 'ext_1_5', category: 'Extended Scales', badge: 'EXT', badgeColor: 'bg-teal-500/20 text-teal-400', name: '1.5 Octave Scale', solfeo: 'Do Mi Sol Do Mi Sol Fa Re Ti Sol Fa Re Do', pattern: [[0, 4, 7, 12, 16, 19], 0, 4, 7, 12, 16, 19, 17, 14, 11, 7, 5, 2, 0, [0, 4, 7, 12, 16, 19]], isFull: true, duration: 4 },
  { id: 'ext_broken', category: 'Extended Scales', badge: 'EXT', badgeColor: 'bg-teal-500/20 text-teal-400', name: 'Octave Broken Scale', solfeo: 'Do Sol Mi Do Sol Mi Do', pattern: [0, 7, 4, 12, 7, 4, 0], isFull: true, duration: 4 },

  // Arpeggios & Intervals
  { id: 'arp_oct_rep', category: 'Arpeggios & Intervals', badge: 'ARP', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Octave Repeat Arpeggio', solfeo: 'Do Mi Sol Do Do Do Do Sol Mi Do', pattern: [0, 4, 7, 12, 12, 12, 12, 7, 4, 0], isFull: true, duration: 3 },
  { id: 'dorian', category: 'Arpeggios & Intervals', badge: 'ARP', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Dorian', solfeo: 'Do Re Me Fa Sol La Te Do', pattern: [0, 2, 3, 5, 7, 9, 10, 12], duration: 3 },
  { id: 'mixo', category: 'Arpeggios & Intervals', badge: 'ARP', badgeColor: 'bg-blue-500/20 text-blue-400', name: 'Mixolydian', solfeo: 'Do Re Mi Fa Sol La Te Do', pattern: [0, 2, 4, 5, 7, 9, 10, 12], duration: 3 },

  // Modal & Other
  { id: 'whole', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-purple-500/20 text-purple-400', name: 'Whole Tone', solfeo: 'Do Re Mi Fi Sol Li Do', pattern: [0, 2, 4, 6, 8, 10, 12], duration: 3 },
  { id: 'chromatic', category: 'Modal & Other', badge: 'MOD', badgeColor: 'bg-purple-500/20 text-purple-400', name: 'Chromatic', solfeo: 'Do Di Re Ri Mi Fa Fi Sol Si La Li Ti Do', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], duration: 4 },

  // Runs & Melismas
  { id: 'run_bubble', category: 'Runs & Melismas', badge: 'RUN', badgeColor: 'bg-pink-500/20 text-pink-400', name: 'Bubble/Trill Run', solfeo: 'Do Re Do Re Mi Re Mi Re Do', pattern: [0, 2, 0, 2, 4, 2, 4, 2, 0], isFull: true, duration: 2 },
  { id: 'run_5', category: 'Runs & Melismas', badge: 'RUN', badgeColor: 'bg-pink-500/20 text-pink-400', name: '5-Note Run', solfeo: 'Do Re Mi Fa Sol Fa Mi Re Do', pattern: [0, 2, 4, 5, 7, 5, 4, 2, 0], isFull: true, duration: 3 },
  { id: 'run_gospel', category: 'Runs & Melismas', badge: 'RUN', badgeColor: 'bg-pink-500/20 text-pink-400', name: 'Gospel Run', solfeo: 'Do Mi Sol La Do La Sol Mi Do', pattern: [0, 4, 7, 9, 12, 9, 7, 4, 0], isFull: true, duration: 3 },
  { id: 'run_melisma', category: 'Runs & Melismas', badge: 'RUN', badgeColor: 'bg-pink-500/20 text-pink-400', name: 'Melisma Trill', solfeo: 'Do Di Do Di Do Re Do Re Do', pattern: [0, 1, 0, 1, 0, 2, 0, 2, 0], isFull: true, duration: 2 }
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
