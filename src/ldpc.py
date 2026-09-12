"""
LDPC code construction following Gallager (1962).

Builds a (j,k)-regular parity-check matrix H where:
  m = j * (n // k)   check nodes (rows)
  n                  variable nodes (columns)
  Rate R = 1 - j/k

Gallager's construction stacks j sub-matrices:
  H1 : block-diagonal; each block of k consecutive columns has a single 1
  H2..Hj : independent random column permutations of H1
"""

import numpy as np


def make_H(n, j, k, seed=42):
    """
    Build a (j,k)-regular LDPC parity-check matrix.

    Parameters
    ----------
    n    : codeword length, must be divisible by k
    j    : column weight (each variable node connects to j checks)
    k    : row weight   (each check node connects to k variables)
    seed : RNG seed for reproducibility

    Returns
    -------
    H             : (m, n) uint8 array
    check_vars    : (m, k) int32 array; check_vars[c] = variable indices for check c
    var_edge_pos  : (n, j) int32 array; var_edge_pos[v, p] = global edge index
                    for variable v's p-th check connection
                    (edge index = check_id * k + within-check position)
    """
    assert n % k == 0, f"n={n} must be divisible by k={k}"
    rng = np.random.default_rng(seed)

    m_sub = n // k          # rows in each sub-matrix
    m     = j * m_sub       # total check nodes

    # H1: systematic block structure
    H1 = np.zeros((m_sub, n), dtype=np.uint8)
    for r in range(m_sub):
        H1[r, r * k:(r + 1) * k] = 1

    # H2..Hj: random column permutations
    sub_mats = [H1]
    for _ in range(j - 1):
        perm = rng.permutation(n)
        sub_mats.append(H1[:, perm])

    H = np.vstack(sub_mats)         # (m, n)

    # Pre-build adjacency structures for fast BP decoding
    check_vars = np.zeros((m, k), dtype=np.int32)
    for c in range(m):
        check_vars[c] = np.where(H[c])[0]

    # For each variable, find its j check connections and record edge indices
    var_edge_pos = np.zeros((n, j), dtype=np.int32)
    for v in range(n):
        checks = np.where(H[:, v])[0]          # j check indices
        for slot, c in enumerate(checks):
            within = int(np.where(check_vars[c] == v)[0][0])
            var_edge_pos[v, slot] = c * k + within

    return H, check_vars, var_edge_pos


def code_rate(j, k):
    return 1.0 - j / k
