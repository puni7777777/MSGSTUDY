# The Teardown Lab ("FailForward ME")
## System Architecture & Engineering Implementation Blueprint

---

## 1. Project Overview & Pedagogical Philosophy

### Core Problem
Traditional engineering education relies heavily on static 2D textbook problems, dry derivation of formulas, or heavyweight, unintuitive CAD/FEA packages (e.g., ANSYS, SolidWorks) with steep learning curves and slow feedback loops.

### The Solution
A gamified, physics-first web platform where users build, tweak, and intentionally stress mechanical systems (trusses, shafts, linkages, thermodynamic cycles, fluid channels) until they fail or hit target efficiency.

### Pedagogical Loop
1. **Play / Break:** Manipulate visual parameters in real time with immediate graphical feedback (stress heatmaps, velocity vectors, deformation).
2. **Inspect / Understand:** Contextual formulas and diagrams (e.g., SFD/BMD, P-v curves, Mohr's circle) unlock dynamically to explain *why* the system behaved as it did.
3. **Engineer / Challenge:** Solve constrained problems with engineering metrics (Factor of Safety $\ge 1.5$, mass minimization, thermal efficiency targets, strict component budget).

---

## 2. Executive Stack Evaluation & Architecture Decisions

```
+----------------------------------------------------------------------------------------------------+
|                                         CLIENT BROWSER                                             |
|                                                                                                    |
|  +--------------------------------+                  +------------------------------------------+  |
|  |       MAIN UI THREAD           |                  |           WEB WORKER POOL                |  |
|  |                                |                  |                                          |  |
|  |  React 19 / Next.js (App Router)|                  |  Dedicated Worker (Physics & FEA)        |  |
|  |  Tailwind CSS v4 + Radix HUD   |                  |                                          |  |
|  |  Zustand (Transient Stores)    |                  |  +------------------------------------+  |  |
|  |                                |                  |  |  Rust / Wasm Kernel                |  |  |
|  |  +--------------------------+  | SharedArrayBuffer|  |  - Direct Stiffness Method (FEA)   |  |  |
|  |  | R3F / Three.js Viewport  |  |<================>|  |  - Sparse Cholesky / Conjugate Grad|  |  |
|  |  | - InstancedMesh Bars     |  | (Double Buffered)|  |  - Runge-Kutta Integrators (RK4)   |  |  |
|  |  | - Custom Stress Shaders  |  |                  |  |  - Rapier WASM (Rigid Dynamics)    |  |  |
|  |  +--------------------------+  |                  +------------------------------------+  |  |
|  |  +--------------------------+  |                  +------------------------------------------+  |
|  |  | Canvas2D Telemetry       |  |                                                                |
|  |  | - SFD/BMD, P-v Diagrams  |  |                                                                |
|  |  +--------------------------+  |                                                                |
|  +--------------------------------+                                                                |
+----------------------------------------------------------------------------------------------------+
```

### Stack Decisions & Trade-Offs

| Layer | Recommended Choice | Justification & Architectural Constraints |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router, TS)** | Use SSR/SSG for static curriculum text, challenge briefings, and SEO. **Critical:** Dynamic import client-only simulation viewports with `ssr: false` to prevent WebGL/WASM hydration mismatches. |
| **UI State** | **Zustand (Transient Stores)** | React component state re-renders destroy frame budgets at 60 FPS. Zustand stores subscribe transiently to values, updating Three.js uniform buffers and DOM gauge nodes via direct ref mutations. |
| **3D Rendering** | **Three.js / React Three Fiber** | Declarative scene graph with fine-grained imperative escapes (`useFrame`). Custom GLSL `ShaderMaterial` instances handle stress heatmaps and amplified deformation directly on the GPU. |
| **2D Telemetry** | **Offscreen Canvas / Chart.js** | Avoid heavy SVG DOM manipulation for real-time graphs (e.g., SFD/BMD, Bode plots, indicator diagrams). Render telemetry to an HTML5 `<canvas>` via direct pixel updates. |
| **Continuum Solvers** | **Rust $\rightarrow$ WebAssembly** | JavaScript float math is prone to V8 deoptimizations. Rust compiles to WebAssembly with SIMD acceleration for matrix inversion, finite element assembly, and numerical integration. |
| **Destructive Dynamics** | **Rapier.js (WASM)** | When a member exceeds yield/buckling limits, transition its kinematic constraint into a Rapier.js dynamic rigid body to simulate catastrophic collapse, flying debris, and secondary impacts. |
| **Worker Threads** | **Web Workers + SharedArrayBuffer** | Decouples simulation ticks (120–240 Hz) from the browser render loop (60–120 Hz). Shared memory with atomic flags eliminates serialization overhead. |

