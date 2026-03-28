import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid } from '@react-three/drei';
import * as THREE from 'three';

// ─── Individual Frequency Bar ────────────────────────────────────────
function FrequencyBar({ position, height, color, glowColor, index }) {
  const meshRef = useRef();
  const targetHeight = Math.max(height, 0.02);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const current = meshRef.current.scale.y;
      const newScale = THREE.MathUtils.lerp(current, targetHeight, delta * 6);
      meshRef.current.scale.y = newScale;
      meshRef.current.position.y = newScale / 2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.12, 1, 0.12]} />
      <meshStandardMaterial
        color={color}
        emissive={glowColor}
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// ─── Nyquist Boundary Plane ──────────────────────────────────────────
function NyquistPlane({ xPosition, depth, maxHeight }) {
  return (
    <mesh position={[xPosition, maxHeight / 2, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.02, maxHeight, 1]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Ground Grid Lines ──────────────────────────────────────────────
function GroundMesh() {
  return (
    <Grid
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#1e1b4b"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#312e81"
      fadeDistance={15}
      fadeStrength={1.5}
      position={[0, -0.01, 0]}
      infiniteGrid
    />
  );
}

// ─── Axis Labels ─────────────────────────────────────────────────────
function AxisLabels() {
  return (
    <>
      <Text
        position={[0, -0.3, 2]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        Frequency (Hz) →
      </Text>
      <Text
        position={[-1.2, 1.5, 0]}
        fontSize={0.18}
        color="#94a3b8"
        rotation={[0, 0, Math.PI / 2]}
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        ↑ Magnitude
      </Text>
    </>
  );
}

// ─── Rotating Glow Orb ──────────────────────────────────────────────
function GlowOrb({ criterionMet }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 3.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.2;
      ref.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <mesh ref={ref} position={[0, 3.5, -2]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={criterionMet ? '#10b981' : '#ef4444'}
        emissive={criterionMet ? '#10b981' : '#ef4444'}
        emissiveIntensity={1.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── 3D Scene Content ────────────────────────────────────────────────
function SceneContent({ fftData, nyquistFreq, signalFreq, criterionMet }) {
  const bars = useMemo(() => {
    const { frequencies, magnitude } = fftData;
    const maxFreqDisplay = Math.max(signalFreq * 4, nyquistFreq * 2, 30);
    const maxMag = Math.max(...magnitude) || 1;

    const result = [];
    const numBars = Math.min(120, frequencies.length);
    const step = Math.max(1, Math.floor(frequencies.length / numBars));

    for (let i = 0; i < frequencies.length && result.length < numBars; i += step) {
      const freq = frequencies[i];
      if (freq > maxFreqDisplay || freq <= 0) continue;

      const normalizedX = (freq / maxFreqDisplay) * 8 - 4;
      const normalizedH = (magnitude[i] / maxMag) * 4;
      const isAboveNyquist = freq > nyquistFreq;

      result.push({
        key: i,
        position: [normalizedX, 0, 0],
        height: normalizedH,
        color: isAboveNyquist ? '#ef4444' : '#6366f1',
        glowColor: isAboveNyquist ? '#dc2626' : '#4f46e5',
      });
    }

    return result;
  }, [fftData, nyquistFreq, signalFreq]);

  const nyquistX = useMemo(() => {
    const maxFreqDisplay = Math.max(signalFreq * 4, nyquistFreq * 2, 30);
    return (nyquistFreq / maxFreqDisplay) * 8 - 4;
  }, [nyquistFreq, signalFreq]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#c4b5fd" />
      <pointLight position={[-5, 6, -3]} intensity={0.6} color="#818cf8" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />

      {/* Ground */}
      <GroundMesh />

      {/* Frequency Bars */}
      {bars.map((bar) => (
        <FrequencyBar
          key={bar.key}
          position={bar.position}
          height={bar.height}
          color={bar.color}
          glowColor={bar.glowColor}
          index={bar.key}
        />
      ))}

      {/* Nyquist Plane */}
      <NyquistPlane xPosition={nyquistX} depth={2} maxHeight={4.5} />

      {/* Nyquist label */}
      <Text
        position={[nyquistX, 4.8, 0]}
        fontSize={0.16}
        color="#f59e0b"
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        Nyquist
      </Text>

      {/* Axis Labels */}
      <AxisLabels />

      {/* Status Orb */}
      <GlowOrb criterionMet={criterionMet} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function Frequency3DPlot({ fftOrig, fftSamp, nyquistFreq, signalFreq, criterionMet }) {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon purple">🌐</div>
        <span className="card-title">3D Frequency Spectrum</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
          fontStyle: 'italic',
        }}>
          Drag to rotate · Scroll to zoom
        </span>
      </div>

      <div className="plot-grid-2">
        {/* Original Signal 3D */}
        <div className="three-canvas-wrapper">
          <div className="three-canvas-label">Original Signal</div>
          <Canvas
            camera={{ position: [6, 4, 6], fov: 50 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
          >
            <SceneContent
              fftData={fftOrig}
              nyquistFreq={nyquistFreq}
              signalFreq={signalFreq}
              criterionMet={criterionMet}
            />
          </Canvas>
        </div>

        {/* Sampled Signal 3D */}
        <div className="three-canvas-wrapper">
          <div className="three-canvas-label">Sampled Signal</div>
          <Canvas
            camera={{ position: [6, 4, 6], fov: 50 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
          >
            <SceneContent
              fftData={fftSamp}
              nyquistFreq={nyquistFreq}
              signalFreq={signalFreq}
              criterionMet={criterionMet}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
