# Sampling & Aliasing Visual Demonstrator

A production-ready, interactive Streamlit application that demonstrates the fundamental concepts of **signal sampling**, **Nyquist criterion**, and **aliasing effects** in signal processing.

## Overview

This tool is designed for educational purposes and hackathon demonstrations, providing real-time visualization of:
- **Continuous signal generation** (sine waves)
- **Signal sampling** at user-defined frequencies
- **Aliasing effects** when under-sampling occurs
- **Nyquist criterion** validation
- **Frequency domain analysis** using FFT
- **Signal reconstruction** quality assessment

## Features

### Core Functionality

✅ **Signal Generation**
- Sine wave generation with customizable frequency, amplitude, and phase
- High-resolution continuous representation (10kHz sampling)
- Real-time signal updates

✅ **Sampling System**
- Interactive sampling frequency control
- Clear visualization of discrete sample points
- Dynamic sample count calculation

✅ **Aliasing Demonstration**
- Visual indication of under-sampling conditions
- Aliased frequency calculation
- Comparison of safe vs. unsafe sampling regimes
- Clear educational feedback

✅ **Dual Domain Visualization**
- **Time Domain**: Original signal, sampled points, reconstructed signal
- **Frequency Domain**: FFT of original and sampled signals with Nyquist markers

✅ **Interactive Controls**
- Sliders for signal frequency, sampling frequency, and amplitude
- Phase shift adjustment
- Toggle options for reconstruction and frequency domain views
- Quick preset buttons (Safe Sampling, Aliasing Demo, Edge Case)

✅ **Educational Panel**
- Nyquist criterion explanation with mathematical formula
- Aliasing definition and consequences
- Real-time status indicators (Safe/Warning)
- Reconstruction error metrics

## Technical Stack

- **Framework**: Streamlit 1.40.0
- **Signal Processing**: NumPy, SciPy (FFT, windowing, interpolation)
- **Visualization**: Plotly (interactive graphs)
- **Language**: Python 3.7+

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Quick Start

1. **Clone or download the project:**
   ```bash
   cd sampling-aliasing-visualizer
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   streamlit run app.py
   ```

4. **Access in your browser:**
   The app will automatically open at `http://localhost:8501`

## Project Structure

```
sampling-aliasing-visualizer/
├── app.py                  # Main Streamlit application
├── signal_processing.py    # Signal generation & sampling logic
├── fft_analysis.py         # Frequency domain analysis
├── utils.py                # Utility functions
├── requirements.txt        # Python dependencies
├── README.md               # This file
└── LICENSE                 # License information
```

## Module Documentation

### `signal_processing.py`
Core signal processing functions:
- `generate_continuous_signal()`: Creates sine wave signals
- `sample_signal()`: Samples continuous signal at Fs
- `reconstruct_signal()`: Reconstructs signal from samples using interpolation
- `sinc_interpolation()`: Ideal low-pass filtering reconstruction
- `check_aliasing_condition()`: Determines aliasing status
- `calculate_aliased_frequency()`: Computes apparent frequency in sampled signal

### `fft_analysis.py`
Frequency domain analysis:
- `compute_fft()`: Computes Fast Fourier Transform
- `apply_window()`: Applies windowing to reduce spectral leakage
- `find_spectral_peaks()`: Identifies frequency peaks
- `compute_spectral_content()`: Analyzes and identifies aliased components

### `utils.py`
Utility functions:
- `validate_frequency_range()`: Input validation
- `format_frequency_string()`: Pretty-print frequency values
- `calculate_error_metrics()`: Reconstruction quality assessment
- `get_recommended_sampling_frequency()`: Nyquist rate calculation

### `app.py`
Main Streamlit application with:
- Interactive sidebar controls
- Time and frequency domain visualizations
- Real-time updates
- Educational information panel
- Preset configurations

## How to Use

### Basic Workflow

1. **Set Signal Parameters**
   - Adjust "Signal Frequency" (0.1-100 Hz)
   - Set "Amplitude" (0.1-5.0)
   - Optional: Add "Phase" shift

2. **Control Sampling**
   - Slide "Sampling Frequency" (Fs)
   - Watch the status panel indicate safety

3. **Observe Results**
   - Time domain shows original vs. reconstructed signal
   - Frequency domain shows spectral content
   - Error metrics quantify reconstruction quality

