import { ALL_NOTES } from '../utils/music';

export function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // Not enough signal

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0; while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

export function freqToNoteString(frequency) {
  const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  let midiNote = Math.round(noteNum) + 69;
  
  if (midiNote < 0 || midiNote > 127) return null;
  
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteStrings[midiNote % 12];
  const noteString = `${noteName}${octave}`;
  
  if (ALL_NOTES.includes(noteString)) {
    return noteString;
  }
  return null;
}