---

## 3. Low-Latency Data Pipeline & Memory Architecture

```
[User Slider / Viewport Drag]
             │
             ▼
[Transient Zustand Input Store] (Main Thread: 0ms render cost)
             │
   (Atomic Pointer Swap)
             ▼
[SharedArrayBuffer: Input Region]
   - Node Coordinates [x, y, z]
   - Boundary Conditions [fixed, pinned, roller]
   - External Loads [Fx, Fy, Fz]
             │
             ▼
[Web Worker: Rust / WASM FEA Kernel] (120 Hz - 240 Hz Tick)
   1. Assemble Global Stiffness Matrix: [K]
   2. Apply Reduced DOF Boundary Constraints: [K_reduced]
   3. Sparse Cholesky Decomposition: [K_red] * {U} = {F}
   4. Recover Internal Axial Forces & Bending Moments
   5. Compute Stress (von Mises) & Euler Buckling Limits:
        P_cr = (pi^2 * E * I) / (K_eff * L)^2
   6. Yield Check: If sigma > sigma_yield -> Trigger Fracture Event
             │
             ▼
[SharedArrayBuffer: Output Telemetry Region]
   - Per-Node Displacements [dx, dy, dz]
   - Per-Element Stress Ratios [sigma / sigma_yield]
   - Member State Flags [INTACT, PLASTIC, BUCKLED, BROKEN]
             │
   (requestAnimationFrame)
             ▼
[Three.js / WebGL Render Pipeline] (Main Thread: 60 FPS)
   ├── Dynamic Buffer Attribute: Update InstancedMesh matrices
   ├── Uniforms: Pass deformation_scale and colormap ranges
   └── GLSL Vertex Shader:
         vPosition = position + (displacement * uDeformScale);
         vStressRatio = aStressRatio;
   └── GLSL Fragment Shader:
         gl_FragColor = texture(uStressColorRamp, vec2(vStressRatio, 0.5));
```

### High-Frequency Data Sync Strategy
1. **Double-Buffered `SharedArrayBuffer`:** Avoids read-write race conditions. The WASM solver writes to the back buffer; on completion, an atomic flag swaps the active buffer index for the render thread.
2. **Zero-Allocation Render Loops:** In `useFrame`, no objects, vectors, or arrays are instantiated. Data is read directly from typed array views (`Float32Array`) and passed into WebGL `InstancedBufferAttribute` via `needsUpdate = true`.

---

## 4. Production Project Directory Structure

