"""
Sampling & Aliasing Visual Demonstrator
Interactive tool for demonstrating sampling, Nyquist criterion, and aliasing effects.
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from signal_processing import (
    generate_continuous_signal,
    sample_signal,
    reconstruct_signal,
    check_aliasing_condition,
    calculate_aliased_frequency,
    sinc_interpolation
)
from fft_analysis import compute_fft, find_spectral_peaks
from utils import (
    format_frequency_string,
    calculate_sample_count,
    get_recommended_sampling_frequency,
    calculate_error_metrics
)


# Page configuration
st.set_page_config(
    page_title="Sampling & Aliasing Demonstrator",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom styling
st.markdown("""
    <style>
    .metric-box {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
    }
    .warning-box {
        background-color: #ffe5e5;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        border-left: 4px solid #ff4444;
    }
    .success-box {
        background-color: #e5ffe5;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        border-left: 4px solid #44ff44;
    }
    </style>
""", unsafe_allow_html=True)

# Title and introduction
st.title("📊 Sampling & Aliasing Visual Demonstrator")
st.markdown("""
This interactive tool demonstrates the fundamental concepts of **signal sampling**, 
**Nyquist criterion**, and **aliasing effects** in signal processing.
""")

# Sidebar controls
st.sidebar.header("⚙️ Control Panel")

# Signal parameters
st.sidebar.subheader("Signal Parameters")
signal_frequency = st.sidebar.slider(
    "Signal Frequency (Hz)",
    min_value=0.1,
    max_value=100.0,
    value=5.0,
    step=0.1,
    help="Frequency of the input sine wave signal"
)

amplitude = st.sidebar.slider(
    "Amplitude",
    min_value=0.1,
    max_value=5.0,
    value=1.0,
    step=0.1,
    help="Peak amplitude of the signal"
)

phase = st.sidebar.slider(
    "Phase (degrees)",
    min_value=-180,
    max_value=180,
    value=0,
    step=15,
    help="Phase shift of the signal"
)

# Sampling parameters
st.sidebar.subheader("Sampling Parameters")
nyquist_rate = get_recommended_sampling_frequency(signal_frequency)
sampling_frequency = st.sidebar.slider(
    "Sampling Frequency (Fs) in Hz",
    min_value=signal_frequency * 0.5,
    max_value=signal_frequency * 10,
    value=nyquist_rate * 1.5,
    step=0.1,
    help=f"Nyquist rate: {nyquist_rate:.2f} Hz (2 × signal frequency)"
)

# Display options
st.sidebar.subheader("Display Options")
show_reconstruction = st.sidebar.checkbox("Show Reconstructed Signal", value=True)
show_frequency_domain = st.sidebar.checkbox("Show Frequency Domain (FFT)", value=True)
use_sinc_interp = st.sidebar.checkbox("Use Sinc Interpolation", value=False)

# Presets
st.sidebar.subheader("Quick Presets")
col1, col2, col3 = st.sidebar.columns(3)

if col1.button("Safe Sampling"):
    signal_frequency = 5.0
    sampling_frequency = 15.0
    amplitude = 1.0

if col2.button("Aliasing Demo"):
    signal_frequency = 10.0
    sampling_frequency = 12.0
    amplitude = 1.0

if col3.button("Edge Case"):
    signal_frequency = 8.0
    sampling_frequency = 16.0
    amplitude = 1.0

# Generate signals
duration = 2.0
t_continuous, signal_continuous = generate_continuous_signal(
    signal_frequency, amplitude, phase, duration, sampling_rate=10000
)

t_sampled, signal_sampled = sample_signal(
    t_continuous, signal_continuous, sampling_frequency, duration
)

# Reconstruct signal
if use_sinc_interp:
    nyquist_freq = sampling_frequency / 2
    signal_reconstructed = sinc_interpolation(
        t_sampled, signal_sampled, t_continuous, nyquist_freq
    )
else:
    signal_reconstructed = reconstruct_signal(
        t_sampled, signal_sampled, t_continuous, method='cubic'
    )

# Check aliasing condition
aliasing_info = check_aliasing_condition(signal_frequency, sampling_frequency)
aliased_freq = calculate_aliased_frequency(signal_frequency, sampling_frequency)

# Main content area
col_main, col_info = st.columns([3, 1])

with col_info:
    st.subheader("📋 Status Panel")
    
    # Display condition
    if aliasing_info['criterion_met']:
        st.markdown(f"""
        <div class='success-box'>
        <strong>✓ {aliasing_info['condition']}</strong>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class='warning-box'>
        <strong>⚠ {aliasing_info['condition']}</strong>
        </div>
        """, unsafe_allow_html=True)
    
    # Display key metrics
    st.markdown(f"""
    <div class='metric-box'>
    <strong>Signal Frequency:</strong> {format_frequency_string(signal_frequency)}<br>
    <strong>Sampling Frequency:</strong> {format_frequency_string(sampling_frequency)}<br>
    <strong>Nyquist Frequency:</strong> {format_frequency_string(aliasing_info['nyquist_frequency'])}<br>
    <strong>Sampling Criterion:</strong> Fs ≥ 2f<br>
    <strong>Sample Count:</strong> {calculate_sample_count(sampling_frequency, duration)}<br>
    </div>
    """, unsafe_allow_html=True)
    
    if not aliasing_info['criterion_met']:
        st.markdown(f"""
        <div class='warning-box'>
        <strong>Aliased Frequency:</strong> {format_frequency_string(aliased_freq)} Hz
        </div>
        """, unsafe_allow_html=True)

with col_main:
    # Create time domain plot
    st.subheader("🕐 Time Domain Visualization")
    
    fig_time = go.Figure()
    
    # Add continuous signal
    fig_time.add_trace(go.Scatter(
        x=t_continuous, y=signal_continuous,
        mode='lines',
        name='Original Signal',
        line=dict(color='royalblue', width=2)
    ))
    
    # Add sampled points
    fig_time.add_trace(go.Scatter(
        x=t_sampled, y=signal_sampled,
        mode='markers',
        name='Sampled Points',
        marker=dict(color='red', size=8, symbol='circle'),
        line=dict(width=0)
    ))
    
    # Add reconstructed signal if enabled
    if show_reconstruction:
        fig_time.add_trace(go.Scatter(
            x=t_continuous, y=signal_reconstructed,
            mode='lines',
            name='Reconstructed Signal',
            line=dict(color='green', width=2, dash='dash')
        ))
    
    fig_time.update_layout(
        title="Time Domain: Original, Sampled, and Reconstructed Signals",
        xaxis_title="Time (seconds)",
        yaxis_title="Amplitude",
        hovermode='x unified',
        height=500,
        template='plotly_white'
    )
    
    st.plotly_chart(fig_time, use_container_width=True)

# Frequency domain visualization
if show_frequency_domain:
    st.subheader("📈 Frequency Domain (FFT) Visualization")
    
    # Compute FFTs
    freq_original, mag_original = compute_fft(signal_continuous, 10000, duration)
    freq_sampled, mag_sampled = compute_fft(signal_sampled, sampling_frequency, duration)
    
    fig_freq = make_subplots(
        rows=1, cols=2,
        subplot_titles=("Original Signal FFT", "Sampled Signal FFT"),
        specs=[[{"secondary_y": False}, {"secondary_y": False}]]
    )
    
    # Original signal FFT
    fig_freq.add_trace(
        go.Scatter(
            x=freq_original, y=mag_original,
            mode='lines',
            name='Original FFT',
            line=dict(color='royalblue', width=2),
            fill='tozeroy'
        ),
        row=1, col=1
    )
    
    # Add Nyquist line for original
    fig_freq.add_vline(
        x=aliasing_info['nyquist_frequency'],
        line_dash="dash",
        line_color="orange",
        annotation_text="Nyquist Freq",
        row=1, col=1
    )
    
    # Sampled signal FFT
    fig_freq.add_trace(
        go.Scatter(
            x=freq_sampled, y=mag_sampled,
            mode='lines',
            name='Sampled FFT',
            line=dict(color='green', width=2),
            fill='tozeroy'
        ),
        row=1, col=2
    )
    
    # Add Nyquist line for sampled
    fig_freq.add_vline(
        x=aliasing_info['nyquist_frequency'],
        line_dash="dash",
        line_color="orange",
        annotation_text="Nyquist Freq",
        row=1, col=2
    )
    
    fig_freq.update_xaxes(title_text="Frequency (Hz)", row=1, col=1)
    fig_freq.update_xaxes(title_text="Frequency (Hz)", row=1, col=2)
    fig_freq.update_yaxes(title_text="Magnitude", row=1, col=1)
    fig_freq.update_yaxes(title_text="Magnitude", row=1, col=2)
    
    fig_freq.update_layout(
        height=450,
        template='plotly_white',
        hovermode='x unified',
        showlegend=True
    )
    
    st.plotly_chart(fig_freq, use_container_width=True)

# Educational panel
st.subheader("📚 Educational Information")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    ### Nyquist Criterion
    The **Nyquist-Shannon sampling theorem** states that to accurately reconstruct 
    a signal, the sampling frequency must be at least **twice the highest frequency** 
    component of the signal:
    
    $$F_s \\geq 2 \\times f_{max}$$
    
    Where:
    - $F_s$ = Sampling frequency
    - $f_{max}$ = Maximum signal frequency
    """)

