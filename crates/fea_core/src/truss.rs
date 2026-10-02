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
    pub fn solve(&mut self, _deformation_scale: f32) -> Result<(), JsValue> {
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

        // 2. Apply Boundary Conditions
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

        // 3. Solve Displacements
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
            let moment_of_inertia = (elem.area * elem.area) / (4.0 * std::f32::consts::PI);
            let p_critical = (std::f32::consts::PI.powi(2) * elem.elastic_modulus * moment_of_inertia) / (length * length);

            if elem.axial_force < -p_critical {
                elem.state = 2; // Buckled in compression
            } else if elem.stress_ratio >= 1.0 {
                elem.state = 1; // Yielded
            } else {
                elem.state = 0; // Intact
            }
        }

        Ok(())
    }
}

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
