"""
Frequency domain analysis and FFT computation module.
"""

import numpy as np
from scipy import signal as scipy_signal


def compute_fft(signal_values, sampling_frequency, duration):
    """
    Compute FFT of a signal and return frequency and magnitude spectrum.
    
    Args:
        signal_values (np.ndarray): Signal values
        sampling_frequency (float): Sampling frequency in Hz
        duration (float): Duration of signal in seconds
    
    Returns:
        tuple: (frequencies, magnitude_spectrum)
    """
    n = len(signal_values)
    
    # Compute FFT
    fft_values = np.fft.fft(signal_values)
    magnitude = np.abs(fft_values) / n
    
    # Compute frequency axis (one-sided spectrum)
    frequencies = np.fft.fftfreq(n, 1 / sampling_frequency)
    
    # Return only positive frequencies (one-sided spectrum)
    positive_freq_idx = frequencies >= 0
    frequencies = frequencies[positive_freq_idx]
    magnitude = magnitude[positive_freq_idx]
    
    return frequencies, magnitude


def compute_continuous_fft(signal_values, sampling_frequency, duration):
    """
    Compute FFT for the continuous signal for comparison.
    
    Args:
        signal_values (np.ndarray): Continuous signal values
        sampling_frequency (float): Effective sampling frequency used
        duration (float): Duration of signal in seconds
    
    Returns:
        tuple: (frequencies, magnitude_spectrum)
    """
    return compute_fft(signal_values, sampling_frequency, duration)


def apply_window(signal_values, window_type='hann'):
    """
    Apply a window function to reduce spectral leakage.
    
    Args:
        signal_values (np.ndarray): Signal values
        window_type (str): Window type ('hann', 'hamming', 'blackman', 'rectangular')
    
    Returns:
        np.ndarray: Windowed signal
    """
    window = scipy_signal.get_window(window_type, len(signal_values))
    return signal_values * window


def find_spectral_peaks(frequencies, magnitude, threshold=0.1):
    """
    Find peaks in the frequency spectrum.
    
    Args:
        frequencies (np.ndarray): Frequency array
        magnitude (np.ndarray): Magnitude spectrum
        threshold (float): Relative threshold for peak detection (0-1)
    
    Returns:
        tuple: (peak_frequencies, peak_magnitudes)
    """
    # Normalize magnitude
    max_magnitude = np.max(magnitude)
    if max_magnitude == 0:
        return np.array([]), np.array([])
    
    normalized_magnitude = magnitude / max_magnitude
    
    # Find peaks
    peak_indices, _ = scipy_signal.find_peaks(
        normalized_magnitude,
        height=threshold,
        distance=5
    )
    
    if len(peak_indices) == 0:
        return np.array([]), np.array([])
    
    return frequencies[peak_indices], magnitude[peak_indices]


def compute_spectral_content(frequencies, magnitude, nyquist_freq):
    """
    Analyze spectral content and identify aliasing components.
    
    Args:
        frequencies (np.ndarray): Frequency array
        magnitude (np.ndarray): Magnitude spectrum
        nyquist_freq (float): Nyquist frequency (Fs/2)
    
    Returns:
        dict: Spectral analysis results
    """
    peaks_freq, peaks_mag = find_spectral_peaks(frequencies, magnitude)
    
    # Separate aliased and non-aliased components
    non_aliased = peaks_freq <= nyquist_freq
    aliased_components = []
    
    for freq, mag in zip(peaks_freq, peaks_mag):
        if freq > nyquist_freq:
            aliased_components.append({
                'frequency': freq,
                'magnitude': mag
            })
    
    return {
        'peaks_frequencies': peaks_freq,
        'peaks_magnitudes': peaks_mag,
        'aliased_components': aliased_components,
        'has_aliasing': len(aliased_components) > 0
    }