with col2:
    st.markdown("""
    ### Aliasing
    **Aliasing** occurs when the sampling frequency is too low (under-sampling).
    High-frequency components appear as low-frequency components, creating 
    false signals in the reconstruction.
    
    **Consequence**: The reconstructed signal is distorted and doesn't match 
    the original signal.
    """)

# Reconstruction error analysis
if show_reconstruction:
    st.subheader("🔍 Reconstruction Quality Metrics")
    
    error_metrics = calculate_error_metrics(signal_continuous, signal_reconstructed)
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Mean Squared Error (MSE)", f"{error_metrics['mse']:.6f}")
    col2.metric("Root Mean Squared Error (RMSE)", f"{error_metrics['rmse']:.6f}")
    col3.metric("Mean Absolute Error (MAE)", f"{error_metrics['mae']:.6f}")

# Footer
st.markdown("---")
st.markdown("""
**Understanding the Visualizations:**
- **Time Domain (left)**: Blue line = original continuous signal, Red dots = sampled points, Green dashed = reconstructed signal
- **Frequency Domain (right)**: Shows the frequency content; peaks indicate signal components
- **Nyquist Line (orange)**: Shows the maximum safe frequency limit for the given sampling rate

**Experiment:** Adjust the sampling frequency slider to see how aliasing occurs when Fs < 2f.
""")
