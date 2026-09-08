"""
BPSK modulation and AWGN channel utilities.
"""

import numpy as np
from scipy.special import erfc


def bpsk_mod(bits):
    """Map bits to BPSK symbols: 0 -> +1, 1 -> -1."""
    return 1.0 - 2.0 * bits.astype(np.float64)


def awgn(x, sigma, rng):
    """Add zero-mean Gaussian noise with standard deviation sigma."""
    return x + rng.standard_normal(len(x)) * sigma


def channel_llr(y, sigma):
    """
    Log-likelihood ratio for BPSK-AWGN.
    L(c_i) = log P(c_i=0|y_i) / P(c_i=1|y_i) = 2*y_i / sigma^2
    Positive LLR favours c_i = 0.
    """
    return 2.0 * y / (sigma ** 2)


def snr_to_sigma(EbN0_dB, rate):
    """
    Convert Eb/N0 (dB) to AWGN sigma.

    For BPSK with code rate R:  sigma^2 = 1 / (2 * R * Eb/N0_linear)
    """
    EbN0_lin = 10.0 ** (EbN0_dB / 10.0)
    return np.sqrt(1.0 / (2.0 * rate * EbN0_lin))


def uncoded_ber(EbN0_dB_arr):
    """Theoretical BER for uncoded BPSK: BER = Q(sqrt(2*Eb/N0)) = 0.5*erfc(sqrt(Eb/N0))."""
    EbN0 = 10.0 ** (np.asarray(EbN0_dB_arr) / 10.0)
    return 0.5 * erfc(np.sqrt(EbN0))


def shannon_limit_rate_half():
    """Minimum Eb/N0 for reliable communication at R=1/2 over Gaussian channel: 0 dB."""
    return 0.0   # dB