```
msgstudy/
├── crates/                               # Rust WebAssembly Crates
│   ├── fea_core/                         # Direct Stiffness Method & Frame Element Solvers
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                    # WASM bindings (wasm-bindgen)
│   │       ├── matrix.rs                 # Sparse matrix & Cholesky linear solver
│   │       ├── truss.rs                  # 2D/3D pin-jointed structural solver
│   │       ├── beam.rs                   # Timoshenko & Euler-Bernoulli beam elements
│   │       └── failure.rs                # Euler buckling & von Mises criteria
│   ├── kinematics_core/                  # Linkage, gear trains & dynamic integrators
│   └── fluid_lbm/                        # 2D Lattice Boltzmann D2Q9 fluid solver
│
├── public/
│   ├── models/                           # Base GLTF/GLB engineering components
│   └── wasm/                             # Compiled .wasm and glue code binaries
│
├── src/
│   ├── app/                              # Next.js App Router (16.x / React 19)
│   │   ├── (curriculum)/                 # Educational tracks
│   │   │   ├── statics-trusses/
│   │   │   │   ├── [challengeId]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── mechanics-materials/page.tsx
│   │   │   ├── kinematics-linkages/page.tsx
│   │   │   ├── thermo-cycles/page.tsx
│   │   │   └── vibrations-controls/page.tsx
│   │   ├── api/
│   │   │   ├── challenges/route.ts       # Challenge submission validation & score
│   │   │   └── designs/route.ts          # Save/load user-engineered rigs
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Landing & Module Selector
│   │
│   ├── components/
│   │   ├── canvas/                       # 3D Viewport & WebGL elements
│   │   │   ├── SimulationViewport.tsx    # R3F Canvas wrapper with CanvasErrorBoundary
│   │   │   ├── SceneLighting.tsx
│   │   │   ├── elements/
│   │   │   │   ├── InstancedTrussMesh.tsx # Instanced 3D bar elements with deformation
│   │   │   │   ├── NodePinMesh.tsx       # Support pins, rollers, and load points
│   │   │   │   └── ForceVectorArrow.tsx  # Dynamic 3D load vectors
│   │   │   └── shaders/
│   │   │       ├── stressHeatmap.vert.glsl
│   │   │       └── stressHeatmap.frag.glsl
│   │   │
│   │   ├── hud/                          # Engineering UI & Instrumentation
│   │   │   ├── ControlPanel.tsx          # Sliders, material selection, load scrubbers
│   │   │   ├── TelemetryHUD.tsx          # Real-time Factor of Safety (FOS), Mass, Cost
│   │   │   ├── diagrams/
│   │   │   │   ├── ShearBendingDiagram.tsx # Real-time SFD/BMD canvas overlay
│   │   │   │   ├── StateDiagramPvTs.tsx  # Thermodynamic cycle P-v / T-s charts
│   │   │   │   └── BodePlotCanvas.tsx    # Frequency response & phase margin
│   │   │   └── Modals/
│   │   │       └── FailureReportModal.tsx # Exploded post-mortem analysis
│   │   │
│   │   └── ui/                           # Primitive components (Tailwind v4 / Radix)
│   │       ├── slider.tsx
│   │       ├── button.tsx
│   │       ├── gauge.tsx
│   │       └── tabs.tsx
│   │
│   ├── core/                             # Client Orchestration & Engine Bridges
│   │   ├── workers/
│   │   │   ├── fea.worker.ts             # Web Worker managing Rust WASM execution
│   │   │   └── worker-pool.ts            # Worker lifecycle & SharedArrayBuffer manager
│   │   ├── bridge/
│   │   │   ├── FeaBridge.ts              # Typed RPC interface for main-thread -> worker
│   │   │   └── MemoryLayout.ts           # SharedArrayBuffer byte offsets & strides
│   │   ├── store/
│   │   │   ├── useSimulationStore.ts     # Transient high-frequency telemetry store
│   │   │   ├── useChallengeStore.ts      # Objective completion, budget, targets
│   │   │   └── useUIStore.ts             # Camera presets, display overlays (SFD/BMD)
│   │   └── types/
│   │       ├── simulation.ts             # Geometry, loads, boundary condition types
│   │       └── materials.ts              # Young's modulus, yield stress, density tables
│   │
│   └── content/                          # Declarative Challenge Database
│       └── challenges/
│           ├── statics/
│           │   ├── 01-pratt-truss.json
│           │   └── 02-crane-jib.json
│           └── mechanics/
│               └── 01-stepped-shaft-torsion.json
```

---

## 5. Four-Phase Implementation Roadmap

