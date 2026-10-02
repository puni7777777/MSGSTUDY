# The Teardown Lab (FailForward ME)

> **Interactive 3D Finite Element Mechanics & Destructive Engineering Laboratory for Modern Engineering Education.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-049ef4?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Store-4338ca?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Strict SI Units](https://img.shields.io/badge/Units-1%3A1_SI_Metric-10b981?style=for-the-badge)](#3d-viewport--11-si-metric-scale)
[![ESLint](https://img.shields.io/badge/Code_Quality-ESLint_Passed-22c55e?style=for-the-badge)](https://eslint.org/)

---

## 📌 Overview

**The Teardown Lab** is an interactive, browser-based structural physics flight deck and simulation workbench. Designed for undergraduate mechanical and civil engineering students, it bridges abstract mathematical formulas ($\sigma = F/A$, $P_{cr} = \frac{\pi^2 E I}{(KL)^2}$) with true physical intuition through **safe, real-time destructive engineering**.

Instead of penalizing failure or burying finite element physics behind cumbersome commercial CAD interfaces (like ANSYS or Abaqus), The Teardown Lab allows students to safely overload, buckle, and tear down structures at 60 FPS in 3D WebGL. Failure becomes the ultimate diagnostic teaching tool.

```
                      THE FAILFORWARD LOOP
                      
    ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ 1.OBSERVE│ ───► │2.OVERLOAD│ ───► │3.DIAGNOSE│ ───► │4.OPTIMIZE│
    └──────────┘      └──────────┘      └──────────┘      └──────────┘
      Live Force       Scrub load to      Euler Buckling    Swap alloy,
      paths & SFD/     150%+ or run       vs Yield post-    increase OD,
      BMD contours     Teardown           mortem autopsy    re-test FOS
```

---

## 🚀 Key Features

### 1. Real-Time 3D Direct Stiffness FEA Engine
- **Direct Stiffness Method Solver**: 60 FPS computational engine solving global system $[K]\{u\} = \{F\}$ to extract exact nodal displacements, member axial forces, and support reactions.
- **Strict 1:1 SI Physical Metric Scale**: 1 Three.js world unit = exactly $1.0\text{ meter}$. A 1-meter member occupies precisely 1.0 m in 3D space with zero global distortion.
- **Dynamic Displacement Magnification**: Adjustable `deformationScale` (1&times; to 200&times;) to render micro-millimeter elastic deflection curves visible on standard computer displays.

### 2. Destructive Load Scrubber & Failure Autopsy
- **Applied Load Demand Slider**: Scrub external load demands dynamically from 0% to 300% of design rating.
- **Progressive Collapse Algorithm**: Incremental failure stepping that simulates Euler column buckling, elastic bifurcation, plastic yield, and load redistribution across surviving members.
- **Post-Mortem Autopsy Modal**: Detailed diagnostic debrief identifying the governing collapse trigger, failed member ID, peak stress at failure, and recommended structural interventions.

### 3. Analytical Theory Manual & Live Scratchpad
- **Live Injected Formulas**: Select any truss member in the 3D canvas to immediately inject its real-time force ($F$), cross-sectional area ($A$), length ($L$), and moment of inertia ($I$) into:
  - **Hooke's Law**: $\sigma = \frac{F}{A}$
  - **Euler Critical Buckling Load**: $P_{cr} = \frac{\pi^2 E I}{(K L)^2}$
  - **Governing Factor of Safety**: $\text{FOS} = \min\left(\frac{\sigma_y}{|\sigma|}, \frac{P_{cr}}{|F|}\right)$
  - **Axial Elongation**: $\Delta L = \frac{F \cdot L}{A \cdot E}$
- **Interactive Numeric Steppers**: Students can override variables with custom up/down steppers to perform sensitivity "what-if" calculations without leaving the lab.

### 4. ANSYS 8-Stop Stress Heatmap & SFD / BMD Overlays
- **ANSYS Spectrum**: Accurate Jet engineering contour mapping (Deep Navy $\to$ Sky Blue $\to$ Cyan $\to$ Emerald $\to$ Yellow $\to$ Orange $\to$ Crimson).
- **Auto & Custom Stress Limits**: Automatic peak detection (+15% visual headroom) or manual upper/lower limit threshold adjustments to reveal subtle low-stress force pathways.
- **Shear & Moment Diagrams**: Real-time Shear Force Diagram (SFD) and Bending Moment Diagram (BMD) computed across structural spans using exact singularity integrals.

### 5. Universal Mission System & In-Browser Mission Studio
- **Declarative `mission.v1.json` Format**: Define structural challenges, nodes, members, constraints, and keep-out zones completely in JSON without writing code.
- **Mission Studio Modal**: Integrated in-app visual CAD canvas, 1-click JSON exporter, built-in schema validator, and challenge browser.
- **Rich Mission Catalog**: Built-in challenges including Warren Truss River Crossing, Pratt Truss Railway Bridge, Howe Truss, K-Truss, Cantilever Balcony, and Crane Jib.

### 6. Multi-Course Academic Curriculum Portal
- **ME-201**: Engineering Statics & Computational Finite Element Analysis (Active 3D Virtual Lab).
- **ME-204**: Thermodynamics & Applied Heat Transfer (Interactive Rankine, Otto, Diesel, and Brayton cycle sandboxes).
- **ME-301**: Fluid Mechanics & Aerodynamics (Airfoil wind tunnel, Bernoulli venturi tube, and boundary layer analysis).
- **ME-308**: Machine Component Design & Fatigue (S-N Wöhler curves, Goodman/Soderberg fatigue criteria, gear train contact stresses).

---

## 🎮 Interactive Controls & Hotkeys

| Input Gesture / Key | Action | Description |
| :--- | :--- | :--- |
| **Left Click + Drag** | Orbit Camera | Rotates 3D viewpoint around the structure centroid |
| **Right Click + Drag** | Pan Camera | Translates the camera horizontally and vertically |
| **Scroll Wheel / Pinch** | Dolly Zoom | Smoothly zooms in on joints and high-stress members |
| **Click Member / Joint** | Inspect Element | Opens telemetry inspector and injects parameters into Theory Scratchpad |
| <kbd>G</kbd> | **Toggle 1m Grid** | **Toggles 1.0m &times; 1.0m reference ground grid and coordinate axes ON/OFF** |
| `FRONT` / `ISO` / `TOP` / `SIDE` | Camera Presets | Snaps camera to standard orthographic and isometric engineering planes |
| `SFD / BMD` Button | Diagram Overlay | Toggles synchronized Shear Force and Bending Moment Diagrams |
| `Theory Manual` Button | Scratchpad | Opens the analytical mechanics equations and sensitivity controls |
| `Reset` Button | State Restore | Restores current mission geometry and loads to initial baseline |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Runtime**: [React 19](https://react.dev/)
- **3D Graphics Kernel**: [Three.js](https://threejs.org/) with WebGL hardware-accelerated rendering
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a specialized dark aerospace flight-deck theme
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Dialect**: Pure ECMAScript (Strict `.js` and `.jsx` policy; zero TypeScript compile overhead)

```
msgstudy/
├── src/
│   ├── app/                               # Next.js App Router routes
│   │   ├── page.js                        # Multi-course catalog portal
│   │   ├── layout.js                      # Root application layout
│   │   ├── docs/page.js                   # Comprehensive in-app documentation (/docs)
│   │   └── subjects/[id]/page.js          # Dynamic course lab router (ME-201, ME-204, etc.)
│   ├── components/
│   │   ├── canvas/
│   │   │   └── TrussViewport3D.jsx        # 3D Three.js WebGL viewport (1:1 SI metric scale)
│   │   ├── hud/                           # Avionics HUD flight-deck telemetry
│   │   │   ├── BuilderToolbar.jsx         # View presets, Grid toggle, CAD tools
│   │   │   ├── HeaderNav.jsx              # Mission switcher, Studio trigger, Objective links
│   │   │   ├── InspectorPanel.jsx         # Joint coordinates, member material/section editor
│   │   │   ├── LoadScrubber.jsx           # Load multiplier slider & Teardown failure trigger
│   │   │   ├── MissionStudioModal.jsx     # Visual CAD builder, JSON validator & exporter
│   │   │   ├── NumericStepperInput.jsx    # Accessible engineering parameter stepper
│   │   │   ├── PostMortemModal.jsx        # Failure autopsy & diagnostic review
│   │   │   ├── SfdBmdDiagram.jsx          # Live Shear & Moment diagrams (HTML5 2D Canvas)
│   │   │   ├── StressLegend.jsx           # 8-stop ANSYS contour scale & limit controls
│   │   │   ├── TelemetryBar.jsx           # Real-time FOS, mass, budget, max deflection gauges
│   │   │   └── TheoryCalculationPanel.jsx # Analytical scratchpad with live Hooke/Euler math
│   │   ├── layout/                        # Course navigation and subject preview modals
│   │   └── subjects/                      # Specialized sandboxes (Thermo, Fluids, Machine Design)
│   ├── content/
│   │   ├── challenges/                    # Predefined engineering missions
│   │   └── courses/                       # University subject catalog definitions
│   └── core/
│       ├── materials/                     # Material database (Steel, Aluminum, Titanium, Carbon)
│       ├── missions/                      # Universal JSON schema, validator & registry
│       ├── simulation/
│       │   └── trussFea.js                # Direct Stiffness Method 3D FEA kernel
│       └── store/
│           └── useSimulationStore.js      # Global reactive Zustand simulation state
├── docs/
│   └── MISSION_AUTHORING_GUIDE.md         # Comprehensive JSON mission authoring manual
├── DESIGN.md                              # Flight-deck design system, tokens & typography
├── PRODUCT.md                             # Pedagogical philosophy & product principles
└── package.json                           # Project dependencies and npm scripts
```

---

## ⚡ Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.17.0 or higher recommended)
- `npm` (bundled with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/msgstudy.git
   cd msgstudy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Course Portal**: `http://localhost:3000/`
- **ME-201 Statics & 3D FEA Flight Deck**: `http://localhost:3000/subjects/me-201`
- **Full In-App Documentation**: `http://localhost:3000/docs`

### Building for Production
```bash
npm run build
npm run start
```

### Code Quality & Linting
Run the ESLint suite:
```bash
npm run lint
```

---

## 📐 Mechanics & Governing Equations

### 1. Direct Stiffness Matrix Method
The simulation represents each bar as a 2-node, 6-degree-of-freedom axial element in 3D Cartesian coordinates ($x, y, z$). The local element stiffness matrix $[k']$ is:

$$[k'] = \frac{A E}{L} \begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix}$$

Using direction cosines $(\lambda_x, \lambda_y, \lambda_z)$, element matrices are transformed to global coordinates:

$$[k_e] = [T]^T [k'] [T]$$

Global assembly satisfies the fundamental equilibrium:

$$\mathbf{[K]} \mathbf{\{u\}} = \mathbf{\{F\}}$$

Boundary constraints (pinned, roller, fixed) are enforced via matrix partitioning, solving for unknown displacements $\{u\}$ and support reaction forces $\{R\}$.

### 2. Normal Axial Stress (Hooke's Law)
$$\sigma = \frac{F}{A}$$
- Tension ($F > 0$): Represented in Sky Blue.
- Compression ($F < 0$): Represented in Amber / Orange.

### 3. Euler Critical Column Buckling
For compressive members ($F < 0$), the critical buckling load $P_{cr}$ is computed using the Euler column formula with effective length factor $K = 1.0$ (pinned-pinned idealization):

$$P_{cr} = \frac{\pi^2 E I}{(K L)^2}$$

Where the second moment of area $I$ for solid and hollow circular tubes is:
- **Solid Bar**: $I = \frac{\pi}{4} r^4$
- **Hollow Tube**: $I = \frac{\pi}{4} (r_o^4 - r_i^4)$

### 4. Factor of Safety (FOS)
$$\text{FOS} = \min \left( \frac{\sigma_y}{|\sigma|}, \; \frac{P_{cr}}{|F|} \right)$$
- $\text{FOS} \ge 1.5$: Safe (Certified).
- $1.0 \le \text{FOS} < 1.5$: Sub-optimal (Marginal warning).
- $\text{FOS} < 1.0$: Critical Structural Failure (Triggers collapse autopsy).

---

## 📝 Universal Mission Schema (`mission.v1.json`)

You can create, share, and import custom missions without writing any code. Below is a minimal working mission file:

```json
{
  "schemaVersion": "mission.v1",
  "id": "cantilever_triangle",
  "name": "Cantilever Wall Truss",
  "description": "Evaluate shear and bending reactions of a wall-mounted triangular bracket.",
  "difficulty": "Intermediate",
  "category": "Civil / Aerospace",
  "suggestedLoadFactor": 1.0,
  "nodes": [
    { "id": "N0", "x": 0.0, "y": 0.0, "z": 0.0, "supportType": "pinned", "fx": 0, "fy": 0, "fz": 0 },
    { "id": "N1", "x": 0.0, "y": 2.0, "z": 0.0, "supportType": "roller_y", "fx": 0, "fy": 0, "fz": 0 },
    { "id": "N2", "x": 3.0, "y": 0.0, "z": 0.0, "supportType": "free", "fx": 0, "fy": -25000, "fz": 0 }
  ],
  "members": [
    {
      "id": "M0",
      "nodeAId": "N0",
      "nodeBId": "N2",
      "materialId": "structural_steel_a36",
      "crossSection": { "type": "pipe_standard", "outerRadius": 0.04, "innerRadius": 0.034 }
    },
    {
      "id": "M1",
      "nodeAId": "N1",
      "nodeBId": "N2",
      "materialId": "structural_steel_a36",
      "crossSection": { "type": "pipe_standard", "outerRadius": 0.04, "innerRadius": 0.034 }
    },
    {
      "id": "M2",
      "nodeAId": "N0",
      "nodeBId": "N1",
      "materialId": "structural_steel_a36",
      "crossSection": { "type": "pipe_standard", "outerRadius": 0.04, "innerRadius": 0.034 }
    }
  ],
  "constraints": {
    "minFactorOfSafety": 1.6,
    "maxDeflectionMm": 15.0,
    "maxMassKg": 300.0,
    "maxBudgetDollars": 2000.0
  }
}
```

> **Detailed Guide**: For comprehensive field explanations, material properties, and authoring guidelines, see [`docs/MISSION_AUTHORING_GUIDE.md`](docs/MISSION_AUTHORING_GUIDE.md).

---

## 📚 Further Documentation

- **In-App Developer Guide**: Navigate to [`http://localhost:3000/docs`](http://localhost:3000/docs) for full interactive documentation.
- **Mission Authoring Guide**: [`docs/MISSION_AUTHORING_GUIDE.md`](docs/MISSION_AUTHORING_GUIDE.md)
- **Design Tokens & UI Philosophy**: [`DESIGN.md`](DESIGN.md)
- **Product Architecture & Principals**: [`PRODUCT.md`](PRODUCT.md) and [`TEARDOWN_LAB_ARCHITECTURE.md`](TEARDOWN_LAB_ARCHITECTURE.md)

---

## 📄 License

This project is licensed under the MIT License — see the repository for full license details.
