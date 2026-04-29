# Game Theory Visualizer

An interactive web-based tool for exploring Nash Equilibria in 2×2 zero-sum games. Features dynamic payoff surface visualization, best-response correspondence curves, and real-time calculation of mixed-strategy equilibria.

**Live Demo:** https://AayushSo.github.io/zero-sum-visualizer

## Features

- **Interactive 2×2 Matrix Input** — Dynamically edit payoff values with instant plot updates
- **Payoff Surface Visualization** — Contour plot showing expected payoff across the unit square
- **Nash Equilibrium Calculation** — Automatic detection and visualization of:
  - Mixed-strategy equilibria with (x*, y*) coordinates
  - Pure-strategy equilibria at corner solutions
- **Best-Response Curves** — Overlay of row and column player best-response correspondences
- **Special Case Detection** — Dynamic notes for:
  - Classic mixed strategy (matching pennies)
  - Saddle point equilibria
  - Strictly dominated strategies
- **Preset Matrices** — Quick-load buttons for common game theory examples
- **Glassmorphic Design** — Modern, responsive UI with dark theme

## Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Visualization:** Plotly.js (interactive 3D contours, zoomable, hoverable)
- **Deployment:** GitHub Pages (static site)

## Project Structure

```
.
├── index.html        # Main HTML structure
├── style.css         # Styling and glassmorphism effects
├── script.js         # Core visualization and Nash equilibrium logic
├── contact.txt       # Social media links (JSON format)
├── nash_equilibrium.py # Reference implementation (Python)
└── README.md         # This file
```

## How to Use

1. **Edit the Matrix** — Click on any of the four input cells and type a payoff value
2. **Watch the Plot Update** — The contour surface, equilibrium point, and best responses update instantly
3. **Load Presets** — Use the preset buttons to explore classic game theory examples
4. **Inspect Special Cases** — Check the note below the graph for game-theory insights

## Mathematics

### Payoff Surface

For row player strategy x ∈ [0,1] (probability of Row 1) and column player strategy y ∈ [0,1] (probability of Column 1), the expected payoff is:

```
Z(x, y) = [x, 1-x] * A * [y, 1-y]ᵀ
```

where A is the 2×2 payoff matrix.

### Nash Equilibrium (Mixed Strategy)

If the denominator d = a - b - c + d is non-zero, the mixed-strategy Nash equilibrium is:

```
x* = (d - c) / d
y* = (d - b) / d
```

If (x*, y*) ∈ [0,1]², it is the unique mixed-strategy equilibrium. Otherwise, the equilibrium is pure.

## Reference Implementation

The file `nash_equilibrium.py` contains the original Python implementation using NumPy and Matplotlib. It serves as a mathematical reference for understanding the logic behind the visualizations. All game theory calculations have been ported to JavaScript and run entirely in the browser.

## Deployment

This project is deployed as a static site on GitHub Pages. No backend server or build process is required.

To deploy your own fork:
1. Push changes to your GitHub repository
2. Go to **Settings → Pages**
3. Select **Deploy from a branch** → `main` branch, `/ (root)` folder
4. Your site will be live at `https://<username>.github.io/zero-sum-visualizer`

## Author

**Aayush Soni**

- GitHub: https://github.com/AayushSo
- LinkedIn: https://www.linkedin.com/in/i-am-aayush-soni/

## License

MIT License — Feel free to use, modify, and distribute this project.