```
+----------------------------------------------------------------------------------------------------+
| PHASE 1: FEA FOUNDATION & TRUSS DESTRUCTION (Weeks 1 - 6)                                          |
| - Rust 2D/3D Direct Stiffness Solver (WASM)                                                        |
| - Double-buffered SharedArrayBuffer bridge to R3F                                                  |
| - Instanced deformation & von Mises GLSL shader                                                    |
| - Destructive Buckling & Yield post-mortem sandbox                                                 |
| - Module 1 Complete: 5 progressive truss challenges (Bridge, Crane, Tower)                          |
+----------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+----------------------------------------------------------------------------------------------------+
| PHASE 2: CONTINUUM MECHANICS & DYNAMICS INTEGRATION (Weeks 7 - 12)                                 |
| - Beam bending (Timoshenko), Transverse Shear, and Shaft Torsion solvers                           |
| - Real-time synchronized 2D Shear-Force & Bending-Moment Diagrams (SFD/BMD)                        |
| - Rapier.js dynamic hand-off: structural failure transitions to rigid-body collapse                |
| - Kinematics module: 4-bar linkage synthesis, Grashof criteria, and coupler curves                 |
+----------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+----------------------------------------------------------------------------------------------------+
| PHASE 3: FLUIDS, THERMODYNAMICS & CONTROLS (Weeks 13 - 18)                                         |
| - State-variable Thermodynamic cycles (Otto, Diesel, Rankine, Brayton) with live P-v/T-s curves    |
| - Mass-Spring-Damper vibration response, resonance sweeps, live Bode telemetry                     |
| - 2D Lattice Boltzmann Method (LBM) flow tunnel for airfoils and nozzle constriction               |
| - Interactive PID tuning sandbox for suspension & inverted pendulum                                |
+----------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+----------------------------------------------------------------------------------------------------+
| PHASE 4: GAMIFICATION, PLATFORM ARCHITECTURE & SCALE (Weeks 19 - 24)                               |
| - Engineering Validation Engine: Automatic score verification (FOS >= 1.5, Mass, Budget)           |
| - User sandbox persistence via Supabase + Cloudflare R2 mechanism serialization (GLTF/JSON)        |
| - Interactive "Teardown Mode": High-speed replay scrubbers showing failure propagation             |
| - Global leaderboards by structural mass optimization and component cost                           |
+----------------------------------------------------------------------------------------------------+
```

---

## 6. Key Technical Challenges & Hardening Mitigations

### 1. Matrix Solving at Interactive Frame Rates
* **Challenge:** Large structural assemblies ($> 500$ nodes) require solving $[K]\{u\} = \{f\}$ with up to $3000$ degrees of freedom. Inverting or decomposing dense matrices on the main thread causes dropped frames.
* **Mitigation:**
  * Implement **Compressed Sparse Column (CSC)** matrices in Rust using `nalgebra-sparse` or `faer`.
  * Pre-compute symbolic Cholesky factorizations. When only load magnitudes change (not topology), reuse the factorization for $O(N)$ back-substitution solves.
  * Execute solver passes in a dedicated Web Worker at a target 120 Hz tick rate, decoupling physics from the 60 FPS viewport.

### 2. Elimination of Garbage Collection (GC) Stutters
* **Challenge:** Instantiating vectors, matrices, and event payloads every frame causes V8 GC pauses of 10–50 ms, producing visible jitter in WebGL viewports.
* **Mitigation:**
  * Zero runtime allocation policy in simulation tick loops.
  * Static memory layout using continuous `SharedArrayBuffer` blocks pre-sized for maximum node capacity (e.g., $1024$ nodes, $4096$ elements).
  * Use object pools for any required Three.js temporary helpers (`Vector3`, `Matrix4`, `Euler`).

### 3. Kinematic Singularities & Ill-Conditioned Systems
* **Challenge:** Under-constrained designs created by users (e.g., mechanisms with unconstrained degrees of freedom) cause $[K]$ to be singular ($\det[K] = 0$), producing `NaN` or infinite displacements that crash solvers.
* **Mitigation:**
  * Diagonal regularization / fictitious spring grounding ($k_{\text{stabilize}} = 10^{-6} \times K_{\text{max}}$) to detect and flag rigid body mechanisms before running standard solvers.
  * Eigenvalue analysis on $[K]$ to detect zero-stiffness modes and notify the user: *"Mechanism unstable: Degree of Freedom unconstrained at Node 4"*.

### 4. GPU Resource Leaks in Dynamic Sandboxes
* **Challenge:** Repeatedly building, breaking, and clearing trusses leads to WebGL context loss due to accumulated geometries, buffers, and textures in V8 heap.
* **Mitigation:**
  * Centralize rendering in an **`InstancedMesh`** pattern where a single cylinder/box geometry represents all structural members.
  * Modifying the structure updates only instance transform matrices and buffer attributes via `InstancedBufferAttribute`. No WebGL buffers are created or destroyed during sandbox play.

### 5. Cross-Origin Isolation for High-Performance Browser APIs
* **Challenge:** `SharedArrayBuffer` requires Cross-Origin Opener Policy (COOP) and Cross-Origin Embedder Policy (COEP) headers. Third-party embeds (analytics, fonts, auth callbacks) may fail under strict COEP.
* **Mitigation:**
  * Configure Next.js server headers in `next.config.mjs`:
    ```javascript
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
            { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          ],
        },
      ];
    }
    ```
  * Maintain an automatic fallback to transferable `ArrayBuffer` messaging (`postMessage(buffer, [buffer])`) if the browser environment lacks `crossOriginIsolated` privileges.

