"""
Visualisation for LDPC replication results.

Generates four figures in results/:
  A  ber_vs_snr.png       BER curves for all (j,k) pairs vs uncoded + Shannon limit
  B  convergence.png      BER vs BP iteration number  [original contribution]
  C  h_sparsity.png       Sparsity pattern of H matrix [original contribution]
  D  gain_vs_snr.png      BER gain over uncoded BPSK   [original contribution]

Run after main.py.
"""

import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

from src.ldpc    import make_H, code_rate
from src.channel import uncoded_ber, shannon_limit_rate_half

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
JSON_PATH   = os.path.join(RESULTS_DIR, "simulation_results.json")

# Greyscale palette
C0 = "#111111"   # (j=2,k=4)
C1 = "#444444"   # (j=3,k=6)
C2 = "#888888"   # (j=4,k=8)
C_UNCODED  = "#AAAAAA"
C_SHANNON  = "#333333"
C_GRID     = "#DDDDDD"

MARKERS = ["o", "s", "^"]
LABELS  = ["(j=2, k=4)", "(j=3, k=6)", "(j=4, k=8)"]
COLORS  = [C0, C1, C2]

N = 1200


def load():
    with open(JSON_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Figure A — BER vs Eb/N0
# ---------------------------------------------------------------------------
def fig_ber_vs_snr(results):
    fig, ax = plt.subplots(figsize=(8, 5.5))

    snr_fine = np.linspace(0.0, 5.0, 200)
    ax.semilogy(snr_fine, uncoded_ber(snr_fine),
                color=C_UNCODED, linewidth=1.5, linestyle="--", label="Uncoded BPSK")

    ax.axvline(shannon_limit_rate_half(), color=C_SHANNON, linewidth=1.0,
               linestyle=":", label="Shannon limit  R=1/2 (0 dB)")

    for label, color, marker in zip(LABELS, COLORS, MARKERS):
        rows = results[label]
        x = [r["EbN0_dB"] for r in rows]
        y = [max(r["ber"], 1e-9) for r in rows]
        ax.semilogy(x, y, color=color, marker=marker, markersize=5,
                    linewidth=1.6, label=f"LDPC {label}")

    ax.set_xlim(0.0, 4.5)
    ax.set_ylim(1e-5, 0.6)
    ax.set_xlabel("$E_b/N_0$ (dB)", fontsize=12)
    ax.set_ylabel("Bit Error Rate (BER)", fontsize=12)
    ax.set_title(
        "BER vs $E_b/N_0$: (j,k)-Regular LDPC Codes over BPSK-AWGN  (A)\n"
        f"n = {N}, Rate R = 1/2, BP decoder, max 50 iterations",
        fontsize=10, fontweight="bold"
    )
    ax.yaxis.grid(True, which="both", color=C_GRID, linewidth=0.6)
    ax.xaxis.grid(True, color=C_GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    ax.legend(fontsize=9, loc="lower left")

    fig.tight_layout()
    path = os.path.join(RESULTS_DIR, "ber_vs_snr.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved -> {path}")


# ---------------------------------------------------------------------------
# Figure B — BER vs iteration number  [original contribution]
# ---------------------------------------------------------------------------
def fig_convergence(results):
    conv = results.get("convergence")
    if not conv:
        print("No convergence data; skipping.")
        return

    ber_iter = conv["ber_per_iter"]
    iters    = np.arange(1, len(ber_iter) + 1)

    fig, ax = plt.subplots(figsize=(7, 4.5))
    y = np.maximum(ber_iter, 1e-9)
    ax.semilogy(iters, y, color=C1, linewidth=1.8, marker="o",
                markersize=4, label=f"LDPC (j=3, k=6), Eb/N0 = {conv['EbN0_dB']} dB")

    ax.set_xlabel("BP Iteration", fontsize=12)
    ax.set_ylabel("Bit Error Rate (BER)", fontsize=12)
    ax.set_title(
        "Convergence of Belief Propagation  (B)\n"
        "BER at each iteration — original contribution beyond Gallager (1962)",
        fontsize=10, fontweight="bold"
    )
    ax.yaxis.grid(True, which="both", color=C_GRID, linewidth=0.6)
    ax.xaxis.grid(True, color=C_GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    ax.legend(fontsize=9)

    fig.tight_layout()
    path = os.path.join(RESULTS_DIR, "convergence.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved -> {path}")


# ---------------------------------------------------------------------------
# Figure C — H matrix sparsity  [original contribution]
# ---------------------------------------------------------------------------
def fig_h_sparsity(n_show=120):
    """Visualise the low-density structure of H for a small code segment."""
    H, _, _ = make_H(n_show, j=3, k=6, seed=42)
    m = H.shape[0]

    fig, ax = plt.subplots(figsize=(8, 3.5))
    rows, cols = np.where(H)
    ax.scatter(cols, rows, s=6, color=C0, marker="s", linewidths=0)

    ax.set_xlim(-1, n_show)
    ax.set_ylim(-1, m)
    ax.set_xlabel("Variable node (column index)", fontsize=11)
    ax.set_ylabel("Check node (row index)", fontsize=11)
    ax.set_title(
        f"Sparsity of Parity-Check Matrix H  (j=3, k=6, n={n_show})  (C)\n"
        f"Density = {H.mean():.3f}  —  the 'Low Density' in LDPC",
        fontsize=10, fontweight="bold"
    )
    ax.invert_yaxis()
    ax.set_aspect("auto")

    nnz   = int(H.sum())
    total = H.size
    ax.text(0.99, 0.97,
            f"Non-zeros: {nnz} / {total}\nDensity: {100*H.mean():.1f}%",
            transform=ax.transAxes, ha="right", va="top", fontsize=9,
            bbox=dict(boxstyle="round,pad=0.3", facecolor="white", edgecolor="#CCCCCC"))

    fig.tight_layout()
    path = os.path.join(RESULTS_DIR, "h_sparsity.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved -> {path}")


# ---------------------------------------------------------------------------
# Figure D — BER gain over uncoded BPSK  [original contribution]
# ---------------------------------------------------------------------------
def fig_gain(results):
    """
    Show the multiplicative BER gain of each LDPC code over uncoded BPSK.
    Illustrates the engineering impact of Gallager's construction.
    """
    fig, ax = plt.subplots(figsize=(8, 4.5))

    for label, color, marker in zip(LABELS, COLORS, MARKERS):
        rows = results[label]
        x = [r["EbN0_dB"] for r in rows]
        gains = []
        for r in rows:
            ber_lc = r["ber"]
            ber_uc = float(uncoded_ber(r["EbN0_dB"]))
            gains.append(ber_uc / max(ber_lc, 1e-9))
        ax.semilogy(x, gains, color=color, marker=marker, markersize=5,
                    linewidth=1.6, label=f"LDPC {label}")

    ax.set_xlabel("$E_b/N_0$ (dB)", fontsize=12)
    ax.set_ylabel("BER Gain over Uncoded BPSK  (×)", fontsize=12)
    ax.set_title(
        "Error-Rate Improvement over Uncoded BPSK  (D)\n"
        "Original contribution: quantifies Gallager's coding gain per SNR point",
        fontsize=10, fontweight="bold"
    )
    ax.yaxis.grid(True, which="both", color=C_GRID, linewidth=0.6)
    ax.xaxis.grid(True, color=C_GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    ax.legend(fontsize=9)

    fig.tight_layout()
    path = os.path.join(RESULTS_DIR, "gain_vs_snr.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved -> {path}")


def main():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    results = load()

    print("Generating figures...")
    fig_ber_vs_snr(results)
    fig_convergence(results)
    fig_h_sparsity()
    fig_gain(results)
    print("Done.")


if __name__ == "__main__":
    main()
