import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';

export default function FrequencyPlot({ fftOrig, fftSamp, nyquistFreq, signalFreq }) {
  const maxXOrig = Math.max(signalFreq * 3, nyquistFreq * 1.5, 20);

  const origData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < fftOrig.frequencies.length; i++) {
      if (fftOrig.frequencies[i] > maxXOrig) break;
      arr.push({
        freq: parseFloat(fftOrig.frequencies[i].toFixed(2)),
        magnitude: parseFloat(fftOrig.magnitude[i].toFixed(6)),
      });
    }
    return arr;
  }, [fftOrig, maxXOrig]);

  const sampData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < fftSamp.frequencies.length; i++) {
      arr.push({
        freq: parseFloat(fftSamp.frequencies[i].toFixed(2)),
        magnitude: parseFloat(fftSamp.magnitude[i].toFixed(6)),
      });
    }
    return arr;
  }, [fftSamp]);

  const tooltipStyle = {
    background: 'rgba(12,12,29,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    color: '#f1f5f9',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon orange">📈</div>
        <span className="card-title">Frequency Domain (FFT)</span>
      </div>
      <div className="plot-grid-2">
        {/* Original FFT */}
        <div className="plot-container" style={{ padding: '12px 8px 4px 0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4, fontWeight: 500 }}>
            Original Signal FFT
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={origData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="origGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="freq"
                type="number"
                domain={[0, maxXOrig]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Magnitude', angle: -90, position: 'insideLeft', offset: 4, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={v => `${v} Hz`} />
              <ReferenceLine
                x={nyquistFreq}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Nyquist', fill: '#f59e0b', fontSize: 10, position: 'top' }}
              />
              <Area
                dataKey="magnitude"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#origGrad)"
                name="Original FFT"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sampled FFT */}
        <div className="plot-container" style={{ padding: '12px 8px 4px 0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4, fontWeight: 500 }}>
            Sampled Signal FFT
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="sampGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="freq"
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Magnitude', angle: -90, position: 'insideLeft', offset: 4, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={v => `${v} Hz`} />
              <ReferenceLine
                x={nyquistFreq}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Nyquist', fill: '#f59e0b', fontSize: 10, position: 'top' }}
              />
              <Area
                dataKey="magnitude"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#sampGrad)"
                name="Sampled FFT"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