---

## 7. Concrete Architecture: Module 1 (Truss & Beam FEA Engine)

### A. Shared Memory Layout Specification (`src/core/bridge/MemoryLayout.ts`)

```typescript
/**
 * Shared memory layout between Main Thread (Render) and Web Worker (WASM Solver)
 * Memory Block Size: 64 KB (Page-aligned)
 */
export const MEMORY_LAYOUT = {
  HEADER: {
    OFFSET: 0,
    NODE_COUNT: 0,        // Uint32 (1)
    ELEMENT_COUNT: 4,     // Uint32 (1)
    STATE_FLAGS: 8,       // Uint32 (1) -> 0: Idle, 1: Dirty, 2: Solved, 3: Failed
    BUFFER_VERSION: 12,   // Uint32 (1) -> Incremented on each tick
  },
  NODES: {
    // 1024 Nodes Max: [x, y, z, fx, fy, fz, is_fixed_x, is_fixed_y, is_fixed_z, dx, dy, dz]
    OFFSET: 64,
    STRIDE_BYTES: 48,     // 12 * 4 bytes (Float32)
    CAPACITY: 1024,
  },
  ELEMENTS: {
    // 2048 Elements Max: [node_a, node_b, area, E_modulus, yield_stress, axial_force, stress_ratio, state]
    OFFSET: 49216,
    STRIDE_BYTES: 32,     // 8 * 4 bytes
    CAPACITY: 2048,
  }
} as const;
```

---

### B. Rust Solver Core (`crates/fea_core/src/truss.rs`)

