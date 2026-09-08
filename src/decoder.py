"""
Vectorised log-domain sum-product (belief propagation) decoder for LDPC codes.

Message convention: LLR > 0 favours bit = 0.

Edge indexing: edge e = check_id * k + within_check_position.
  q_msgs[e]  variable-to-check LLR
  r_msgs[e]  check-to-variable LLR
Both arrays have shape (m*k,) = (n*j,).
"""

import numpy as np

_EPS = 1e-15    # numerical floor to avoid log(0) and arctanh(1)
_CLIP = 30.0    # clip LLRs before tanh to prevent overflow


def bp_decode(check_vars, var_edge_pos, llr_ch, j, k, max_iter=50):
    """
    Log-domain sum-product belief propagation.

    Parameters
    ----------
    check_vars   : (m, k) int array  — variable indices per check node
    var_edge_pos : (n, j) int array  — edge indices per variable node
    llr_ch       : (n,) float array  — channel LLRs
    j, k         : column/row weights
    max_iter     : maximum iterations

    Returns
    -------
    decision  : (n,) uint8 — decoded bits
    n_iters   : iterations used (< max_iter when syndrome = 0 early)
    converged : bool
    """
    m = check_vars.shape[0]
    n_edges = m * k

    # Initialise variable-to-check messages with channel LLRs
    q_msgs = llr_ch[check_vars].flatten().copy()    # (m*k,)
    r_msgs = np.zeros(n_edges, dtype=np.float64)

    for it in range(max_iter):

        # ----------------------------------------------------------------
        # Check node update  (log-domain product rule)
        # r[j->i] = sign_excl * 2*arctanh( prod_{i'!=i} |tanh(q[i'->j]/2)| )
        # ----------------------------------------------------------------
        q_c = q_msgs.reshape(m, k)

        # Sign product, exclude self:  sign_excl = total_sign * self  (since s = ±1)
        sign_q     = np.sign(np.where(np.abs(q_c) < _EPS, _EPS, q_c))
        total_sign = np.prod(sign_q, axis=1, keepdims=True)            # (m,1)
        sign_excl  = total_sign * sign_q                               # (m,k)

        # Log-magnitude product, exclude self
        log_abs_tanh = np.log(
            np.abs(np.tanh(np.clip(q_c, -_CLIP, _CLIP) / 2.0)) + _EPS
        )                                                              # (m,k)
        total_log = np.sum(log_abs_tanh, axis=1, keepdims=True)        # (m,1)
        log_excl  = total_log - log_abs_tanh                           # (m,k)

        # Reconstruct check-to-variable messages
        arg    = np.clip(np.exp(log_excl), 0.0, 1.0 - _EPS)
        r_msgs = (sign_excl * 2.0 * np.arctanh(arg)).flatten()         # (m*k,)

        # ----------------------------------------------------------------
        # Variable node update + posterior LLR
        # q[i->j] = L_ch[i] + sum_{j'!=j} r[j'->i]   (extrinsic)
        # ----------------------------------------------------------------
        r_v    = r_msgs[var_edge_pos]                       # (n, j)
        r_sum  = np.sum(r_v, axis=1)                        # (n,)
        llr_post = llr_ch + r_sum                           # (n,)

        decision = (llr_post < 0.0).astype(np.uint8)

        # Syndrome check: all parity equations satisfied?
        syndromes = np.sum(decision[check_vars], axis=1) % 2   # (m,)
        if np.all(syndromes == 0):
            return decision, it + 1, True

        # Update variable-to-check messages (extrinsic: subtract self)
        q_msgs[var_edge_pos] = (
            llr_ch[:, np.newaxis] + r_sum[:, np.newaxis] - r_v
        )

    return decision, max_iter, False


def bp_decode_record(check_vars, var_edge_pos, llr_ch, j, k, max_iter=50):
    """
    Same as bp_decode but returns the bit-error count at each iteration.
    Used for convergence analysis (original contribution).

    Returns
    -------
    decision         : (n,) uint8
    errors_per_iter  : (max_iter,) int  — cumulative bit errors at each iteration
    """
    m      = check_vars.shape[0]
    n      = var_edge_pos.shape[0]
    n_edges = m * k

    q_msgs = llr_ch[check_vars].flatten().copy()
    r_msgs = np.zeros(n_edges, dtype=np.float64)
    errors_per_iter = np.zeros(max_iter, dtype=np.int64)
    last_errs = n   # worst case

    for it in range(max_iter):
        q_c        = q_msgs.reshape(m, k)
        sign_q     = np.sign(np.where(np.abs(q_c) < _EPS, _EPS, q_c))
        total_sign = np.prod(sign_q, axis=1, keepdims=True)
        sign_excl  = total_sign * sign_q
        log_abs_tanh = np.log(
            np.abs(np.tanh(np.clip(q_c, -_CLIP, _CLIP) / 2.0)) + _EPS
        )
        total_log  = np.sum(log_abs_tanh, axis=1, keepdims=True)
        log_excl   = total_log - log_abs_tanh
        arg        = np.clip(np.exp(log_excl), 0.0, 1.0 - _EPS)
        r_msgs     = (sign_excl * 2.0 * np.arctanh(arg)).flatten()

        r_v        = r_msgs[var_edge_pos]
        r_sum      = np.sum(r_v, axis=1)
        llr_post   = llr_ch + r_sum
        decision   = (llr_post < 0.0).astype(np.uint8)

        errs = int(np.sum(decision))    # all-zero TX, so errors = decoded 1s
        errors_per_iter[it] = errs
        last_errs = errs

        syndromes = np.sum(decision[check_vars], axis=1) % 2
        if np.all(syndromes == 0):
            # Converged — fill remaining iterations with current error count
            errors_per_iter[it + 1:] = errs
            break

        q_msgs[var_edge_pos] = (
            llr_ch[:, np.newaxis] + r_sum[:, np.newaxis] - r_v
        )

    return decision, errors_per_iter