4. **Explore Aliasing**
   - Lower Fs below Nyquist rate → aliasing occurs
   - See reconstructed signal diverge from original
   - FFT shows aliased frequency components

### Interactive Examples

#### Safe Sampling
- Signal Frequency: 5 Hz
- Sampling Frequency: 15 Hz (3× Nyquist)
- **Result**: Perfect reconstruction, no aliasing

#### Aliasing Example
- Signal Frequency: 10 Hz
- Sampling Frequency: 12 Hz (below 2× Nyquist)
- **Result**: Severe aliasing, signal appears at ~2 Hz

#### Edge Case (Nyquist Rate)
- Signal Frequency: 8 Hz
- Sampling Frequency: 16 Hz (exactly 2× Nyquist)
- **Result**: Critical sampling, reconstruction possible but risky

## Key Concepts Explained

### Nyquist Criterion
$$F_s \geq 2 \times f_{max}$$

The sampling frequency must be at least twice the maximum frequency component of the signal.

### Aliasing
When Fs < 2f_max, high-frequency components "fold" back into lower frequencies, creating false signal components that don't exist in the original.

### Nyquist Frequency
$$f_{Nyquist} = \frac{F_s}{2}$$

The highest frequency that can be safely represented at a given sampling rate.

### Reconstruction
The sampled points are interpolated (cubic or sinc) to estimate the original continuous signal. Quality depends on sampling rate.

## Mathematical Foundation

The application implements the Nyquist-Shannon sampling theorem:

1. **Sampling**: $x[n] = x_c(nT_s)$ where $T_s = 1/F_s$

2. **Reconstruction (sinc)**: $\hat{x}_c(t) = \sum_{n} x[n] \text{sinc}\left(\frac{t - nT_s}{T_s}\right)$

3. **Aliasing Frequency**: Folded into range [0, F_s/2]

## Performance Considerations

- Real-time updates with up to 10,000 sample resolution for continuous signal
- FFT computed with scipy.fft for efficiency
- Streamlit caching optimizes repeated calculations
- Interactive Plotly charts for responsive visualization

## Customization

### Add New Signal Types
Edit `signal_processing.py`:
```python
def generate_square_wave(frequency, amplitude, phase, duration, sampling_rate):
    # Implementation
```

### Modify Visualization Colors
Edit `app.py` trace definitions (e.g., `line=dict(color='custom_color')`)

### Change Duration
Modify `duration = 2.0` in `app.py` (in seconds)

### Adjust Control Ranges
Modify slider `min_value` and `max_value` parameters in sidebar controls

## Troubleshooting

### Application won't start
- Ensure Python 3.7+ installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`

### Plots not rendering
- Check browser JavaScript is enabled
- Try different browser (Chrome/Firefox recommended)
- Clear browser cache

### Slow performance with high Fs values
- Reduce sampling frequency or duration
- Streamlit has inherent latency; this is normal

## Educational Outcomes

Users will understand:
- ✓ Why sampling rate matters
- ✓ How aliasing artifacts appear
- ✓ Nyquist criterion practical application
- ✓ Time vs. frequency domain representation
- ✓ Signal reconstruction limitations
- ✓ Real-world implications for audio/image processing

## Bonus Features Implemented

✅ **Sinc Interpolation**: Theoretical ideal reconstruction method
✅ **Error Metrics**: MSE, RMSE, MAE for quality assessment
✅ **Preset Scenarios**: Quick-load common configurations
✅ **Spectral Peak Detection**: Identifies frequency components
✅ **Nyquist Visualization**: Clear markers on frequency plots

## Future Enhancement Ideas

- Animation/playback of sampling at variable Fs
- Additional signal types (square, sawtooth, composite)
- Noise addition for realistic scenarios
- Export functionality (PNG, CSV)
- Frequency domain filtering demonstration
- Multi-tone signal support

## License

This project is provided as-is for educational and hackathon purposes.

## References

- Oppenheim & Schafer: "Discrete-Time Signal Processing"
- Nyquist-Shannon Sampling Theorem (1928)
- Digital Signal Processing fundamentals

## Support

For issues or questions:
1. Check this README for common solutions
2. Review inline code comments
3. Examine Streamlit and Plotly documentation
4. Consider the mathematical foundations described above

---

**Made for Signal Processing Education** 📊

Built with Streamlit, NumPy, SciPy, and Plotly for clear, interactive demonstrations of fundamental DSP concepts.
