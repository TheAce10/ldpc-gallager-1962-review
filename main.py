"""
Main simulation for replication of Gallager (1962).

Paper: R. Gallager, "Low-Density Parity-Check Codes," IRE Transactions
       on Information Theory, vol. 8, pp. 21-28, 1962.

Replication target:
  BER vs Eb/N0 curves for (j,k)-regular LDPC codes over BPSK-AWGN,
  decoded with iterative belief propagation (log-domain sum-product).

All three (j,k) pairs use code rate R = 1 - j/k = 1/2.
"""

import json
import os
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))

from src.ldpc    import make_H, code_rate
from src.channel import bpsk_mod, awgn, channel_llr, snr_to_sigma, uncoded_ber
from src.decoder import bp_decode, bp_decode_record

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")

# codeword length divisible by 4, 6, and 8
N = 1200

CONFIGS = [
    {"j": 2, "k": 4, "label": "(j=2, k=4)"},
    {"j": 3, "k": 6, "label": "(j=3, k=6)"},
    {"j": 4, "k": 8, "label": "(j=4, k=8)"},
]

EBNODB_RANGE = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]


def simulate_ber(n, j, k, EbN0_dB_arr, n_blocks=200, max_iter=50, seed=0):
    """Monte Carlo BER simulation for one LDPC configuration."""
    rate = code_rate(j, k)
    _, check_vars, var_edge_pos = make_H(n, j, k, seed=42)
    rng  = np.random.default_rng(seed)

    records = []
    for EbN0_dB in EbN0_dB_arr:
        sigma      = snr_to_sigma(EbN0_dB, rate)
        bit_errors = 0
        blk_errors = 0
        iters_sum  = 0

        for _ in range(n_blocks):
            x = bpsk_mod(np.zeros(n, dtype=np.uint8))  # all-zero codeword
            y = awgn(x, sigma, rng)
            llr_ch = channel_llr(y, sigma)

            decision, n_iters, _ = bp_decode(
                check_vars, var_edge_pos, llr_ch, j, k, max_iter=max_iter
            )
            errs = int(np.sum(decision))   # all-zero TX: decoded 1s = errors
            bit_errors += errs
            blk_errors += int(errs > 0)
            iters_sum  += n_iters

        ber  = bit_errors / (n_blocks * n)
        bler = blk_errors / n_blocks
        records.append({
            "EbN0_dB":    EbN0_dB,
            "ber":        ber,
            "bler":       bler,
            "bit_errors": bit_errors,
            "n_blocks":   n_blocks,
            "avg_iters":  iters_sum / n_blocks,
        })
        print(
            f"    Eb/N0={EbN0_dB:.1f} dB  BER={ber:.2e}"
            f"  BLER={bler:.3f}  avg_iters={iters_sum/n_blocks:.1f}"
        )
    return records


def simulate_convergence(n, j, k, EbN0_dB, n_blocks=100, max_iter=50, seed=99):
    """
    Track BER at each BP iteration for a fixed SNR point.
    Original contribution: shows the convergence trajectory of belief propagation.
    """
    rate = code_rate(j, k)
    _, check_vars, var_edge_pos = make_H(n, j, k, seed=42)
    sigma = snr_to_sigma(EbN0_dB, rate)
    rng   = np.random.default_rng(seed)

    errors_acc = np.zeros(max_iter, dtype=np.int64)

    for _ in range(n_blocks):
        x = bpsk_mod(np.zeros(n, dtype=np.uint8))
        y = awgn(x, sigma, rng)
        llr_ch = channel_llr(y, sigma)
        _, errs_iter = bp_decode_record(
            check_vars, var_edge_pos, llr_ch, j, k, max_iter=max_iter
        )
        errors_acc += errs_iter

    ber_per_iter = (errors_acc / (n_blocks * n)).tolist()
    return {"EbN0_dB": EbN0_dB, "j": j, "k": k, "ber_per_iter": ber_per_iter}


def main():
    print("=" * 68)
    print("LDPC Code Replication: Gallager (1962)")
    print("COE 592: Advanced Signal and Communication Theory")
    print("Bless Elikem Krapah  |  KNUST MPhil COE")
    print("=" * 68)
    print(f"\nCodeword length n = {N}  |  Rate R = 1/2  |  max_iter = 50\n")

    os.makedirs(RESULTS_DIR, exist_ok=True)
    all_results = {}

    for cfg in CONFIGS:
        j, k, label = cfg["j"], cfg["k"], cfg["label"]
        print(f"[{label}]  m_checks={N*j//k}  edges={N*j}")
        t0 = time.perf_counter()
        res = simulate_ber(N, j, k, EBNODB_RANGE, n_blocks=200, max_iter=50)
        print(f"  Elapsed: {time.perf_counter()-t0:.1f}s\n")
        all_results[label] = res

    # Convergence analysis for Gallager's main example at Eb/N0 = 2.5 dB
    print("[Convergence analysis]  j=3, k=6  Eb/N0 = 2.5 dB")
    conv = simulate_convergence(N, 3, 6, EbN0_dB=2.5, n_blocks=100, max_iter=50)
    all_results["convergence"] = conv

    # Save JSON for visualize.py
    out_path = os.path.join(RESULTS_DIR, "simulation_results.json")
    with open(out_path, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\nResults saved -> {out_path}")

    # Summary table
    print("\n" + "=" * 68)
    print("BER Summary: (j=3, k=6), n=1200")
    print(f"  {'Eb/N0 (dB)':<14} {'BER (LDPC)':<16} {'BER (Uncoded)':<16} {'Gain'}")
    print("  " + "-" * 58)
    for r in all_results["(j=3, k=6)"]:
        ebn0   = r["EbN0_dB"]
        ber_lc = r["ber"]
        ber_uc = float(uncoded_ber(ebn0))
        gain   = f"{ber_uc/max(ber_lc,1e-9):.0f}x" if ber_lc > 0 else ">large"
        print(f"  {ebn0:<14.1f} {ber_lc:<16.2e} {ber_uc:<16.2e} {gain}")

    return all_results


if __name__ == "__main__":
    main()