```rust
use wasm_bindgen::prelude::*;

#[repr(C)]
#[derive(Clone, Copy)]
pub struct TrussNode {
    pub position: [f32; 3],
    pub load: [f32; 3],
    pub constraints: [u32; 3], // 1 = Fixed, 0 = Free
    pub displacement: [f32; 3],
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct TrussElement {
    pub node_a: u32,
    pub node_b: u32,
    pub area: f32,
    pub elastic_modulus: f32, // E (Pa)
    pub yield_strength: f32,  // sigma_yield (Pa)
    pub axial_force: f32,     // Tension (+) / Compression (-)
    pub stress_ratio: f32,    // sigma / sigma_yield
    pub state: u32,           // 0: OK, 1: Yielded, 2: Buckled
}

#[wasm_bindgen]
pub struct TrussEngine {
    nodes: Vec<TrussNode>,
    elements: Vec<TrussElement>,
}

#[wasm_bindgen]
impl TrussEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            nodes: Vec::with_capacity(1024),
            elements: Vec::with_capacity(2048),
        }
    }

    /// Solves the global stiffness system [K]{u} = {F}
    pub fn solve(&mut self, deformation_scale: f32) -> Result<(), JsValue> {
        let n_nodes = self.nodes.len();
        if n_nodes < 2 { return Ok(()); }

        let dof = n_nodes * 3;
        let mut k_global = vec![0.0f32; dof * dof];
        let mut f_global = vec![0.0f32; dof];

        // 1. Populate Load Vector & Stiffness Matrix
        for (i, node) in self.nodes.iter().enumerate() {
            f_global[i * 3]     = node.load[0];
            f_global[i * 3 + 1] = node.load[1];
            f_global[i * 3 + 2] = node.load[2];
        }

        for elem in &self.elements {
            let n1 = &self.nodes[elem.node_a as usize];
            let n2 = &self.nodes[elem.node_b as usize];

            let dx = n2.position[0] - n1.position[0];
            let dy = n2.position[1] - n1.position[1];
            let dz = n2.position[2] - n1.position[2];
            let length = (dx * dx + dy * dy + dz * dz).sqrt();
            if length <= 1e-6 { continue; }

            // Direction cosines
            let cx = dx / length;
            let cy = dy / length;
            let cz = dz / length;

            let k_coeff = (elem.area * elem.elastic_modulus) / length;
            let indices = [
                elem.node_a as usize * 3,
                elem.node_a as usize * 3 + 1,
                elem.node_a as usize * 3 + 2,
                elem.node_b as usize * 3,
                elem.node_b as usize * 3 + 1,
                elem.node_b as usize * 3 + 2,
            ];

            let lambda = [cx, cy, cz, -cx, -cy, -cz];

            for i in 0..6 {
                for j in 0..6 {
                    let k_contrib = k_coeff * lambda[i] * lambda[j];
                    k_global[indices[i] * dof + indices[j]] += k_contrib;
                }
            }
        }

        // 2. Apply Boundary Conditions (Penalty Method or Equation Elimination)
        for (i, node) in self.nodes.iter().enumerate() {
            for axis in 0..3 {
                if node.constraints[axis] == 1 {
                    let d = i * 3 + axis;
                    for col in 0..dof {
                        k_global[d * dof + col] = 0.0;
                    }
                    k_global[d * dof + d] = 1.0;
                    f_global[d] = 0.0;
                }
            }
        }

        // 3. Solve Displacements (using Gauss-Jordan/Cholesky for WASM footprint)
        let u_disp = solve_linear_system(&k_global, &f_global, dof);

        // 4. Update Node Displacements
        for (i, node) in self.nodes.iter_mut().enumerate() {
            node.displacement[0] = u_disp[i * 3];
            node.displacement[1] = u_disp[i * 3 + 1];
            node.displacement[2] = u_disp[i * 3 + 2];
        }

        // 5. Evaluate Stresses & Buckling Criteria
        for elem in self.elements.iter_mut() {
            let n1 = &self.nodes[elem.node_a as usize];
            let n2 = &self.nodes[elem.node_b as usize];

            let dx = n2.position[0] - n1.position[0];
            let dy = n2.position[1] - n1.position[1];
            let dz = n2.position[2] - n1.position[2];
            let length = (dx * dx + dy * dy + dz * dz).sqrt();

            let d_disp = (n2.displacement[0] - n1.displacement[0]) * (dx / length)
                       + (n2.displacement[1] - n1.displacement[1]) * (dy / length)
                       + (n2.displacement[2] - n1.displacement[2]) * (dz / length);

            let strain = d_disp / length;
            let stress = elem.elastic_modulus * strain; // Pa
            elem.axial_force = stress * elem.area;      // N
            elem.stress_ratio = stress.abs() / elem.yield_strength;

            // Euler Critical Buckling: P_cr = (pi^2 * E * I) / L^2
            // For a solid circular rod: I = pi * r^4 / 4 = A^2 / (4 * pi)
            let moment_of_inertia = (elem.area * elem.area) / (4.0 * std::f32::consts::PI);
            let p_critical = (std::f32::consts::PI.powi(2) * elem.elastic_modulus * moment_of_inertia) / (length * length);

            if elem.axial_force < -p_critical {
                elem.state = 2; // Buckled in compression
            } else if elem.stress_ratio >= 1.0 {
                elem.state = 1; // Yielded in tension/compression
            } else {
                elem.state = 0; // Intact
            }
        }

        Ok(())
    }
}

// Lightweight forward-elimination back-substitution linear solver for WASM
fn solve_linear_system(a: &[f32], b: &[f32], n: usize) -> Vec<f32> {
    let mut a_aug = a.to_vec();
    let mut x = b.to_vec();

    for i in 0..n {
        let mut pivot = a_aug[i * n + i];
        if pivot.abs() < 1e-9 { pivot = 1e-9; }

        for j in (i + 1)..n {
            let factor = a_aug[j * n + i] / pivot;
            for k in i..n {
                a_aug[j * n + k] -= factor * a_aug[i * n + k];
            }
            x[j] -= factor * x[i];
        }
    }

    for i in (0..n).rev() {
        let mut sum = x[i];
        for j in (i + 1)..n {
            sum -= a_aug[i * n + j] * x[j];
        }
        let pivot = if a_aug[i * n + i].abs() < 1e-9 { 1e-9 } else { a_aug[i * n + i] };
        x[i] = sum / pivot;
    }

    x
}
```

---

### C. Real-Time Stress Shader (`src/components/canvas/shaders/stressHeatmap.glsl`)

