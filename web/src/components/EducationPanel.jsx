import { motion } from 'framer-motion';

const cards = [
  {
    icon: '📐',
    title: 'Nyquist-Shannon Theorem',
    formula: 'Fs ≥ 2 × f_max',
    description: 'To accurately reconstruct a signal, the sampling frequency must be at least twice the highest frequency component of the signal.',
    details: [
      { label: 'Fs', desc: 'Sampling frequency' },
      { label: 'f_max', desc: 'Maximum signal frequency' },
    ],
  },
  {
    icon: '🌀',
    title: 'Aliasing Effect',
    formula: 'f_alias = |f_signal − k · Fs|',
    description: 'When the sampling frequency is too low (under-sampling), high-frequency components fold back as low-frequency artifacts, creating false signals in the reconstruction.',
    details: [
      { label: 'Cause', desc: 'Fs < 2 × f_max' },
      { label: 'Result', desc: 'Distorted reconstruction' },
    ],
  },
  {
    icon: '📊',
    title: 'Nyquist Frequency',
    formula: 'f_Nyquist = Fs / 2',
    description: 'The highest frequency that can be safely represented at a given sampling rate. Frequencies above this limit will alias.',
    details: [],
  },
  {
    icon: '🔄',
    title: 'Signal Reconstruction',
    formula: 'x̂(t) = Σ x[n] · sinc((t − nTs) / Ts)',
    description: 'Sampled points are interpolated to estimate the original continuous signal. Quality depends directly on whether the Nyquist criterion is met.',
    details: [],
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function EducationPanel() {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon blue">📚</div>
        <span className="card-title">Theory & Concepts</span>
      </div>
      <div className="education-grid">
        {cards.map((card, i) => (
          <motion.div
            className="edu-card"
            key={card.title}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ borderColor: 'rgba(255,255,255,0.15)', transition: { duration: 0.2 } }}
          >
            <h4>{card.icon} {card.title}</h4>
            <span className="formula">{card.formula}</span>
            <p>{card.description}</p>
            {card.details.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {card.details.map(d => (
                  <span className="formula-desc" key={d.label}>
                    <strong style={{ color: 'var(--text-accent)' }}>{d.label}</strong> — {d.desc}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
