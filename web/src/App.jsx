import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ControlPanel from './components/ControlPanel';
import StatusRow from './components/StatusRow';
import TimeDomainPlot from './components/TimeDomainPlot';
import FrequencyPlot from './components/FrequencyPlot';
import Frequency3DPlot from './components/Frequency3DPlot';
import EducationPanel from './components/EducationPanel';
import MetricsPanel from './components/MetricsPanel';
import {
  generateContinuousSignal,
  sampleSignal,
  reconstructSignal,
  sincInterpolation,
  checkAliasingCondition,
  calculateAliasedFrequency,
  computeFFT,
  calculateErrorMetrics,
} from './lib/signalProcessing';

const DURATION = 2.0;
const CONTINUOUS_RATE = 10000;

// Framer Motion variants
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function App() {
  const [signalFreq, setSignalFreq] = useState(5.0);
  const [amplitude, setAmplitude] = useState(1.0);
  const [phase, setPhase] = useState(0);
  const [samplingFreq, setSamplingFreq] = useState(15.0);
  const [showReconstruction, setShowReconstruction] = useState(true);
  const [showFFT, setShowFFT] = useState(true);
  const [useSinc, setUseSinc] = useState(false);
  const [show3D, setShow3D] = useState(true);

  // Presets
  const applyPreset = (preset) => {
    if (preset === 'safe') { setSignalFreq(5); setSamplingFreq(15); setAmplitude(1); setPhase(0); }
    if (preset === 'aliasing') { setSignalFreq(10); setSamplingFreq(12); setAmplitude(1); setPhase(0); }
    if (preset === 'edge') { setSignalFreq(8); setSamplingFreq(16); setAmplitude(1); setPhase(0); }
  };

  // Compute all signal data
  const data = useMemo(() => {
    const { t: tCont, signal: sigCont } = generateContinuousSignal(signalFreq, amplitude, phase, DURATION, CONTINUOUS_RATE);
    const { t: tSamp, signal: sigSamp } = sampleSignal(signalFreq, amplitude, phase, samplingFreq, DURATION);

    let sigRecon;
    if (useSinc) {
      sigRecon = sincInterpolation(tSamp, sigSamp, tCont, samplingFreq / 2);
    } else {
      sigRecon = reconstructSignal(tSamp, sigSamp, tCont, 'cubic');
    }

    const aliasInfo = checkAliasingCondition(signalFreq, samplingFreq);
    const aliasedFreq = calculateAliasedFrequency(signalFreq, samplingFreq);

    const fftOrig = computeFFT(sigCont, CONTINUOUS_RATE);
    const fftSamp = computeFFT(sigSamp, samplingFreq);

    const errorMetrics = calculateErrorMetrics(sigCont, sigRecon);

    return { tCont, sigCont, tSamp, sigSamp, sigRecon, aliasInfo, aliasedFreq, fftOrig, fftSamp, errorMetrics };
  }, [signalFreq, amplitude, phase, samplingFreq, useSinc]);

  return (
    <div className="app-layout">
      {/* Header */}
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="logo-icon">📊</div>
        <div>
          <h1>Sampling & Aliasing Demonstrator</h1>
          <span className="subtitle">Interactive signal processing visualization</span>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <ControlPanel
          signalFreq={signalFreq} setSignalFreq={setSignalFreq}
          amplitude={amplitude} setAmplitude={setAmplitude}
          phase={phase} setPhase={setPhase}
          samplingFreq={samplingFreq} setSamplingFreq={setSamplingFreq}
          showReconstruction={showReconstruction} setShowReconstruction={setShowReconstruction}
          showFFT={showFFT} setShowFFT={setShowFFT}
          useSinc={useSinc} setUseSinc={setUseSinc}
          show3D={show3D} setShow3D={setShow3D}
          applyPreset={applyPreset}
        />
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <motion.div
          className="content-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Status Row */}
          <motion.div variants={fadeUp}>
            <StatusRow
              aliasInfo={data.aliasInfo}
              aliasedFreq={data.aliasedFreq}
              signalFreq={signalFreq}
              samplingFreq={samplingFreq}
            />
          </motion.div>

          {/* Time Domain Plot */}
          <motion.div variants={fadeUp}>
            <TimeDomainPlot
              tCont={data.tCont}
              sigCont={data.sigCont}
              tSamp={data.tSamp}
              sigSamp={data.sigSamp}
              sigRecon={data.sigRecon}
              showReconstruction={showReconstruction}
            />
          </motion.div>

          {/* FFT Plot */}
          <AnimatePresence>
            {showFFT && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
              >
                <FrequencyPlot
                  fftOrig={data.fftOrig}
                  fftSamp={data.fftSamp}
                  nyquistFreq={data.aliasInfo.nyquistFrequency}
                  signalFreq={signalFreq}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Frequency Plot */}
          <AnimatePresence>
            {show3D && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
              >
                <Frequency3DPlot
                  fftOrig={data.fftOrig}
                  fftSamp={data.fftSamp}
                  nyquistFreq={data.aliasInfo.nyquistFrequency}
                  signalFreq={signalFreq}
                  criterionMet={data.aliasInfo.criterionMet}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics */}
          <AnimatePresence>
            {showReconstruction && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
              >
                <MetricsPanel metrics={data.errorMetrics} criterionMet={data.aliasInfo.criterionMet} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Education */}
          <motion.div variants={fadeUp}>
            <EducationPanel />
          </motion.div>

          {/* Footer */}
          <motion.footer className="app-footer" variants={fadeUp}>
            <div className="footer-legend">
              <div className="legend-item"><span className="legend-dot blue" /> Original Signal</div>
              <div className="legend-item"><span className="legend-dot red" /> Sample Points</div>
              <div className="legend-item"><span className="legend-dot green" /> Reconstructed</div>
              <div className="legend-item"><span className="legend-dot orange" /> Nyquist Line</div>
            </div>
            <span className="footer-credit">Built for Signal Processing Education 📊</span>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  );
}
