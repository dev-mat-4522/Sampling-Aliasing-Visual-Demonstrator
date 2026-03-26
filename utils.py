"""
Utility functions for the aliasing demonstrator.
"""

import numpy as np


def validate_frequency_range(frequency, max_freq=1000):
    """
    Validate that frequency is within acceptable range.
    
    Args:
        frequency (float): Frequency to validate
        max_freq (float): Maximum allowed frequency
    
    Returns:
        bool: True if valid
    """
    return 0.1 <= frequency <= max_freq


def validate_sampling_frequency(sampling_frequency, signal_frequency, max_fs=5000):
    """
    Validate sampling frequency relative to signal frequency.
    
    Args:
        sampling_frequency (float): Sampling frequency
        signal_frequency (float): Signal frequency for context
        max_fs (float): Maximum allowed sampling frequency
    
    Returns:
        bool: True if valid
    """
    return signal_frequency * 0.5 <= sampling_frequency <= max_fs


def format_frequency_string(frequency):
    """
    Format frequency value for display.
    
    Args:
        frequency (float): Frequency value
    
    Returns:
        str: Formatted frequency string
    """
    if frequency >= 1000:
        return f"{frequency/1000:.2f} kHz"
    return f"{frequency:.2f} Hz"


def calculate_sample_count(sampling_frequency, duration):
    """
    Calculate number of samples for given parameters.
    
    Args:
        sampling_frequency (float): Sampling frequency
        duration (float): Duration in seconds
    
    Returns:
        int: Number of samples
    """
    return int(sampling_frequency * duration) + 1


def get_recommended_sampling_frequency(signal_frequency):
    """
    Get recommended sampling frequency based on Nyquist criterion.
    
    Args:
        signal_frequency (float): Signal frequency
    
    Returns:
        float: Recommended Fs (2x signal frequency)
    """
    return 2.0 * signal_frequency


def get_alias_safe_range(sampling_frequency):
    """
    Get the safe signal frequency range for given sampling frequency.
    
    Args:
        sampling_frequency (float): Sampling frequency
    
    Returns:
        tuple: (min_safe_freq, max_safe_freq)
    """
    nyquist = sampling_frequency / 2
    return (0, nyquist)


def create_frequency_markers(nyquist_freq, signal_freq, sampled_freq):
    """
    Create markers for important frequencies on visualization.
    
    Args:
        nyquist_freq (float): Nyquist frequency
        signal_freq (float): Signal frequency
        sampled_freq (float): Sampled signal frequency (might be aliased)
    
    Returns:
        dict: Frequency markers for visualization
    """
    return {
        'signal': signal_freq,
        'nyquist': nyquist_freq,
        'sampled': sampled_freq,
        'margin': abs(nyquist_freq - signal_freq)
    }


def calculate_error_metrics(original_signal, reconstructed_signal):
    """
    Calculate error metrics between original and reconstructed signal.
    
    Args:
        original_signal (np.ndarray): Original signal
        reconstructed_signal (np.ndarray): Reconstructed signal
    
    Returns:
        dict: Error metrics
    """
    if len(original_signal) != len(reconstructed_signal):
        return {'mse': np.inf, 'rmse': np.inf, 'mae': np.inf}
    
    mse = np.mean((original_signal - reconstructed_signal) ** 2)
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(original_signal - reconstructed_signal))
    
    return {
        'mse': mse,
        'rmse': rmse,
        'mae': mae
    }
