# The Teardown Lab — Mission Authoring Guide (.json)

> **Complete guide to creating, sharing, and running custom structural engineering missions with zero code.**

---

## 1. Quick Start: The 60-Second Mission Template

To create a new mission, simply create a `.json` file (or paste this into the in-app **Mission Studio**).

```json
{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "my_first_bridge",
  "title": "My First Warren Truss",
  "subtitle": "Span a 10m ravine and support a 50 kN truck load.",
  "difficulty": "Introductory",
  "estimatedMinutes": 10,
  "scenario": "A rural community needs a simple crossing bridge over a creek.",
  "constraints": {
    "minFactorOfSafety": 1.5,
    "maxMassKg": 1500,
    "maxBudgetDollars": 3000,
    "maxDeflectionMm": 15.0
  },
  "nodes": [
    { "id": "n0", "x": 0, "y": 0, "support": "pinned" },
    { "id": "n1", "x": 5, "y": 0, "loadY": -50.0 },
    { "id": "n2", "x": 10, "y": 0, "support": "roller" },
    { "id": "n3", "x": 2.5, "y": 2.5 },
    { "id": "n4", "x": 7.5, "y": 2.5 }
  ],
  "members": [
    { "from": "n0", "to": "n1", "material": "steel", "section": "round_50mm" },
    { "from": "n1", "to": "n2", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "n4", "material": "steel", "section": "tube_80x4mm" },
    { "from": "n0", "to": "n3", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "n1", "material": "steel", "section": "round_30mm" },
    { "from": "n1", "to": "n4", "material": "steel", "section": "round_30mm" },
    { "from": "n4", "to": "n2", "material": "steel", "section": "round_50mm" }
  ]
}
```

That's it! Drag this file into the in-app **Mission Studio**, and The Teardown Lab instantly compiles the Direct Stiffness Matrix, runs the 60 FPS FEA solver, and renders the 3D physics viewport with zero JavaScript required.

---

## 2. Complete Field Reference

### Top-Level Metadata

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `string` | **Yes** | Unique identifier (lowercase alphanumeric with underscores). | `"pratt_railway_16m"` |
| `title` | `string` | **Yes** | Display title shown in the mission switcher and briefing modal. | `"The Heavy Freight Pratt Truss"` |
| `subtitle` | `string` | No | One-line teaser summarizing the engineering goal. | `"diagonals in tension, vertical posts in compression."` |
| `difficulty` | `string` | No | `"Introductory"`, `"Intermediate"`, or `"Advanced"`. Default: `"Intermediate"`. | `"Intermediate"` |
| `estimatedMinutes` | `number` | No | Expected completion time in minutes. Default: `15`. | `20` |
| `scenario` | `string` | No | Educational story, backstory, or real-world client specification. | `"A freight railway needs to cross a 16-meter river chasm..."` |
| `backgroundBriefing` | `string` | No | Physics theory or historical engineering context. | `"Patented in 1844 by Caleb Pratt..."` |
| `pedagogicalTakeaways` | `string[]` | No | Key takeaways for students. *(Auto-generated if omitted)*. | `["Top chords buckle under compression."]` |
| `suggestedLoadFactor`| `number` | No | Default load slider factor (1.0 = 100% design load). Default: `1.0`. | `1.0` |
| `tags` | `string[]` | No | Search and categorization tags. | `["Railway", "Pratt", "Buckling"]` |

---

### Constraints (`constraints`)

Sets the pass/fail criteria verified during testing and shown in the Mission Briefing:

| Field | Type | Default | Description |
|---|---|---|---|
| `minFactorOfSafety` | `number` | `1.5` | Minimum Factor of Safety (FOS) required on every member ($\ge 1.0$ is stable, $\ge 1.5$ is standard). |
| `maxMassKg` | `number` | `5000` | Maximum allowable total structure mass in kilograms (kg). |
| `maxBudgetDollars` | `number` | `10000` | Maximum structural budget in USD ($). |
| `maxDeflectionMm` | `number` | `25.0` | Maximum vertical displacement allowed at any joint in millimeters (mm). |

---

### Nodes (`nodes`)

Defines the joints of the structure in 2D or 3D space:

```json
{
  "id": "n1",
  "x": 4.0,
  "y": 0.0,
  "z": 0.0,
  "support": "pinned",
  "loadY": -60.0,
  "loadX": 0.0
}
```

