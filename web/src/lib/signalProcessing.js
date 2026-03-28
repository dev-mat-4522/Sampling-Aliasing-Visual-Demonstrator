/**
 * Signal Processing Library
 * JavaScript implementation of signal generation, sampling, reconstruction,
 * FFT analysis, aliasing detection, and utility functions.
 */

// ─── Signal Generation ──────────────────────────────────────────────

export function generateContinuousSignal(frequency, amplitude, phase, duration = 2.0, samplingRate = 10000) {
  const phaseRad = (phase * Math.PI) / 180;
  const numSamples = Math.floor(samplingRate * duration);
  const t = new Float64Array(numSamples);
  const signal = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const time = (i / (numSamples - 1)) * duration;
    t[i] = time;
    signal[i] = amplitude * Math.sin(2 * Math.PI * frequency * time + phaseRad);
  }

  return { t, signal };
}

// ─── Sampling ────────────────────────────────────────────────────────

export function sampleSignal(frequency, amplitude, phase, samplingFrequency, duration = 2.0) {
  const phaseRad = (phase * Math.PI) / 180;
  const numSamples = Math.floor(samplingFrequency * duration) + 1;
  const t = new Float64Array(numSamples);
  const signal = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const time = (i / (numSamples - 1)) * duration;
    t[i] = time;
    signal[i] = amplitude * Math.sin(2 * Math.PI * frequency * time + phaseRad);
  }

  return { t, signal };
}

// ─── Reconstruction ──────────────────────────────────────────────────

export function reconstructSignal(tSampled, signalSampled, tContinuous, method = 'cubic') {
  const n = tSampled.length;
  const m = tContinuous.length;
  const result = new Float64Array(m);

  if (n < 2) return result;

  if (method === 'linear') {
    for (let j = 0; j < m; j++) {
      const tc = tContinuous[j];
      let lo = 0, hi = n - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (tSampled[mid] <= tc) lo = mid;
        else hi = mid;
      }
      const t0 = tSampled[lo], t1 = tSampled[hi];
      const frac = t1 !== t0 ? (tc - t0) / (t1 - t0) : 0;
      result[j] = signalSampled[lo] + frac * (signalSampled[hi] - signalSampled[lo]);
    }
  } else {
    // Cubic interpolation (Catmull-Rom style)
    for (let j = 0; j < m; j++) {
      const tc = tContinuous[j];
      let lo = 0, hi = n - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (tSampled[mid] <= tc) lo = mid;
        else hi = mid;
      }

      const i0 = Math.max(0, lo - 1);
      const i1 = lo;
      const i2 = Math.min(n - 1, hi);
      const i3 = Math.min(n - 1, hi + 1);

      const t1 = tSampled[i1], t2 = tSampled[i2];
      const frac = t2 !== t1 ? (tc - t1) / (t2 - t1) : 0;
      const frac2 = frac * frac;
      const frac3 = frac2 * frac;

      const y0 = signalSampled[i0];
      const y1 = signalSampled[i1];
      const y2 = signalSampled[i2];
      const y3 = signalSampled[i3];

      result[j] =
        0.5 * (
          (-y0 + 3 * y1 - 3 * y2 + y3) * frac3 +
          (2 * y0 - 5 * y1 + 4 * y2 - y3) * frac2 +
          (-y0 + y2) * frac +
          2 * y1
        );
    }
  }

  return result;
}

// ─── Sinc Interpolation ──────────────────────────────────────────────

export function sincInterpolation(tSampled, signalSampled, tContinuous, bandwidth) {
  const n = tSampled.length;
  const m = tContinuous.length;
  const result = new Float64Array(m);

  for (let j = 0; j < m; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x = bandwidth * (tContinuous[j] - tSampled[i]);
      const sincVal = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
      sum += signalSampled[i] * sincVal;
    }
    result[j] = sum;
  }

  return result;
}

// ─── Aliasing Detection ──────────────────────────────────────────────

export function checkAliasingCondition(signalFrequency, samplingFrequency) {
  const nyquistFreq = samplingFrequency / 2;
  let condition, margin;

  if (signalFrequency < nyquistFreq) {
    condition = 'Over-sampling (Safe)';
    margin = nyquistFreq - signalFrequency;
  } else if (signalFrequency === nyquistFreq) {
    condition = 'Nyquist Rate (Critical)';
    margin = 0;
  } else {
    condition = 'Under-sampling (Aliasing)';
    margin = signalFrequency - nyquistFreq;
  }

  return {
    condition,
    nyquistFrequency: nyquistFreq,
    margin,
    criterionMet: signalFrequency <= nyquistFreq,
  };
}

export function calculateAliasedFrequency(signalFrequency, samplingFrequency) {
  const nyquist = samplingFrequency / 2;
  const normalizedFreq = signalFrequency % samplingFrequency;
  return normalizedFreq > nyquist
    ? samplingFrequency - normalizedFreq
    : normalizedFreq;
}

// ─── FFT ─────────────────────────────────────────────────────────────

function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function fftRadix2(re, im) {
  const n = re.length;
  if (n <= 1) return;

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Cooley-Tukey
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let j = 0; j < halfLen; j++) {
        const uRe = re[i + j], uIm = im[i + j];
        const vRe = re[i + j + halfLen] * curRe - im[i + j + halfLen] * curIm;
        const vIm = re[i + j + halfLen] * curIm + im[i + j + halfLen] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + halfLen] = uRe - vRe;
        im[i + j + halfLen] = uIm - vIm;
        const newCurRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newCurRe;
      }
    }
  }
}

export function computeFFT(signalValues, samplingFrequency) {
  const origN = signalValues.length;
  const n = nextPow2(origN);

  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < origN; i++) re[i] = signalValues[i];

  fftRadix2(re, im);

  // One-sided magnitude spectrum
  const halfN = Math.floor(n / 2) + 1;
  const frequencies = new Float64Array(halfN);
  const magnitude = new Float64Array(halfN);

  for (let i = 0; i < halfN; i++) {
    frequencies[i] = (i * samplingFrequency) / n;
    magnitude[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / origN;
  }

  return { frequencies, magnitude };
}

// ─── Utility Functions ───────────────────────────────────────────────

export function formatFrequency(frequency) {
  if (frequency >= 1000) return `${(frequency / 1000).toFixed(2)} kHz`;
  return `${frequency.toFixed(2)} Hz`;
}

export function calculateSampleCount(samplingFrequency, duration) {
  return Math.floor(samplingFrequency * duration) + 1;
}

export function getRecommendedSamplingFrequency(signalFrequency) {
  return 2.0 * signalFrequency;
}

export function calculateErrorMetrics(original, reconstructed) {
  const n = Math.min(original.length, reconstructed.length);
  if (n === 0) return { mse: Infinity, rmse: Infinity, mae: Infinity };

  let sumSqErr = 0, sumAbsErr = 0;
  for (let i = 0; i < n; i++) {
    const err = original[i] - reconstructed[i];
    sumSqErr += err * err;
    sumAbsErr += Math.abs(err);
  }

  const mse = sumSqErr / n;
  return {
    mse,
    rmse: Math.sqrt(mse),
    mae: sumAbsErr / n,
  };
}
