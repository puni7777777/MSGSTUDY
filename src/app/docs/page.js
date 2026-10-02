'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileCode,
  Terminal,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Boxes,
  HelpCircle,
  Activity,
  ArrowRight,
  Download,
  Upload,
  Play,
  RotateCcw,
  BarChart2,
  Sliders,
} from 'lucide-react';

const SECTIONS = [
  {
    category: 'Getting Started',
    items: [
      { id: 'overview', title: 'Platform Overview' },
      { id: 'philosophy', title: 'The "FailForward" Philosophy' },
      { id: 'quickstart', title: '5-Minute Quickstart' },
    ],
  },
  {
    category: 'Interactive Lab Guide',
    items: [
      { id: 'viewport-3d', title: '3D Viewport & Navigation' },
      { id: 'load-scrubber', title: 'Destructive Load Scrubber' },
      { id: 'telemetry-bar', title: 'HUD Telemetry & Constraints' },
      { id: 'theory-panel', title: 'Theory & Scratchpad Panel' },
      { id: 'stress-scale', title: 'ANSYS Stress Contour Scale' },
      { id: 'sfd-bmd', title: 'Shear & Moment Diagrams' },
      { id: 'custom-sim', title: 'Custom Sim & CAD Tools' },
    ],
  },
  {
    category: 'Mission Authoring & JSON',
    items: [
      { id: 'schema-overview', title: 'Universal Mission Schema' },
      { id: 'nodes-reference', title: 'Node Reference & Supports' },
      { id: 'members-reference', title: 'Member Reference & Connectivity' },
      { id: 'materials-catalog', title: 'Material Database & Properties' },
      { id: 'sections-catalog', title: 'Cross-Section Presets' },
      { id: 'constraints-formulas', title: 'Constraints & Theory Formulas' },
    ],
  },
  {
    category: 'Using & Managing Missions',
    items: [
      { id: 'mission-studio', title: 'In-App Mission Studio' },
      { id: 'importing-json', title: 'Importing & Exporting JSON' },
      { id: 'troubleshooting', title: 'Common Mistakes & Static Determinacy' },
    ],
  },
  {
    category: 'Complete Working Examples',
    items: [
      { id: 'example-warren', title: 'Warren Truss Bridge' },
      { id: 'example-cantilever', title: 'Cantilever Observation Deck' },
      { id: 'example-fink', title: 'Alpine Fink Roof Truss' },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle copy to clipboard
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Scrollspy to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      const allIds = SECTIONS.flatMap((s) => s.items.map((i) => i.id));
      for (let i = allIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(allIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(allIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-mono antialiased">
      {/* Top Docs Header */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight hidden sm:inline">
                THE TEARDOWN LAB
              </span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Documentation & Manual
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="px-3 py-1 rounded-md text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/subjects/me-201"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch Lab</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Docs Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex gap-8 py-6">
        {/* Left Sticky Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-3 select-none">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Navigation Tree */}
          <nav className="space-y-5 text-xs">
            {SECTIONS.map((group) => {
              const filteredItems = group.items.filter((item) =>
                !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (filteredItems.length === 0) return null;

              return (
                <div key={group.category} className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    {group.category}
                  </span>
                  <div className="space-y-0.5">
                    {filteredItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                            isActive
                              ? 'bg-cyan-950/70 text-cyan-300 font-bold border border-cyan-500/40'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                          }`}
                        >
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${
                              isActive ? 'rotate-90 text-cyan-400' : 'text-slate-600'
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Center Main Documentation Article */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-12 select-text pb-24">
          {/* ========================================================= */}
          {/* SECTION: GETTING STARTED */}
          {/* ========================================================= */}
          <section id="overview" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Getting Started</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Platform Overview</h1>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>The Teardown Lab</strong> is an interactive, browser-based engineering laboratory and destructive testing workbench. Built specifically for mechanical and civil engineering undergraduate curricula (Statics, Mechanics of Deformable Bodies, Finite Element Analysis), it bridges the gap between abstract textbook formulas and visceral physical behavior.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>60 FPS WebGL FEA</span>
                </div>
                <p className="text-xs text-slate-400">
                  Full 2D/3D Direct Stiffness Matrix solver recalculating nodal deflections and bar axial stresses in real time.
                </p>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Destructive Testing</span>
                </div>
                <p className="text-xs text-slate-400">
                  Step-by-step progressive collapse algorithm demonstrating Euler column buckling and initial bifurcation triggers.
                </p>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <FileCode className="w-4 h-4" />
                  <span>Universal Missions</span>
                </div>
                <p className="text-xs text-slate-400">
                  Pure declarative JSON format and 1-click in-browser CAD exporter to build and share challenges without writing code.
                </p>
              </div>
            </div>
          </section>

          <section id="philosophy" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Pedagogy</span>
              <h2 className="text-xl font-bold text-white">The &ldquo;FailForward&rdquo; Philosophy</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional engineering coursework penalizes structural failure on exams and homework. Commercial CAD/FEA suites (such as ANSYS, SolidWorks, or Abaqus) produce static heatmaps behind steep learning curves without demonstrating <em>how</em> or <em>why</em> a structure collapsed.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Teardown Lab treats structural collapse as the primary diagnostic tool:
            </p>
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-lg space-y-1 text-xs">
              <span className="font-bold text-cyan-300 block">The FailForward Loop:</span>
              <p className="text-slate-300">
                1. <strong>Observe:</strong> Examine live force pathways and tension vs compression in the 3D model.<br />
                2. <strong>Overload:</strong> Drag the load scrubber past 100% or click <em>&ldquo;TEARDOWN TO FAILURE&rdquo;</em>.<br />
                3. <strong>Diagnose:</strong> Review the autopsy report to identify whether the initial trigger was material yielding or Euler column buckling.<br />
                4. <strong>Strengthen:</strong> Swap material, increase cross-section tube diameter, or triangulate unbraced joints to optimize mass and factor of safety.
              </p>
            </div>
          </section>

          <section id="quickstart" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Walkthrough</span>
              <h2 className="text-xl font-bold text-white">5-Minute Quickstart</h2>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>Navigate to the Lab:</strong> Click <Link href="/subjects/me-201" className="text-cyan-400 underline font-bold">Launch ME-201 Lab</Link> to enter the 3D flight deck.
              </li>
              <li>
                <strong>Inspect a Member:</strong> Click any truss bar in the 3D canvas. Notice how the left <em>Theory & Scratchpad</em> panel immediately injects that bar&apos;s axial force, cross-sectional area, length, and material properties into live Hooke&apos;s Law (σ = F / A) and Euler Buckling (P_cr) equations.
              </li>
              <li>
                <strong>Test Deflection Under Load:</strong> Move the bottom load slider from <code className="text-cyan-300">100%</code> to <code className="text-cyan-300">150%</code>. Observe the exaggerated displacement mesh and color shifts on the ANSYS stress scale.
              </li>
              <li>
                <strong>Trigger Teardown:</strong> Click the red <em>&ldquo;TEARDOWN TO FAILURE&rdquo;</em> button. Watch the progressive collapse simulation play at 60 FPS, followed by the Post-Mortem Autopsy briefing.
              </li>
              <li>
                <strong>Author a Mission:</strong> Open <em>&ldquo;Custom Sim&rdquo;</em> from the top dropdown, click to place joints and bars, and open <em>&ldquo;Studio&rdquo;</em> to export your own mission JSON in one click.
              </li>
            </ol>
          </section>

          {/* ========================================================= */}
          {/* SECTION: INTERACTIVE LAB GUIDE */}
          {/* ========================================================= */}
          <section id="viewport-3d" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">HUD Components</span>
              <h2 className="text-xl font-bold text-white">3D Viewport & Navigation</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The central simulation environment uses WebGL and Three.js with custom shader pipelines to render structural nodes, cylindrical truss members, support fixtures, and load vectors.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                    <th className="p-2.5">Input Gesture</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">Left Click + Drag</td>
                    <td className="p-2.5">Orbit Rotate</td>
                    <td className="p-2.5">Rotates the 3D camera around the structure center.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">Right Click + Drag</td>
                    <td className="p-2.5">Pan Camera</td>
                    <td className="p-2.5">Translates the camera across the XY plane.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">Scroll Wheel / Pinch</td>
                    <td className="p-2.5">Dolly Zoom</td>
                    <td className="p-2.5">Zooms smoothly into high-stress joints.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">Camera Presets</td>
                    <td className="p-2.5">FRONT / ISO / TOP / SIDE</td>
                    <td className="p-2.5">Snaps camera to standard engineering projection planes.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">G Key / View Header</td>
                    <td className="p-2.5">Toggle Grid (ON/OFF)</td>
                    <td className="p-2.5">Toggles visibility of the 1.0m &times; 1.0m reference ground grid and coordinate axes.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-200 block">1:1 Physical SI Scale:</span>
              <p className="text-slate-400 leading-relaxed">
                The 3D canvas is rendered at strict 1:1 physical SI metric scale (1 Three.js world unit = 1.0 meter). Each cell on the reference ground grid measures exactly 1.0m &times; 1.0m. A truss member defined with a length of 1 meter occupies exactly 1 meter in 3D world space with zero spatial distortion.
              </p>
            </div>
          </section>

          <section id="load-scrubber" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Simulation Controls</span>
              <h2 className="text-xl font-bold text-white">Destructive Load Scrubber</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Located at the bottom of the screen, the Load Scrubber controls applied service loads across the structure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>
                <strong>Load Multiplier (0% &ndash; 250%):</strong> Dynamically scales external forces (F_ext = λ · F_design). Deflection vectors and member forces recalculate instantly.
              </li>
              <li>
                <strong>Deformation Exaggeration Scale (1&times; &ndash; 100&times;):</strong> Magnifies elastic deflections so micro-millimeter bending and chord curvature are clearly visible to students.
              </li>
              <li>
                <strong>Display Modes:</strong> Toggle between <em>Stress Heatmap</em> (ANSYS rainbow), <em>Tension/Compression</em> (Cyan = Tension, Amber = Compression), and <em>Material Alloy</em> views.
              </li>
              <li>
                <strong>TEARDOWN TO FAILURE:</strong> Initiates incremental load stepping until initial member buckling or plastic yield occurs, capturing the collapse sequence frame-by-frame.
              </li>
            </ul>
          </section>

          <section id="telemetry-bar" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">HUD Instrumentation</span>
              <h2 className="text-xl font-bold text-white">HUD Telemetry & Constraints</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The top telemetry bar displays real-time structural health metrics evaluated against active challenge constraints:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Min FOS</span>
                <span className="font-black text-sm text-cyan-300">\ge 1.50 Target</span>
                <p className="text-[10px] text-slate-400 mt-1">Turns amber when &lt; 1.5, red pulse when &lt; 1.0 (collapse).</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Mass</span>
                <span className="font-black text-sm text-slate-200">Kilograms (kg)</span>
                <p className="text-[10px] text-slate-400 mt-1">Calculated from Σ (ρ · A · L).</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Estimated Cost</span>
                <span className="font-black text-sm text-slate-200">USD ($)</span>
                <p className="text-[10px] text-slate-400 mt-1">Direct material cost per kilogram.</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Max Deflection</span>
                <span className="font-black text-sm text-slate-200">Millimeters (mm)</span>
                <p className="text-[10px] text-slate-400 mt-1">Peak resultant displacement across all joints.</p>
              </div>
            </div>
          </section>

          <section id="theory-panel" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">HUD Instrumentation</span>
              <h2 className="text-xl font-bold text-white">Theory & Scratchpad Panel</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pinned cleanly to the left viewport, the Theory Panel provides dual-mode transparent mechanics calculations. It features 4 tabs:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-cyan-300">Tab 1: Hooke&apos;s Law (σ = F / A)</span>
                <p className="text-slate-400 mt-0.5">
                  Calculates normal stress from axial force and cross-sectional area. Displays compressive stress vs tensile stress.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-cyan-300">Tab 2: Euler Column Buckling (P_cr = π²·E·I / (K·L)²)</span>
                <p className="text-slate-400 mt-0.5">
                  Evaluates column stability under compression. Compares actual axial thrust against theoretical bifurcation load.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-cyan-300">Tab 3: Factor of Safety (FOS = \min(\sigma_y/\sigma, P_cr/|P|))</span>
                <p className="text-slate-400 mt-0.5">
                  Governing failure mode analysis. Features inline sensitivity steppers to test how changing material yield strength or force alters safety margins.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-cyan-300">Tab 4: Axial Deformation (ΔL = F·L / (E·A))</span>
                <p className="text-slate-400 mt-0.5">
                  Elastic elongation / shortening with micro-strain (\mu\epsilon) output.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-xs text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">Analytical Scratchpad Feature:</span>
              Students can directly edit any parameter input (e.g. typing negative forces like <code className="text-cyan-300">-75 kN</code> or adjusting diameter) to perform &ldquo;what-if&rdquo; homework sensitivity studies without mutating the 3D model. A <em>&ldquo;Scratchpad Override&rdquo;</em> badge indicates modified values, and a <em>&ldquo;Sync Live&rdquo;</em> button restores injected telemetry.
            </div>
          </section>

          <section id="stress-scale" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">HUD Instrumentation</span>
              <h2 className="text-xl font-bold text-white">ANSYS Stress Contour Scale</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Located on the right edge, the ANSYS Stress Scale displays a standardized 7-segment rainbow gradient:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li><strong>Blue:</strong> Zero stress (\sigma \approx 0).</li>
              <li><strong>Cyan / Green:</strong> Low to moderate working stress (FOS &gt; 2.0).</li>
              <li><strong>Yellow / Orange:</strong> High stress approaching allowable limit (1.0 &lt; FOS &lt; 1.5).</li>
              <li><strong>Red:</strong> Yield or Euler buckling failure (FOS &lt; 1.0).</li>
              <li><strong>Controls:</strong> Toggle between <em>Stress (MPa)</em> and <em>Demand Ratio (\sigma / \sigma_y)</em>. Includes <em>Auto</em> (fits active peak), <em>\sigma_y Yield</em> (clamps top to 250 MPa), and <em>Flow</em> presets.</li>
            </ul>
          </section>

          <section id="sfd-bmd" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Diagnostic Overlays</span>
              <h2 className="text-xl font-bold text-white">Shear Force & Bending Moment Diagrams (SFD / BMD)</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Clicking <strong>SFD / BMD</strong> in the toolbar toggles an interactive 2D canvas overlay across the bridge span:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li><strong>Shear Force Diagram (V in kN):</strong> Step functions at applied joint loads and reaction supports (V(x) = \sum R - \sum P).</li>
              <li><strong>Bending Moment Diagram (M in kN&middot;m):</strong> Integrated moment curve (M(x) = \int V(x) dx) showing peak sagging moment at midspan.</li>
            </ul>
          </section>

          <section id="custom-sim" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">CAD Sandbox</span>
              <h2 className="text-xl font-bold text-white">Custom Sim & CAD Tools</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To preserve curriculum integrity, predefined course missions have CAD drawing tools locked so students focus on material and cross-section analysis. In <strong>&ldquo;Custom Sim&rdquo;</strong>, the full CAD suite is enabled:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block">Inspect</span>
                <span className="text-slate-400">Click joints to set loads (F_x, F_y) or support conditions (pinned, roller, fixed).</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block">+ Joint</span>
                <span className="text-slate-400">Click anywhere on the grid to create a new structural node.</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block">+ Bar</span>
                <span className="text-slate-400">Click Joint A, then Joint B to connect them with a truss member.</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block">Delete</span>
                <span className="text-slate-400">Click any joint or member to remove it from the simulation.</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION: MISSION AUTHORING & JSON */}
          {/* ========================================================= */}
          <section id="schema-overview" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Mission Authoring</span>
              <h2 className="text-xl font-bold text-white">Universal Mission Schema</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Universal Mission JSON schema (<code className="text-cyan-300">mission.v1.json</code>) is a declarative, human-readable specification. Authors write clean, high-level engineering terms without calculating moment of inertia matrices or writing binary constraint arrays.
            </p>
            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "unique_mission_slug",
  "title": "Human-Readable Mission Title",
  "subtitle": "One-line summary of challenge",
  "difficulty": "Introductory" | "Intermediate" | "Advanced",
  "estimatedMinutes": 15,
  "scenario": "Engineering story and client requirements...",
  "constraints": {
    "minFactorOfSafety": 1.5,
    "maxMassKg": 1500,
    "maxBudgetDollars": 3000,
    "maxDeflectionMm": 15.0
  },
  "nodes": [ /* Array of joint definitions */ ],
  "members": [ /* Array of structural bar connections */ ]
}`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `{\n  "$schema": "https://teardownlab.com/schemas/mission.v1.json",\n  "id": "my_mission",\n  "title": "My Mission",\n  "constraints": {\n    "minFactorOfSafety": 1.5,\n    "maxMassKg": 1500,\n    "maxBudgetDollars": 3000,\n    "maxDeflectionMm": 15.0\n  },\n  "nodes": [],\n  "members": []\n}`,
                    'schema'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'schema' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'schema' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </section>

          <section id="nodes-reference" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Schema Reference</span>
              <h2 className="text-xl font-bold text-white">Node Reference & Boundary Supports</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Joints are defined in the <code className="text-cyan-300">nodes</code> array. Coordinates are in meters (m). Forces can be written in convenient kiloNewtons (<code className="text-cyan-300">loadY: -50</code> means -50 kN = -50,000 N).
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                    <th className="p-2.5">Field</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Required</th>
                    <th className="p-2.5">Description & Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">id</td>
                    <td className="p-2.5">string</td>
                    <td className="p-2.5 text-amber-400">Yes</td>
                    <td className="p-2.5">Unique joint string (e.g. <code className="text-slate-200">&quot;n0&quot;</code>, <code className="text-slate-200">&quot;mid_deck&quot;</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">x, y</td>
                    <td className="p-2.5">number</td>
                    <td className="p-2.5 text-amber-400">Yes</td>
                    <td className="p-2.5">Coordinates in meters (<code className="text-slate-200">x: 6.0, y: 0.0</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">z</td>
                    <td className="p-2.5">number</td>
                    <td className="p-2.5 text-slate-500">No</td>
                    <td className="p-2.5">Out-of-plane coordinate in meters (default: <code className="text-slate-200">0</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">support</td>
                    <td className="p-2.5">string</td>
                    <td className="p-2.5 text-slate-500">No</td>
                    <td className="p-2.5">
                      Boundary fixture: <code className="text-cyan-300">&quot;pinned&quot;</code> (restrains X, Y), <code className="text-cyan-300">&quot;roller&quot;</code> (restrains Y, slides X), <code className="text-cyan-300">&quot;fixed&quot;</code> (anchor wall), or <code className="text-cyan-300">&quot;free&quot;</code> (default).
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">loadY</td>
                    <td className="p-2.5">number</td>
                    <td className="p-2.5 text-slate-500">No</td>
                    <td className="p-2.5">Vertical load in <strong>kN</strong>. Negative = downward gravity (<code className="text-slate-200">loadY: -60.0</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">loadX</td>
                    <td className="p-2.5">number</td>
                    <td className="p-2.5 text-slate-500">No</td>
                    <td className="p-2.5">Horizontal load in <strong>kN</strong>. Positive = rightward wind/seismic.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="members-reference" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Schema Reference</span>
              <h2 className="text-xl font-bold text-white">Member Reference & Connectivity</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Truss bars are declared in the <code className="text-cyan-300">members</code> array by referencing node IDs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
                <span className="font-bold text-cyan-300 text-xs">Standard Object Notation</span>
                <pre className="text-xs text-slate-200 font-mono">
{`{
  "from": "n0",
  "to": "n1",
  "material": "steel",
  "section": "tube_80x4mm"
}`}
                </pre>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
                <span className="font-bold text-cyan-300 text-xs">Compact Array Shorthand</span>
                <pre className="text-xs text-slate-200 font-mono">
{`[
  "n0", 
  "n1", 
  "steel", 
  "tube_80x4mm"
]`}
                </pre>
              </div>
            </div>
          </section>

          <section id="materials-catalog" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Engineering Data</span>
              <h2 className="text-xl font-bold text-white">Material Database & Properties</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The platform normalizer automatically maps friendly aliases to physical mechanical constants:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                    <th className="p-2.5">Alias</th>
                    <th className="p-2.5">Alloy Name</th>
                    <th className="p-2.5">Modulus (E)</th>
                    <th className="p-2.5">Yield (\sigma_y)</th>
                    <th className="p-2.5">Density (\rho)</th>
                    <th className="p-2.5">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;steel&quot;</td>
                    <td className="p-2.5">ASTM A36 Steel</td>
                    <td className="p-2.5">200 GPa</td>
                    <td className="p-2.5">250 MPa</td>
                    <td className="p-2.5">7,850 kg/m³</td>
                    <td className="p-2.5">$1.20 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;hsla&quot;</td>
                    <td className="p-2.5">A572 Gr 50 HSLA</td>
                    <td className="p-2.5">205 GPa</td>
                    <td className="p-2.5">345 MPa</td>
                    <td className="p-2.5">7,850 kg/m³</td>
                    <td className="p-2.5">$1.85 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;aluminum&quot;</td>
                    <td className="p-2.5">6061-T6 Aluminum</td>
                    <td className="p-2.5">69 GPa</td>
                    <td className="p-2.5">276 MPa</td>
                    <td className="p-2.5">2,700 kg/m³</td>
                    <td className="p-2.5">$4.50 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;titanium&quot;</td>
                    <td className="p-2.5">Ti-6Al-4V Grade 5</td>
                    <td className="p-2.5">114 GPa</td>
                    <td className="p-2.5">880 MPa</td>
                    <td className="p-2.5">4,430 kg/m³</td>
                    <td className="p-2.5">$38.00 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;carbon_fiber&quot;</td>
                    <td className="p-2.5">CFRP Composite</td>
                    <td className="p-2.5">140 GPa</td>
                    <td className="p-2.5">600 MPa</td>
                    <td className="p-2.5">1,600 kg/m³</td>
                    <td className="p-2.5">$65.00 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;timber&quot;</td>
                    <td className="p-2.5">Douglas Fir Glulam</td>
                    <td className="p-2.5">13 GPa</td>
                    <td className="p-2.5">40 MPa</td>
                    <td className="p-2.5">550 kg/m³</td>
                    <td className="p-2.5">$0.80 / kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="sections-catalog" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Engineering Data</span>
              <h2 className="text-xl font-bold text-white">Cross-Section Presets & Custom Geometry</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Authors can specify standard preset names or custom parametric dimensions:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700">
                    <th className="p-2.5">Preset String</th>
                    <th className="p-2.5">Geometry</th>
                    <th className="p-2.5">Area (A)</th>
                    <th className="p-2.5">Moment of Inertia (I)</th>
                    <th className="p-2.5">Recommended Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;round_30mm&quot;</td>
                    <td className="p-2.5">Solid Ø 30 mm</td>
                    <td className="p-2.5">7.07 × 10⁻⁴ m²</td>
                    <td className="p-2.5">3.98 × 10⁻⁸ m⁴</td>
                    <td className="p-2.5">Pure tension web diagonals. Low buckling resistance.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;round_50mm&quot;</td>
                    <td className="p-2.5">Solid Ø 50 mm</td>
                    <td className="p-2.5">1.96 × 10⁻³ m²</td>
                    <td className="p-2.5">3.07 × 10⁻⁷ m⁴</td>
                    <td className="p-2.5">Workhorse standard truss chord.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">&quot;round_80mm&quot;</td>
                    <td className="p-2.5">Solid Ø 80 mm</td>
                    <td className="p-2.5">5.03 × 10⁻³ m²</td>
                    <td className="p-2.5">2.01 × 10⁻⁶ m⁴</td>
                    <td className="p-2.5">Heavy industrial freight bridges.</td>
                  </tr>
                  <tr className="bg-cyan-950/20">
                    <td className="p-2.5 font-bold text-cyan-300">&quot;tube_80x4mm&quot;</td>
                    <td className="p-2.5">Tube Ø 80&times;4 mm</td>
                    <td className="p-2.5">9.55 × 10⁻⁴ m²</td>
                    <td className="p-2.5">6.91 × 10⁻⁷ m⁴</td>
                    <td className="p-2.5"><strong>Best Weight-to-Buckling Ratio</strong>. Half the mass of round 50mm with 2.2&times; buckling strength.</td>
                  </tr>
                  <tr className="bg-cyan-950/20">
                    <td className="p-2.5 font-bold text-cyan-300">&quot;tube_120x5mm&quot;</td>
                    <td className="p-2.5">Tube Ø 120&times;5 mm</td>
                    <td className="p-2.5">1.81 × 10⁻³ m²</td>
                    <td className="p-2.5">2.97 × 10⁻⁶ m⁴</td>
                    <td className="p-2.5">Long compressive top chords and boom struts.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-cyan-300 block">Custom Parametric Section Syntax:</span>
              <p>For arbitrary dimensions, pass an object:</p>
              <pre className="font-mono text-cyan-300">
{`"section": { "shape": "tube", "diameterMm": 100, "thicknessMm": 6 }`}
              </pre>
              <p className="text-slate-400">
                The engine automatically calculates A = π·(R_out² - R_in²) and I = (π/4)·(R_out⁴ - R_in⁴) at runtime.
              </p>
            </div>
          </section>

          <section id="constraints-formulas" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Evaluation Rules</span>
              <h2 className="text-xl font-bold text-white">Constraints & Theory Formulas</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every mission includes target criteria verified during load testing:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <code className="text-cyan-300 font-bold block mb-0.5">minFactorOfSafety</code>
                <span className="text-slate-400">Minimum structural margin (e.g. <code className="text-slate-200">1.6</code>). Structure fails if any member drops below this limit.</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <code className="text-cyan-300 font-bold block mb-0.5">maxMassKg</code>
                <span className="text-slate-400">Maximum allowable structure mass (e.g. <code className="text-slate-200">1200</code> kg).</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <code className="text-cyan-300 font-bold block mb-0.5">maxBudgetDollars</code>
                <span className="text-slate-400">Budget cap in USD (e.g. <code className="text-slate-200">2400</code>).</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <code className="text-cyan-300 font-bold block mb-0.5">maxDeflectionMm</code>
                <span className="text-slate-400">Maximum vertical sag under service load (e.g. <code className="text-slate-200">12.0</code> mm).</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Automatic Formulas:</strong> If the <code className="text-slate-200">&quot;formulas&quot;</code> array is omitted from your JSON, standard formulas for Hooke&apos;s Law, Euler critical buckling, Factor of Safety, and deflection are injected automatically.
            </p>
          </section>

          {/* ========================================================= */}
          {/* SECTION: USING & MANAGING MISSIONS */}
          {/* ========================================================= */}
          <section id="mission-studio" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Mission Management</span>
              <h2 className="text-xl font-bold text-white">In-App Mission Studio</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accessible via the <span className="text-cyan-300 font-bold">&ldquo;Studio&rdquo;</span> button in the top navigation bar, the Mission Studio dialog provides a complete management console:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block mb-0.5">1. Save from 3D Canvas (Visual Mode)</span>
                <p className="text-slate-400">
                  Build any structure in <em>Custom Sim</em>. Open Studio \rightarrow <em>&ldquo;Save from 3D Canvas&rdquo;</em> \rightarrow Type title and constraints \rightarrow Click <strong>&ldquo;Save &amp; Play Mission Now&rdquo;</strong>. Zero code required.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block mb-0.5">2. Import / Paste JSON</span>
                <p className="text-slate-400">
                  Drag and drop a <code className="text-slate-200">.json</code> file or paste JSON code. Real-time syntax checking validates joints and connections before installing.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block mb-0.5">3. Mission Library</span>
                <p className="text-slate-400">
                  Inspect all active missions (Built-in + Custom), download any mission as a validated <code className="text-slate-200">.json</code> file, or delete custom missions.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                <span className="font-bold text-cyan-300 block mb-0.5">4. Syntax &amp; Help Guide</span>
                <p className="text-slate-400">
                  Interactive reference card of all materials, sections, supports, and units with 1-click &ldquo;Copy Starter Template JSON&rdquo;.
                </p>
              </div>
            </div>
          </section>

          <section id="importing-json" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">File Workflows</span>
              <h2 className="text-xl font-bold text-white">Importing &amp; Exporting JSON</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Missions can be stored and shared through three workflows:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Browser Session Persistence:</strong> Missions imported or saved through the Mission Studio GUI are persisted in browser <code className="text-cyan-300">localStorage</code>. They remain available across page reloads.
              </li>
              <li>
                <strong>JSON File Download:</strong> Click <em>&ldquo;Download .json&rdquo;</em> in the Mission Studio or Library to save a clean, standalone JSON file to disk.
              </li>
              <li>
                <strong>Codebase Integration:</strong> Developers or teaching assistants can place <code className="text-cyan-300">.json</code> files directly in <code className="text-cyan-300">src/content/missions/</code> for inclusion in the repository.
              </li>
            </ol>
          </section>

          <section id="troubleshooting" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Diagnostics</span>
              <h2 className="text-xl font-bold text-white">Common Mistakes &amp; Static Determinacy</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-slate-300 space-y-1">
                <span className="font-bold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Issue 1: Singular Stiffness Matrix / Kinematic Mechanism
                </span>
                <p>
                  <strong>Cause:</strong> The truss is not statically determinate or stable (b + r &lt; 2j). An internal quadrilateral panel is unbraced and can freely fold like a hinge.
                </p>
                <p className="text-slate-400">
                  <strong>Fix:</strong> Add a diagonal member connecting opposite corners of the unbraced quadrilateral to create rigid triangles.
                </p>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-slate-300 space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Issue 2: Free Rigid Body Motion (No Supports)
                </span>
                <p>
                  <strong>Cause:</strong> No boundary supports are specified. The structure will accelerate into infinity under applied load.
                </p>
                <p className="text-slate-400">
                  <strong>Fix:</strong> Ensure at least one joint has <code className="text-slate-200">&quot;support&quot;: &quot;pinned&quot;</code> and at least one joint has <code className="text-slate-200">&quot;support&quot;: &quot;roller&quot;</code> (or <code className="text-slate-200">&quot;fixed&quot;</code> for a cantilever wall).
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 space-y-1">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Issue 3: Node ID Typos
                </span>
                <p className="text-slate-400">
                  The validator verifies that every <code className="text-slate-200">from</code> and <code className="text-slate-200">to</code> ID in <code className="text-slate-200">members</code> matches an existing ID in <code className="text-slate-200">nodes</code>.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION: COMPLETE WORKING EXAMPLES */}
          {/* ========================================================= */}
          <section id="example-warren" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Reference Example 1</span>
              <h2 className="text-xl font-bold text-white">Warren Truss River Crossing (12m Span)</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Alternates tension and compression in diagonal web members. Top chords are in compression, bottom chords in tension.
            </p>
            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "warren_12m_demo",
  "title": "The Warren Truss Crossing",
  "difficulty": "Introductory",
  "constraints": {
    "minFactorOfSafety": 1.6,
    "maxMassKg": 1200,
    "maxBudgetDollars": 2400,
    "maxDeflectionMm": 12.0
  },
  "nodes": [
    { "id": "n0", "x": 0, "y": 0, "support": "pinned" },
    { "id": "n1", "x": 3, "y": 0 },
    { "id": "n2", "x": 6, "y": 0, "loadY": -60.0 },
    { "id": "n3", "x": 9, "y": 0 },
    { "id": "n4", "x": 12, "y": 0, "support": "roller" },
    { "id": "t1", "x": 1.5, "y": 2.5 },
    { "id": "t2", "x": 4.5, "y": 2.5 },
    { "id": "t3", "x": 7.5, "y": 2.5 },
    { "id": "t4", "x": 10.5, "y": 2.5 }
  ],
  "members": [
    { "from": "n0", "to": "n1", "material": "steel", "section": "round_50mm" },
    { "from": "n1", "to": "n2", "material": "steel", "section": "round_50mm" },
    { "from": "n2", "to": "n3", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "n4", "material": "steel", "section": "round_50mm" },
    { "from": "t1", "to": "t2", "material": "steel", "section": "tube_80x4mm" },
    { "from": "t2", "to": "t3", "material": "steel", "section": "tube_80x4mm" },
    { "from": "t3", "to": "t4", "material": "steel", "section": "tube_80x4mm" },
    { "from": "n0", "to": "t1", "material": "steel", "section": "round_50mm" },
    { "from": "t1", "to": "n1", "material": "steel", "section": "round_50mm" },
    { "from": "n1", "to": "t2", "material": "steel", "section": "round_50mm" },
    { "from": "t2", "to": "n2", "material": "steel", "section": "round_50mm" },
    { "from": "n2", "to": "t3", "material": "steel", "section": "round_50mm" },
    { "from": "t3", "to": "n3", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "t4", "material": "steel", "section": "round_50mm" },
    { "from": "t4", "to": "n4", "material": "steel", "section": "round_50mm" }
  ]
}`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `{\n  "$schema": "https://teardownlab.com/schemas/mission.v1.json",\n  "id": "warren_12m_demo",\n  "title": "The Warren Truss Crossing",\n  "difficulty": "Introductory",\n  "constraints": {\n    "minFactorOfSafety": 1.6,\n    "maxMassKg": 1200,\n    "maxBudgetDollars": 2400,\n    "maxDeflectionMm": 12.0\n  },\n  "nodes": [\n    { "id": "n0", "x": 0, "y": 0, "support": "pinned" },\n    { "id": "n1", "x": 3, "y": 0 },\n    { "id": "n2", "x": 6, "y": 0, "loadY": -60.0 },\n    { "id": "n3", "x": 9, "y": 0 },\n    { "id": "n4", "x": 12, "y": 0, "support": "roller" },\n    { "id": "t1", "x": 1.5, "y": 2.5 },\n    { "id": "t2", "x": 4.5, "y": 2.5 },\n    { "id": "t3", "x": 7.5, "y": 2.5 },\n    { "id": "t4", "x": 10.5, "y": 2.5 }\n  ],\n  "members": [\n    { "from": "n0", "to": "n1", "material": "steel", "section": "round_50mm" },\n    { "from": "n1", "to": "n2", "material": "steel", "section": "round_50mm" },\n    { "from": "n2", "to": "n3", "material": "steel", "section": "round_50mm" },\n    { "from": "n3", "to": "n4", "material": "steel", "section": "round_50mm" },\n    { "from": "t1", "to": "t2", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "t2", "to": "t3", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "t3", "to": "t4", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "n0", "to": "t1", "material": "steel", "section": "round_50mm" },\n    { "from": "t1", "to": "n1", "material": "steel", "section": "round_50mm" },\n    { "from": "n1", "to": "t2", "material": "steel", "section": "round_50mm" },\n    { "from": "t2", "to": "n2", "material": "steel", "section": "round_50mm" },\n    { "from": "n2", "to": "t3", "material": "steel", "section": "round_50mm" },\n    { "from": "t3", "to": "n3", "material": "steel", "section": "round_50mm" },\n    { "from": "n3", "to": "t4", "material": "steel", "section": "round_50mm" },\n    { "from": "t4", "to": "n4", "material": "steel", "section": "round_50mm" }\n  ]\n}`,
                    'warren'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'warren' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'warren' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </section>

          <section id="example-cantilever" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Reference Example 2</span>
              <h2 className="text-xl font-bold text-white">Cantilever Observation Deck (6m Overhang)</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrates wall anchor boundary conditions (<code className="text-cyan-300">&quot;support&quot;: &quot;fixed&quot;</code>) with tip crowd loading. Top chord in tension, bottom chord in compression.
            </p>
            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "cantilever_balcony_overhang",
  "title": "The High-Altitude Cantilever Overhang",
  "difficulty": "Intermediate",
  "constraints": {
    "minFactorOfSafety": 1.6,
    "maxMassKg": 1200,
    "maxBudgetDollars": 2500,
    "maxDeflectionMm": 15.0
  },
  "nodes": [
    { "id": "wall_bot", "x": 0, "y": 0, "support": "fixed" },
    { "id": "wall_top", "x": 0, "y": 2.5, "support": "fixed" },
    { "id": "b1", "x": 2.0, "y": 0 },
    { "id": "t1", "x": 2.0, "y": 2.5 },
    { "id": "b2", "x": 4.0, "y": 0 },
    { "id": "t2", "x": 4.0, "y": 2.5 },
    { "id": "tip", "x": 6.0, "y": 1.25, "loadY": -35.0 }
  ],
  "members": [
    { "from": "wall_top", "to": "t1", "material": "steel", "section": "tube_80x4mm" },
    { "from": "t1", "to": "t2", "material": "steel", "section": "tube_80x4mm" },
    { "from": "t2", "to": "tip", "material": "steel", "section": "tube_80x4mm" },
    { "from": "wall_bot", "to": "b1", "material": "steel", "section": "tube_120x5mm" },
    { "from": "b1", "to": "b2", "material": "steel", "section": "tube_120x5mm" },
    { "from": "b2", "to": "tip", "material": "steel", "section": "tube_120x5mm" },
    { "from": "wall_bot", "to": "t1", "material": "steel", "section": "round_50mm" },
    { "from": "b1", "to": "t1", "material": "steel", "section": "round_30mm" },
    { "from": "b1", "to": "t2", "material": "steel", "section": "round_50mm" },
    { "from": "b2", "to": "t2", "material": "steel", "section": "round_30mm" }
  ]
}`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `{\n  "$schema": "https://teardownlab.com/schemas/mission.v1.json",\n  "id": "cantilever_balcony_overhang",\n  "title": "The High-Altitude Cantilever Overhang",\n  "difficulty": "Intermediate",\n  "constraints": {\n    "minFactorOfSafety": 1.6,\n    "maxMassKg": 1200,\n    "maxBudgetDollars": 2500,\n    "maxDeflectionMm": 15.0\n  },\n  "nodes": [\n    { "id": "wall_bot", "x": 0, "y": 0, "support": "fixed" },\n    { "id": "wall_top", "x": 0, "y": 2.5, "support": "fixed" },\n    { "id": "b1", "x": 2.0, "y": 0 },\n    { "id": "t1", "x": 2.0, "y": 2.5 },\n    { "id": "b2", "x": 4.0, "y": 0 },\n    { "id": "t2", "x": 4.0, "y": 2.5 },\n    { "id": "tip", "x": 6.0, "y": 1.25, "loadY": -35.0 }\n  ],\n  "members": [\n    { "from": "wall_top", "to": "t1", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "t1", "to": "t2", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "t2", "to": "tip", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "wall_bot", "to": "b1", "material": "steel", "section": "tube_120x5mm" },\n    { "from": "b1", "to": "b2", "material": "steel", "section": "tube_120x5mm" },\n    { "from": "b2", "to": "tip", "material": "steel", "section": "tube_120x5mm" },\n    { "from": "wall_bot", "to": "t1", "material": "steel", "section": "round_50mm" },\n    { "from": "b1", "to": "t1", "material": "steel", "section": "round_30mm" },\n    { "from": "b1", "to": "t2", "material": "steel", "section": "round_50mm" },\n    { "from": "b2", "to": "t2", "material": "steel", "section": "round_30mm" }\n  ]\n}`,
                    'cantilever'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'cantilever' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'cantilever' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </section>

          <section id="example-fink" className="space-y-4">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">Reference Example 3</span>
              <h2 className="text-xl font-bold text-white">Alpine Chalet Fink Roof Truss (Pitched Span)</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrates pitched rafters with vertical snowpack distribution and horizontal tension bottom tie.
            </p>
            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "alpine_fink_roof_truss",
  "title": "The Alpine Chalet Fink Roof",
  "difficulty": "Introductory",
  "constraints": {
    "minFactorOfSafety": 1.5,
    "maxMassKg": 950,
    "maxBudgetDollars": 2200,
    "maxDeflectionMm": 18.0
  },
  "nodes": [
    { "id": "heel_left", "x": 0, "y": 0, "support": "pinned" },
    { "id": "mid_bot", "x": 6.0, "y": 0 },
    { "id": "heel_right", "x": 12.0, "y": 0, "support": "roller" },
    { "id": "rafter_l1", "x": 3.0, "y": 1.75, "loadY": -15.0 },
    { "id": "peak", "x": 6.0, "y": 3.5, "loadY": -25.0 },
    { "id": "rafter_r1", "x": 9.0, "y": 1.75, "loadY": -15.0 }
  ],
  "members": [
    { "from": "heel_left", "to": "mid_bot", "material": "steel", "section": "round_50mm" },
    { "from": "mid_bot", "to": "heel_right", "material": "steel", "section": "round_50mm" },
    { "from": "heel_left", "to": "rafter_l1", "material": "steel", "section": "tube_80x4mm" },
    { "from": "rafter_l1", "to": "peak", "material": "steel", "section": "tube_80x4mm" },
    { "from": "peak", "to": "rafter_r1", "material": "steel", "section": "tube_80x4mm" },
    { "from": "rafter_r1", "to": "heel_right", "material": "steel", "section": "tube_80x4mm" },
    { "from": "heel_left", "to": "mid_bot", "material": "steel", "section": "round_30mm" },
    { "from": "rafter_l1", "to": "mid_bot", "material": "steel", "section": "round_30mm" },
    { "from": "peak", "to": "mid_bot", "material": "steel", "section": "round_30mm" },
    { "from": "rafter_r1", "to": "mid_bot", "material": "steel", "section": "round_30mm" }
  ]
}`}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    `{\n  "$schema": "https://teardownlab.com/schemas/mission.v1.json",\n  "id": "alpine_fink_roof_truss",\n  "title": "The Alpine Chalet Fink Roof",\n  "difficulty": "Introductory",\n  "constraints": {\n    "minFactorOfSafety": 1.5,\n    "maxMassKg": 950,\n    "maxBudgetDollars": 2200,\n    "maxDeflectionMm": 18.0\n  },\n  "nodes": [\n    { "id": "heel_left", "x": 0, "y": 0, "support": "pinned" },\n    { "id": "mid_bot", "x": 6.0, "y": 0 },\n    { "id": "heel_right", "x": 12.0, "y": 0, "support": "roller" },\n    { "id": "rafter_l1", "x": 3.0, "y": 1.75, "loadY": -15.0 },\n    { "id": "peak", "x": 6.0, "y": 3.5, "loadY": -25.0 },\n    { "id": "rafter_r1", "x": 9.0, "y": 1.75, "loadY": -15.0 }\n  ],\n  "members": [\n    { "from": "heel_left", "to": "mid_bot", "material": "steel", "section": "round_50mm" },\n    { "from": "mid_bot", "to": "heel_right", "material": "steel", "section": "round_50mm" },\n    { "from": "heel_left", "to": "rafter_l1", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "rafter_l1", "to": "peak", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "peak", "to": "rafter_r1", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "rafter_r1", "to": "heel_right", "material": "steel", "section": "tube_80x4mm" },\n    { "from": "heel_left", "to": "mid_bot", "material": "steel", "section": "round_30mm" },\n    { "from": "rafter_l1", "to": "mid_bot", "material": "steel", "section": "round_30mm" },\n    { "from": "peak", "to": "mid_bot", "material": "steel", "section": "round_30mm" },\n    { "from": "rafter_r1", "to": "mid_bot", "material": "steel", "section": "round_30mm" }\n  ]\n}`,
                    'fink'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'fink' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'fink' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
