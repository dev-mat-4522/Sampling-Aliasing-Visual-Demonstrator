import { motion, AnimatePresence } from 'framer-motion';
import { formatFrequency, calculateSampleCount } from '../lib/signalProcessing';

export default function StatusRow({ aliasInfo, aliasedFreq, signalFreq, samplingFreq }) {
  const statusClass = aliasInfo.criterionMet
    ? (aliasInfo.condition.includes('Critical') ? 'warning' : 'safe')
    : 'danger';

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className={`card-header-icon ${statusClass === 'safe' ? 'green' : statusClass === 'warning' ? 'orange' : 'purple'}`}>
          {statusClass === 'safe' ? '✓' : statusClass === 'warning' ? '⚡' : '⚠'}
        </div>
        <span className="card-title">Signal Status</span>
      </div>

      {/* Status Badge */}
      <div style={{ marginBottom: 18 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={aliasInfo.condition}
            className={`status-badge ${statusClass}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'inline-flex' }}
          >
            <span className="status-dot" />
            <span className="status-text">{aliasInfo.condition}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Metrics */}
      <div className="metrics-row">
        <MetricBox label="Signal Freq" value={formatFrequency(signalFreq)} color="accent" />
        <MetricBox label="Sampling Freq" value={formatFrequency(samplingFreq)} color="accent" />
        <MetricBox label="Nyquist Freq" value={formatFrequency(aliasInfo.nyquistFrequency)} color={statusClass === 'safe' ? 'success' : statusClass === 'warning' ? 'warning' : 'danger'} />
        <MetricBox label="Samples" value={calculateSampleCount(samplingFreq, 2.0).toString()} />
        <MetricBox label="Criterion" value="Fs ≥ 2f" />
        {!aliasInfo.criterionMet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MetricBox label="Aliased Freq" value={formatFrequency(aliasedFreq)} color="danger" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricBox({ label, value, color = '' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <motion.div
        className={`metric-value ${color}`}
        key={value}
        initial={{ opacity: 0.5, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.div>
    </div>
  );
}
