"""
Signal generation and sampling module for the aliasing demonstrator.
"""

import numpy as np
from scipy.interpolate import interp1d


def generate_continuous_signal(frequency, amplitude, phase, duration=2.0, sampling_rate=10000):
    """
    Generate a continuous-time sine wave signal.
    
    Args:
        frequency (float): Signal frequency in Hz
        amplitude (float): Signal amplitude
        phase (float): Phase shift in degrees
        duration (float): Duration of signal in seconds
        sampling_rate (int): High resolution sampling for continuous representation
    
    Returns:
        tuple: (time_array, signal_array)
    """
    phase_rad = np.radians(phase)
    t = np.linspace(0, duration, int(sampling_rate * duration))
    signal = amplitude * np.sin(2 * np.pi * frequency * t + phase_rad)
    return t, signal


def sample_signal(t_continuous, signal_continuous, sampling_frequency, duration=2.0):
    """
    Sample a continuous signal at specified sampling frequency.
    
    Args:
        t_continuous (np.ndarray): Time array of continuous signal
        signal_continuous (np.ndarray): Continuous signal values
        sampling_frequency (float): Sampling frequency (Fs) in Hz
        duration (float): Duration of signal in seconds
    
    Returns:
        tuple: (sampled_time, sampled_values)
    """
    num_samples = int(sampling_frequency * duration)
    t_sampled = np.linspace(0, duration, num_samples + 1)
    
    # Interpolate to get sampled values
    f_interp = interp1d(t_continuous, signal_continuous, kind='cubic', fill_value='extrapolate')
    signal_sampled = f_interp(t_sampled)
    
    return t_sampled, signal_sampled


def reconstruct_signal(t_sampled, signal_sampled, t_continuous, method='linear'):
    """
    Reconstruct continuous signal from samples using interpolation.
    
    Args:
        t_sampled (np.ndarray): Time array of sampled points
        signal_sampled (np.ndarray): Sampled signal values
        t_continuous (np.ndarray): Time array for reconstruction
        method (str): Interpolation method ('linear', 'cubic')
    
    Returns:
        np.ndarray: Reconstructed signal
    """
    if len(t_sampled) < 2:
        return np.zeros_like(t_continuous)
    
    f_reconstruct = interp1d(t_sampled, signal_sampled, kind=method, fill_value='extrapolate')
    signal_reconstructed = f_reconstruct(t_continuous)
    
    return signal_reconstructed


def sinc_interpolation(t_sampled, signal_sampled, t_continuous, bandwidth):
    """
    Reconstruct signal using sinc interpolation (ideal low-pass filtering).
    
    Args:
        t_sampled (np.ndarray): Time array of sampled points
        signal_sampled (np.ndarray): Sampled signal values
        t_continuous (np.ndarray): Time array for reconstruction
        bandwidth (float): Bandwidth (Nyquist frequency)
    
    Returns:
        np.ndarray: Sinc-interpolated signal
    """
    signal_reconstructed = np.zeros_like(t_continuous)
    
    for i, ts in enumerate(t_sampled):
        # Sinc interpolation formula
        sinc_vals = np.sinc(bandwidth * (t_continuous - ts))
        signal_reconstructed += signal_sampled[i] * sinc_vals
    
    return signal_reconstructed


def check_aliasing_condition(signal_frequency, sampling_frequency):
    """
    Determine aliasing condition based on Nyquist criterion.
    
    Args:
        signal_frequency (float): Signal frequency in Hz
        sampling_frequency (float): Sampling frequency in Hz
    
    Returns:
        dict: Condition details
    """
    nyquist_freq = sampling_frequency / 2
    
    if signal_frequency < nyquist_freq:
        condition = "Over-sampling (Safe)"
        margin = nyquist_freq - signal_frequency
    elif signal_frequency == nyquist_freq:
        condition = "Nyquist Rate (Critical)"
        margin = 0
    else:
        condition = "Under-sampling (Aliasing Occurs)"
        margin = signal_frequency - nyquist_freq
    
    return {
        'condition': condition,
        'nyquist_frequency': nyquist_freq,
        'margin': margin,
        'criterion_met': signal_frequency <= nyquist_freq
    }


def calculate_aliased_frequency(signal_frequency, sampling_frequency):
    """
    Calculate the aliased frequency that appears in the sampled signal.
    
    Args:
        signal_frequency (float): Original signal frequency
        sampling_frequency (float): Sampling frequency
    
    Returns:
        float: Aliased frequency (appears in sampled signal)
    """
    # Fold the signal frequency into the Nyquist zone
    nyquist = sampling_frequency / 2
    normalized_freq = signal_frequency % sampling_frequency
    
    if normalized_freq > nyquist:
        aliased_freq = sampling_frequency - normalized_freq
    else:
        aliased_freq = normalized_freq
    
    return aliased_freq
