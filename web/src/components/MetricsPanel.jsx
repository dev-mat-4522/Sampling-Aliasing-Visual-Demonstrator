import { motion } from 'framer-motion';

export default function MetricsPanel({ metrics, criterionMet }) {
  const quality = metrics.mse < 0.001 ? 'Excellent' : metrics.mse < 0.01 ? 'Good' : metrics.mse < 0.1 ? 'Fair' : 'Poor';
  const qualityColor = metrics.mse < 0.001 ? 'success' : metrics.mse < 0.01 ? 'accent' : metrics.mse < 0.1 ? 'warning' : 'danger';

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon green">🔍</div>
        <span className="card-title">Reconstruction Quality</span>
        <motion.span
          key={quality}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '999px',
            background: qualityColor === 'success' ? 'var(--success-bg)' : qualityColor === 'accent' ? 'var(--accent-gradient-subtle)' : qualityColor === 'warning' ? 'var(--warning-bg)' : 'var(--danger-bg)',
            color: qualityColor === 'success' ? 'var(--success)' : qualityColor === 'accent' ? 'var(--accent-primary)' : qualityColor === 'warning' ? 'var(--warning)' : 'var(--danger)',
            border: `1px solid ${qualityColor === 'success' ? 'var(--success-border)' : qualityColor === 'accent' ? 'rgba(99,102,241,0.2)' : qualityColor === 'warning' ? 'var(--warning-border)' : 'var(--danger-border)'}`,
          }}
        >
          {quality}
        </motion.span>
      </div>

      <div className="error-metrics-grid">
        <ErrorCard label="MSE" value={metrics.mse} color={qualityColor} />
        <ErrorCard label="RMSE" value={metrics.rmse} color={qualityColor} />
        <ErrorCard label="MAE" value={metrics.mae} color={qualityColor} />
      </div>
    </div>
  );
}

function ErrorCard({ label, value, color }) {
  const display = value < 0.0001 ? value.toExponential(2) : value.toFixed(6);

  return (
    <motion.div
      className="error-metric-card"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="error-metric-label">{label}</div>
      <motion.div
        className={`error-metric-value ${color}`}
        key={display}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {display}
      </motion.div>
    </motion.div>
  );
}