#### Node Properties:
- `id` *(string, required)*: Unique joint identifier (e.g. `"n0"`, `"bot_left"`, `"peak"`).
- `x` *(number, required)*: Horizontal coordinate in **meters**.
- `y` *(number, required)*: Vertical coordinate in **meters** (height above ground).
- `z` *(number, optional)*: Out-of-plane coordinate in **meters** (defaults to `0` for 2D trusses).
- `support` *(string, optional)*: Boundary constraint type. See [Support Types](#support-types).
- `loadY` *(number, optional)*: Applied vertical force in **kiloNewtons (kN)**. Negative = downward gravity load. Example: `-50` represents $-50\text{ kN} = -50,000\text{ N}$.
- `loadX` *(number, optional)*: Applied horizontal force in **kiloNewtons (kN)**. Positive = rightward wind/seismic load.
- `fy` / `fx` *(number, optional)*: Direct force in **Newtons (N)** if preferred over kN.

---

### Members (`members`)

Defines structural bars connecting two nodes:

```json
{
  "from": "n0",
  "to": "n1",
  "material": "steel",
  "section": "tube_80x4mm"
}
```

Or array shorthand:
```json
["n0", "n1", "steel", "tube_80x4mm"]
```

#### Member Properties:
- `from` *(string, required)*: ID of the starting joint.
- `to` *(string, required)*: ID of the ending joint.
- `material` *(string, optional)*: Material identifier or alias. Default: `"steel"`. See [Material Catalog](#material-catalog).
- `section` *(string or object, optional)*: Cross-section preset or custom geometry. Default: `"round_50mm"`. See [Section Catalog](#section-catalog).

---

## 3. Support Types Reference

| Support Value | Visual Symbol | DOF Constraints `[x, y, z]` | Description |
|---|---|---|---|
| `"pinned"` or `"pin"` | Triangle with ground hatch | `[1, 1, 1]` | Fixed in X, Y, and Z. Free to rotate. Prevents translation in all directions. |
| `"roller"` or `"roller_x"` | Circle on wheels | `[0, 1, 1]` | Free to slide horizontally (X), fixed vertically (Y). Allows thermal expansion. |
| `"fixed"` | Solid clamp bar | `[1, 1, 1]` | Cantilever anchor wall. Completely restrains the joint. |
| `"free"` *(default)* | Open circular node | `[0, 0, 0]` | Free joint connecting web members and carrying external loads. |

> [!TIP]
> **Static Determinacy Tip**: For a 2D truss to be stable without rigid body motion, you typically need at least **one pinned support** and **one roller support** (preventing horizontal slip and vertical collapse while accommodating load deflection).

---

## 4. Material Catalog

You can specify materials using simple names. The system resolves all engineering mechanical properties:

| Shorthand Alias | Official Material Name | Modulus of Elasticity ($E$) | Yield Strength ($\sigma_y$) | Density ($\rho$) | Cost ($/kg) | Best For |
|---|---|---|---|---|---|---|
| `"steel"` or `"a36"` | ASTM A36 Structural Steel | 200 GPa | 250 MPa | 7,850 kg/m³ | $1.20 | Standard chords & bridges |
| `"hsla"` or `"hsla_steel"` | A572 Grade 50 HSLA Steel | 205 GPa | 345 MPa | 7,850 kg/m³ | $1.85 | Heavy machinery & crane jibs |
| `"aluminum"` or `"al_6061"` | Aluminum 6061-T6 | 69 GPa | 276 MPa | 2,700 kg/m³ | $4.50 | Lightweight aerospace structures |
| `"titanium"` or `"ti6al4v"` | Titanium Grade 5 (Ti-6Al-4V) | 114 GPa | 880 MPa | 4,430 kg/m³ | $38.00 | High-stress satellite booms |
| `"carbon_fiber"` or `"cfrp"` | Unidirectional Carbon Fiber | 140 GPa | 600 MPa | 1,600 kg/m³ | $65.00 | Ultra-stiff, featherweight tension ties |
| `"timber"` or `"wood"` | Douglas Fir (Glulam) | 13 GPa | 40 MPa | 550 kg/m³ | $0.80 | Architectural roofs & cabins |

---

## 5. Section Catalog

### Predefined Standard Sections (Shorthand Strings)

| Shorthand Alias | Geometry | Outer Diameter | Wall Thickness | Area ($A$) | Moment of Inertia ($I$) | Resistance to Buckling |
|---|---|---|---|---|---|---|
| `"round_30mm"` | Solid Round Bar | 30 mm | Solid | $7.07 \times 10^{-4}\text{ m}^2$ | $3.98 \times 10^{-8}\text{ m}^4$ | Low (Tension web only) |
| `"round_50mm"` | Solid Round Bar | 50 mm | Solid | $1.96 \times 10^{-3}\text{ m}^2$ | $3.07 \times 10^{-7}\text{ m}^4$ | Medium |
| `"round_80mm"` | Solid Round Bar | 80 mm | Solid | $5.03 \times 10^{-3}\text{ m}^2$ | $2.01 \times 10^{-6}\text{ m}^4$ | High |
| `"tube_80x4mm"` | Hollow Structural Tube | 80 mm | 4.0 mm | $9.55 \times 10^{-4}\text{ m}^2$ | $6.91 \times 10^{-7}\text{ m}^4$ | **Very High** (Best weight-to-buckling ratio) |
| `"tube_120x5mm"`| Hollow Structural Tube | 120 mm | 5.0 mm | $1.81 \times 10^{-3}\text{ m}^2$ | $2.97 \times 10^{-6}\text{ m}^4$ | **Maximum** (Long compressive chords) |

### Custom Parametric Sections (Object Syntax)

If you need a non-standard custom diameter, define an inline object:

#### Custom Solid Round Bar:
```json
{
  "from": "n1",
  "to": "n2",
  "section": {
    "shape": "round",
    "diameterMm": 65
  }
}
```

#### Custom Hollow Tube:
```json
{
  "from": "n1",
  "to": "n2",
  "section": {
    "shape": "tube",
    "diameterMm": 100,
    "thicknessMm": 6
  }
}
```
*The normalizer automatically applies $A = \pi (R_{out}^2 - R_{in}^2)$ and $I = \frac{\pi}{4}(R_{out}^4 - R_{in}^4)$ at load time.*

---

## 6. Theory Formulas & Smart Defaults

If you omit the `"formulas"` array, The Teardown Lab automatically injects standard pedagogical formulas:

1. **Hooke's Law**: $\sigma = \frac{F}{A}$ (Axial normal stress)
2. **Euler Critical Buckling Load**: $P_{cr} = \frac{\pi^2 E I}{(K L)^2}$ (Column bifurcation threshold)
3. **Factor of Safety**: $\text{FOS} = \min\left(\frac{\sigma_y}{\sigma_{\max}}, \frac{P_{cr}}{|P_{\text{comp}}|}\right)$
4. **Member Elongation / Contraction**: $\Delta L = \frac{F L}{E A}$

If you wish to provide custom formulas tailored to a specific class topic (e.g. thermal stress or indeterminate virtual work), you can add them explicitly:

```json
"formulas": [
  {
    "name": "Thermal Axial Expansion",
    "latex": "\\Delta L_{th} = \\alpha \\cdot L \\cdot \\Delta T",
    "description": "Temperature change induced displacement."
  }
]
```

---

## 7. Troubleshooting & Validation Checklist

When authoring a mission, the in-app Mission Studio validator checks for:

| Error / Warning | Cause | How to Fix |
|---|---|---|
| **"No boundary support detected"** | Structure has no pinned or roller supports. | Add `"support": "pinned"` to one anchor node and `"support": "roller"` to another. |
| **"Singular Stiffness Matrix / Mechanism"** | Truss is unconstrained or contains unbraced joints ($b + r < 2j$). | Add diagonal triangulating web members to prevent free hinges. |
| **"Reference to undefined node 'n8'"** | A member connects to a node ID that doesn't exist in `"nodes"`. | Verify spelling of `from` and `to` joint IDs. |
| **"Excessive Deflection"** | Loads are too high for chosen bar sizes. | Increase tube diameter (e.g. from `round_30mm` to `tube_80x4mm`) or reduce span. |

---

## 8. Exporting from the 3D Canvas (Visual Mode)

Prefer not to write JSON by hand?
1. Open **The Teardown Lab** in your browser.
2. Select **"Custom Sim"** from the top mission dropdown.
3. Use the **+ Joint** and **+ Bar** CAD tools to click and build your truss directly in 3D.
4. Click on joints in **Inspect** mode to set pinned/roller supports and drag forces.
5. Click **"Mission Studio"** in the top navigation bar.
6. Open the **"Save from 3D Canvas"** tab, type your mission title, and click **"Save to Missions"** or **"Download .json"**!