```glsl
// stressHeatmap.vert.glsl
attribute vec3 instanceDisplacementA;
attribute vec3 instanceDisplacementB;
attribute float instanceStressRatio; // sigma / sigma_yield
attribute float instanceState;       // 0: Intact, 1: Yielded, 2: Buckled

uniform float uDeformScale;

varying float vStress;
varying float vState;
varying vec3 vNormal;

void main() {
    vStress = instanceStressRatio;
    vState = instanceState;
    vNormal = normalMatrix * normal;

    // Interpolate deflection along normalized cylinder length (-0.5 to 0.5)
    float t = position.y + 0.5;
    vec3 localDeform = mix(instanceDisplacementA, instanceDisplacementB, clamp(t, 0.0, 1.0));

    // Amplify deformation for clear visual feedback
    vec3 transformedPosition = position + (localDeform * uDeformScale);
    
    // Buckling lateral bow displacement effect
    if (vState > 1.5) {
        float bow = sin(clamp(t, 0.0, 1.0) * 3.14159265);
        transformedPosition.x += bow * 0.15;
    }

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformedPosition, 1.0);
}

// stressHeatmap.frag.glsl
precision highp float;

varying float vStress;
varying float vState;
varying vec3 vNormal;

// Turbo/Engineering Colormap approximation
vec3 getEngineeringHeatmap(float normalizedStress) {
    float s = clamp(normalizedStress, 0.0, 1.0);
    // Smooth transition: Blue (safe) -> Cyan -> Green -> Yellow -> Red (failure)
    vec3 c = vec3(0.0);
    c.r = smoothstep(0.5, 0.85, s);
    c.g = smoothstep(0.15, 0.5, s) - smoothstep(0.7, 0.95, s);
    c.b = 1.0 - smoothstep(0.0, 0.35, s);
    return c;
}

void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    float diff = max(dot(normalize(vNormal), lightDir), 0.25);

    vec3 baseColor = getEngineeringHeatmap(vStress);

    // Flashing or high-contrast indication for structural failure
    if (vState > 0.5 && vState < 1.5) {
        // Material Yielded (Plastic Flow / Fracture)
        baseColor = vec3(1.0, 0.1, 0.1);
    } else if (vState > 1.5) {
        // Buckled
        baseColor = vec3(1.0, 0.4, 0.0);
    }

    gl_FragColor = vec4(baseColor * diff, 1.0);
}
```

---

### D. Declarative Challenge Specification Schema (`src/content/challenges/types.ts`)

```typescript
export interface EngineeringChallenge {
  id: string;
  module: 'statics' | 'mechanics' | 'kinematics' | 'thermo' | 'fluids' | 'vibrations';
  title: string;
  difficulty: 'introductory' | 'intermediate' | 'advanced';
  briefing: {
    scenario: string;
    targetObjectives: string[];
    theoreticalFormulas: Array<{ label: string; latex: string }>;
  };
  environment: {
    gravity: [number, number, number];
    anchors: Array<{ id: string; position: [number, number, number]; type: 'pinned' | 'roller' }>;
    loadPoints: Array<{ position: [number, number, number]; vector: [number, number, number] }>;
    keepOutZones: Array<{ min: [number, number, number]; max: [number, number, number] }>;
  };
  constraints: {
    maxBudgetDollars: number;
    maxTotalMassKg: number;
    minFactorOfSafety: number; // e.g. 1.5 for civil/structural safety
  };
  evaluationEngine: {
    targetMetric: 'minimize_mass' | 'maximize_efficiency' | 'minimize_cost';
    failureThresholds: {
      allowableDeflectionMaxMeters: number;
      maxStressRatio: 1.0;
    };
  };
}
```

---

## 8. Summary of Milestones

| Milestone | Deliverables | Verification Criteria |
| :--- | :--- | :--- |
| **M1: Core Solver & WASM** | Rust FEA solver compiled to WASM with SIMD | Direct stiffness validation against textbook Pratt & Warren trusses ($<0.01\%$ error) |
| **M2: Viewport & Shader** | R3F InstancedMesh + custom GLSL stress heatmap | 60 FPS under continuous parameter scrubber drag with 200 elements |
| **M3: Destructive Testing** | Euler buckling & yield threshold detection with Rapier collapse | Visual snap-through / plastic collapse trigger when load exceeds limit |
| **M4: Educational HUD** | Synchronized 2D SFD/BMD diagrams + Factor of Safety telemetry | Dynamic formula display matching real-time calculated stress ratios |

## command to start chrome in debug mode to connect to antigravity
chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile" http://localhost:3000