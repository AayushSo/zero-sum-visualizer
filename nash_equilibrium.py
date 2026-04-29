import numpy as np
import matplotlib.pyplot as plt

def plot_mixed_equilibrium_surface(A, granularity=100):
    """
    Visualize expected payoff surface for a 2x2 zero-sum game,
    with best-response curves and Nash equilibrium point.
    """
    A = np.array(A)
    assert A.shape == (2, 2), "A must be 2x2"

    a, b = A[0, 0], A[0, 1]
    c, d = A[1, 0], A[1, 1]

    # Grid
    x_vals = np.linspace(0, 1, granularity)
    y_vals = np.linspace(0, 1, granularity)
    X, Y = np.meshgrid(x_vals, y_vals)

    # Payoff surface
    Z = np.zeros_like(X)
    for i in range(granularity):
        for j in range(granularity):
            x = X[i, j]
            y = Y[i, j]
            row = np.array([x, 1 - x])
            col = np.array([y, 1 - y])
            Z[i, j] = row @ A @ col

    # Plot surface
    plt.figure()
    contour = plt.contourf(X, Y, Z,cmap='bone')
    plt.colorbar(contour)

    # --- Best responses ---
    # Row player's best response depends on y
    y_line = np.linspace(0, 1, 500)

    # Payoff difference between row1 and row2
    row_diff = (a - c) * y_line + (b - d) * (1 - y_line)

    # Row best response curve (correspondence)
    # If diff > 0 → x=1, diff < 0 → x=0, diff=0 → mixed
    x_br = np.where(row_diff > 0, 1,
           np.where(row_diff < 0, 0, 0.5))

    plt.plot(x_br, y_line, linestyle='--', label="Row best response",color='tab:orange')

    # Column player's best response depends on x
    x_line = np.linspace(0, 1, 500)

    # Column minimizes row payoff → compare columns
    col_diff = (a - b) * x_line + (c - d) * (1 - x_line)

    y_br = np.where(col_diff > 0, 0,
       np.where(col_diff < 0, 1, 0.5))

    plt.plot(x_line, y_br, linestyle=':', label="Column best response",color='tab:orange')

    # --- Nash equilibrium ---
    denom = (a - b - c + d)

    if abs(denom) > 1e-8:
        y_star = (d - b) / denom
        x_star = (d - c) / denom

        if 0 <= x_star <= 1 and 0 <= y_star <= 1:
            plt.scatter([x_star], [y_star], s=150, marker='x', linewidths=2, label="Nash equilibrium",color='w')

    # Labels
    plt.xlabel("Row player strategy (prob of row 1)")
    plt.ylabel("Column player strategy (prob of col 1)")
    plt.title("Payoff Surface with Best Responses and Nash Equilibrium")
    plt.legend()

    plt.show()