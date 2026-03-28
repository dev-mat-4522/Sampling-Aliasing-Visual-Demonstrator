import { motion } from 'framer-motion';
import { formatFrequency, getRecommendedSamplingFrequency } from '../lib/signalProcessing';

export default function ControlPanel({
  signalFreq, setSignalFreq,
  amplitude, setAmplitude,
  phase, setPhase,
  samplingFreq, setSamplingFreq,
  showReconstruction, setShowReconstruction,
  showFFT, setShowFFT,
  useSinc, setUseSinc,
  applyPreset,
}) {
  const nyquistRate = getRecommendedSamplingFrequency(signalFreq);

  return (
    <>
      {/* Signal Parameters */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">⚡ Signal Parameters</div>

        <div className="control-group">
          <div className="control-label">
            <span>Signal Frequency</span>
            <motion.span
              className="control-value"
              key={signalFreq}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatFrequency(signalFreq)}
            </motion.span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={signalFreq}
              onChange={e => setSignalFreq(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Amplitude</span>
            <motion.span
              className="control-value"
              key={amplitude}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {amplitude.toFixed(1)}
            </motion.span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={amplitude}
              onChange={e => setAmplitude(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Phase</span>
            <motion.span
              className="control-value"
              key={phase}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {phase}°
            </motion.span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-180"
              max="180"
              step="15"
              value={phase}
              onChange={e => setPhase(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Sampling Parameters */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">🎛️ Sampling</div>

        <div className="control-group">
          <div className="control-label">
            <span>Sampling Freq (Fs)</span>
            <motion.span
              className="control-value"
              key={samplingFreq}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatFrequency(samplingFreq)}
            </motion.span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min={Math.max(0.5, signalFreq * 0.5)}
              max={signalFreq * 10}
              step="0.5"
              value={samplingFreq}
              onChange={e => setSamplingFreq(parseFloat(e.target.value))}
            />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Nyquist rate: {formatFrequency(nyquistRate)} (2 × f)
          </div>
        </div>
      </div>

      {/* Display Toggles */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">👁️ Display</div>

        <div className="toggle-group">
          <span className="toggle-label">Reconstruction</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={showReconstruction} onChange={e => setShowReconstruction(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="toggle-group">
          <span className="toggle-label">Frequency Domain</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={showFFT} onChange={e => setShowFFT(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="toggle-group">
          <span className="toggle-label">Sinc Interpolation</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={useSinc} onChange={e => setUseSinc(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Presets */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">🚀 Presets</div>
        <div className="preset-grid">
          <motion.button className="preset-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => applyPreset('safe')}>
            Safe
          </motion.button>
          <motion.button className="preset-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => applyPreset('aliasing')}>
            Aliasing
          </motion.button>
          <motion.button className="preset-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => applyPreset('edge')}>
            Edge Case
          </motion.button>
        </div>
      </div>
    </>
  );
}
