# LDPC Codes: Replication of Gallager (1962)

**COE 592: Advanced Signal and Communication Theory | End-of-Semester Assignment**  
**Student:** Bless Elikem Krapah

---

## Paper

> R. Gallager, "Low-Density Parity-Check Codes,"  
> *IRE Transactions on Information Theory*, vol. 8, pp. 21–28, 1962.  
> DOI: [10.1109/TIT.1962.1057683](https://doi.org/10.1109/TIT.1962.1057683)

---

## What the paper does

Gallager (1962) introduced Low-Density Parity-Check (LDPC) codes: linear block codes defined by a sparse parity-check matrix H, decoded with iterative message passing on a bipartite graph. The construction produces a (j,k)-regular H where every column has weight j and every row has weight k, built by stacking j randomly permuted sub-matrices. The decoder passes log-likelihood-ratio messages between variable nodes and check nodes until the syndrome clears, yielding BER curves that approach the Shannon limit far below what any code of the 1950s could manage.

The paper was largely ignored for 30 years. MacKay and Neal rediscovered LDPC codes in 1996, and today they are in 5G NR, Wi-Fi 6, and DVB-S2.

---

## Replication scope

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

Requires Python 3.9+.

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

All three codes show a sharp waterfall. The (j=3,k=6) and (j=4,k=8) configurations drop below BER 10⁻⁵ at around 3 dB, compared to 8 dB for uncoded BPSK, consistent with Gallager's theoretical analysis.

---

## Project structure

```
src/
  ldpc.py       LDPC (j,k)-regular code construction (Gallager's method)
  channel.py    BPSK modulation, AWGN channel, LLR computation
  decoder.py    Vectorised log-domain sum-product belief propagation

results/
  ber_vs_snr.png      BER curves (main replication figure A)
  convergence.png     BER vs BP iteration (original contribution B)
  h_sparsity.png      H matrix sparsity visualisation (original C)
  gain_vs_snr.png     BER gain over uncoded BPSK (original D)

main.py         Monte Carlo simulation
visualize.py    Figure generation
```

---

## Key algorithms

H construction (`src/ldpc.py`): H = [H₁; H₂; …; Hⱼ]. H₁ is block-diagonal, one 1 per column in k-column blocks. H₂…Hⱼ are random column permutations of H₁, so each variable node connects to exactly j distinct check nodes.

Belief propagation (`src/decoder.py`): messages are LLRs. The check-node update uses sign/log-magnitude decomposition to avoid underflow in the tanh product:

```
sign_excl    = (product of incoming signs) * own sign
log_excl     = sum(log|tanh(q/2)|) - own term
r[j->i]      = sign_excl * 2 * arctanh(exp(log_excl))
```

Variable-node update: `q[i->j] = L_ch[i] + sum of all r[j'->i] except j`.

All messages are stored as flat arrays indexed by edge (`check_id * k + within-check position`), so every update is a numpy matrix operation with no Python loops over edges.
