import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ScatterChart, Scatter,
  ComposedChart, ReferenceLine,
} from 'recharts';

export default function TimeDomainPlot({ tCont, sigCont, tSamp, sigSamp, sigRecon, showReconstruction }) {
  // Downsample continuous signal for performance (every 10th point)
  const continuousData = useMemo(() => {
    const step = 10;
    const arr = [];
    for (let i = 0; i < tCont.length; i += step) {
      const entry = { t: parseFloat(tCont[i].toFixed(5)), original: parseFloat(sigCont[i].toFixed(5)) };
      if (showReconstruction) {
        entry.reconstructed = parseFloat(sigRecon[i].toFixed(5));
      }
      arr.push(entry);
    }
    return arr;
  }, [tCont, sigCont, sigRecon, showReconstruction]);

  const sampleData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < tSamp.length; i++) {
      arr.push({ t: parseFloat(tSamp[i].toFixed(5)), sample: parseFloat(sigSamp[i].toFixed(5)) });
    }
    return arr;
  }, [tSamp, sigSamp]);

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon purple">🕐</div>
        <span className="card-title">Time Domain</span>
      </div>
      <div className="plot-container" style={{ padding: '12px 8px 4px 0' }}>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 2]}
              tickCount={9}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              label={{ value: 'Time (s)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 12 }}
              allowDuplicatedCategory={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', offset: 4, fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(12,12,29,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 12,
                color: '#f1f5f9',
                backdropFilter: 'blur(8px)',
              }}
              labelFormatter={v => `t = ${v} s`}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
            />

            {/* Original signal */}
            <Line
              data={continuousData}
              dataKey="original"
              type="monotone"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              name="Original Signal"
              isAnimationActive={false}
            />

            {/* Reconstructed signal */}
            {showReconstruction && (
              <Line
                data={continuousData}
                dataKey="reconstructed"
                type="monotone"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="Reconstructed"
                isAnimationActive={false}
              />
            )}

            {/* Sample points */}
            <Scatter
              data={sampleData}
              dataKey="sample"
              fill="#ef4444"
              stroke="rgba(239,68,68,0.4)"
              strokeWidth={1}
              r={5}
              name="Sampled Points"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
