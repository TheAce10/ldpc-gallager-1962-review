# LDPC Codes — Replication of Gallager (1962)

**COE 592: Advanced Signal and Communication Theory | End-of-Semester Assignment**  
**Student:** Bless Elikem Krapah

---

## Paper

> R. Gallager, "Low-Density Parity-Check Codes,"  
> *IRE Transactions on Information Theory*, vol. 8, pp. 21–28, 1962.  
> DOI: [10.1109/TIT.1962.1057683](https://doi.org/10.1109/TIT.1962.1057683)

---

## What the Paper Does

Gallager introduced Low-Density Parity-Check (LDPC) codes — a class of linear block codes defined by a sparse parity-check matrix H — and proposed iterative (belief propagation) decoding. Key contributions:

1. **Construction**: A (j,k)-regular H where every column has weight j and every row has weight k. Gallager's explicit construction stacks j randomly permuted sub-matrices.
2. **Decoder**: Iterative message passing on the Tanner graph (now called belief propagation / sum-product algorithm).
3. **Performance**: BER curves approaching the Shannon limit, far below uncoded BPSK.

The paper was largely ignored for 30 years until MacKay & Neal (1996) rediscovered LDPC codes. Today LDPC codes are in every 5G NR device.

---

## Replication Scope

| Component | Paper | This replication |
|---|---|---|
| Code construction | (j,k)-regular H, Gallager's method | `src/ldpc.py` |
| Channel model | BPSK-AWGN | `src/channel.py` |
| Decoder | Iterative belief propagation | `src/decoder.py` (log-domain sum-product) |
| BER evaluation | Monte Carlo simulation | `main.py` |
| Figures | BER vs Eb/N0 | `visualize.py` (+ 3 original figures) |

---

## Installation

```bash
pip install -r requirements.txt
```

Python 3.9+ required. No other dependencies.

---

## Usage

```bash
# Run BER simulation and print table (saves results/simulation_results.json)
python main.py

# Generate all four figures into results/
python visualize.py
```

---

## Results

```
Implementation   Eb/N0=1.0 dB   Eb/N0=2.0 dB   Eb/N0=3.0 dB
Uncoded BPSK     ~5.6e-2        ~2.7e-2        ~1.2e-2
LDPC (j=2,k=4)   ~4e-2          ~5e-3          ~2e-4
LDPC (j=3,k=6)   ~3e-2          ~2e-3          <1e-5
LDPC (j=4,k=8)   ~2e-2          ~1e-3          <1e-5
```

All LDPC codes show a sharp waterfall region; (j=3,k=6) and (j=4,k=8) reach the error floor below BER 10⁻⁵ at ~3 dB vs 8 dB for uncoded BPSK — consistent with Gallager's theoretical predictions.

---

## Project Structure

```
src/
  ldpc.py       LDPC (j,k)-regular code construction (Gallager's method)
  channel.py    BPSK modulation, AWGN channel, LLR computation
  decoder.py    Vectorised log-domain sum-product belief propagation

results/
  ber_vs_snr.png      BER curves — main replication figure (A)
  convergence.png     BER vs BP iteration — original contribution (B)
  h_sparsity.png      H matrix sparsity visualisation — original (C)
  gain_vs_snr.png     BER gain over uncoded BPSK — original (D)

main.py         Monte Carlo simulation orchestration
visualize.py    Figure generation
```

---

## Key Algorithms

**Gallager's H construction (`src/ldpc.py`):**  
H = [H₁; H₂; …; Hⱼ]. H₁ is block-diagonal (each block: one 1 per column, k columns per row). H₂…Hⱼ are random column permutations of H₁, giving each variable node exactly j parity constraints.

**Log-domain belief propagation (`src/decoder.py`):**  
Messages are LLRs. Check-node update uses sign/magnitude decomposition:
- Sign: sign_excl = (∏ sign) × selfₛᵢgₙ  
- Magnitude: |r| = 2·arctanh(exp(Σlog|tanh(q/2)| − self))  

Variable-node update: q[i→j] = L_ch[i] + Σⱼ′≠ⱼ r[j′→i] (extrinsic LLR).

**Vectorised implementation:**  
Messages stored as flat arrays indexed by edge (check_id × k + within-check position), enabling numpy matrix operations over all edges simultaneously.
