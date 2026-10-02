'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { MATERIAL_DATABASE } from '../../core/materials';
import { MODULE_1_CHALLENGES } from '../../content/challenges/module1-challenges';

export default function TrussViewport3D() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Store subscriptions
  const nodes = useSimulationStore((s) => s.nodes);
  const members = useSimulationStore((s) => s.members);
  const solverResult = useSimulationStore((s) => s.solverResult);
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
  const selectedMemberId = useSimulationStore((s) => s.selectedMemberId);
  const deformationScale = useSimulationStore((s) => s.deformationScale);
  const colorMode = useSimulationStore((s) => s.colorMode);
  const stressScaleMode = useSimulationStore((s) => s.stressScaleMode);
  const stressDisplayMetric = useSimulationStore((s) => s.stressDisplayMetric);
  const stressCustomMin = useSimulationStore((s) => s.stressCustomMin);
  const stressCustomMax = useSimulationStore((s) => s.stressCustomMax);
  const builderTool = useSimulationStore((s) => s.builderTool);
  const memberDraftStartNodeId = useSimulationStore((s) => s.memberDraftStartNodeId);
  const showGrid = useSimulationStore((s) => s.showGrid);
  const cameraPreset = useSimulationStore((s) => s.cameraPreset);
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);

  const selectNode = useSimulationStore((s) => s.selectNode);
  const selectMember = useSimulationStore((s) => s.selectMember);
  const addNode = useSimulationStore((s) => s.addNode);
  const addMember = useSimulationStore((s) => s.addMember);
  const setMemberDraftStart = useSimulationStore((s) => s.setMemberDraftStart);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const deleteMember = useSimulationStore((s) => s.deleteMember);

  const [hoveredInfo, setHoveredInfo] = useState(null);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const dynamicGroupRef = useRef(null);
  const interactablesRef = useRef([]);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080d1a'); // Deep dark engineering navy
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 4, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(6, 2, 0);
    controlsRef.current = controls;

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(15, 25, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4); // Blue rim fill
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // Dynamic objects container
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // Animation frame loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Window resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Camera presets when requested
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    let avgX = 6;
    let avgY = 2;
    if (nodes && nodes.length > 0) {
      avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
      avgY = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length;
    }

    controls.target.set(avgX, avgY, 0);

    if (cameraPreset === 'front') {
      camera.position.set(avgX, avgY, 18);
    } else if (cameraPreset === 'iso') {
      camera.position.set(avgX + 10, avgY + 8, 16);
    } else if (cameraPreset === 'top') {
      camera.position.set(avgX, avgY + 20, 0.001);
    } else if (cameraPreset === 'side') {
      camera.position.set(avgX + 20, avgY, 0);
    }

    controls.update();
  }, [cameraPreset, activeChallengeId, nodes]);

  // Re-build 3D Meshes whenever model or solver updates
  useEffect(() => {
    const group = dynamicGroupRef.current;
    const scene = sceneRef.current;
    if (!group || !scene) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }
    interactablesRef.current = [];

    // Environment & Grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
      gridHelper.position.y = 0;
      group.add(gridHelper);

      const axesHelper = new THREE.AxesHelper(1.5);
      axesHelper.position.set(0, 0.01, 0);
      group.add(axesHelper);
    }

    // Keep-Out Zones for active challenge
    const challenge = MODULE_1_CHALLENGES.find((c) => c.id === activeChallengeId);
    if (challenge && challenge.environment && challenge.environment.keepOutZones) {
      for (const zone of challenge.environment.keepOutZones) {
        const sizeX = Math.abs(zone.max[0] - zone.min[0]);
        const sizeY = Math.abs(zone.max[1] - zone.min[1]);
        const sizeZ = Math.max(0.5, Math.abs(zone.max[2] - zone.min[2]));

        const posX = (zone.min[0] + zone.max[0]) / 2;
        const posY = (zone.min[1] + zone.max[1]) / 2;
        const posZ = (zone.min[2] + zone.max[2]) / 2;

        const zoneGeo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
        const zoneMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.15,
          wireframe: true,
        });
        const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
        zoneMesh.position.set(posX, posY, posZ);
        group.add(zoneMesh);
      }
    }

    // Map node IDs to deflected world positions
    const nodeDeflectedPos = new Map();

    for (const node of nodes) {
      const disp = (solverResult.displacements && solverResult.displacements[node.id]) || [0, 0, 0];
      const deflected = new THREE.Vector3(
        node.x + disp[0] * deformationScale,
        node.y + disp[1] * deformationScale,
        node.z + disp[2] * deformationScale
      );
      nodeDeflectedPos.set(node.id, deflected);
    }

    // Calculate effective bounds for ANSYS stress spectrum
    let effMin = 0;
    let effMax = 250;
    if (stressScaleMode === 'custom') {
      effMin = Number(stressCustomMin);
      effMax = Math.max(Number(stressCustomMin) + 0.001, Number(stressCustomMax));
    } else {
      const extremes = solverResult.stressExtremes;
      if (stressDisplayMetric === 'stress_mpa') {
        effMin = 0;
        effMax = Math.max(10, Math.ceil((extremes?.maxStressMPa || 50) * 1.15));
      } else {
        effMin = 0;
        effMax = Math.max(1.0, Number(((extremes?.maxStressRatio || 1.0) * 1.1).toFixed(2)));
      }
    }

    // Render Members (Bars)
    for (const member of members) {
      const pA = nodeDeflectedPos.get(member.nodeAId);
      const pB = nodeDeflectedPos.get(member.nodeBId);
      if (!pA || !pB) continue;

      const delta = new THREE.Vector3().subVectors(pB, pA);
      const length = delta.length();
      if (length < 1e-4) continue;

      const analysis = solverResult.members && solverResult.members[member.id];
      const isSelected = selectedMemberId === member.id;

      let barColor = new THREE.Color('#38bdf8');

      if (colorMode === 'stress') {
        const isFailed = analysis ? analysis.state === 'failed' : false;

        if (isFailed) {
          barColor = new THREE.Color('#ef4444');
        } else if (analysis) {
          let val = 0;
          if (stressDisplayMetric === 'stress_mpa') {
            val = Math.abs(analysis.axialStress) / 1e6; // MPa
          } else {
            val = analysis.stressRatio; // Demand Ratio
          }
          const t = (val - effMin) / (effMax - effMin);
          barColor = getAnsysColor(t);
        } else {
          barColor = new THREE.Color('#1e40af');
        }
      } else if (colorMode === 'tension_compression') {
        if (!analysis || Math.abs(analysis.axialForce) < 100) {
          barColor = new THREE.Color('#64748b');
        } else if (analysis.axialForce > 0) {
          barColor = new THREE.Color('#3b82f6');
        } else {
          barColor = new THREE.Color('#f97316');
        }
      } else if (colorMode === 'material') {
        const mat = MATERIAL_DATABASE[member.materialId] || MATERIAL_DATABASE.structural_steel_a36;
        barColor = new THREE.Color(mat.colorHex);
      }

      if (isSelected) {
        barColor = new THREE.Color('#eab308');
      }

      const radius = Math.max(0.04, member.crossSection.outerRadius * 1.5);
      const cylinderGeo = new THREE.CylinderGeometry(radius, radius, length, 12);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: barColor,
        metalness: 0.65,
        roughness: 0.35,
        emissive: isSelected ? new THREE.Color('#ca8a04') : new THREE.Color('#000000'),
        emissiveIntensity: isSelected ? 0.3 : 0,
      });

      const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
      cylinderMesh.position.copy(pA).addScaledVector(delta, 0.5);
      cylinderMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());

      cylinderMesh.userData = {
        type: 'member',
        id: member.id,
        member,
        analysis,
      };

      group.add(cylinderMesh);
      interactablesRef.current.push(cylinderMesh);

      if (analysis && analysis.failureMode === 'euler_buckling') {
        const bowCurve = new THREE.QuadraticBezierCurve3(
          pA,
          cylinderMesh.position.clone().add(new THREE.Vector3(0.4, 0.4, 0)),
          pB
        );
        const tubeGeo = new THREE.TubeGeometry(bowCurve, 16, radius * 1.2, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(tubeMesh);
      }
    }

    // Render Nodes (Joints)
    for (const node of nodes) {
      const pos = nodeDeflectedPos.get(node.id) || new THREE.Vector3(node.x, node.y, node.z);
      const isSelected = selectedNodeId === node.id;
      const isDraftStart = memberDraftStartNodeId === node.id;

      let nodeColor = new THREE.Color('#94a3b8');
      if (isSelected) nodeColor = new THREE.Color('#eab308');
      if (isDraftStart) nodeColor = new THREE.Color('#22c55e');

      const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        metalness: 0.5,
        roughness: 0.3,
        emissive: isSelected ? new THREE.Color('#a16207') : new THREE.Color('#000000'),
        emissiveIntensity: isSelected ? 0.4 : 0,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.copy(pos);
      sphereMesh.userData = {
        type: 'node',
        id: node.id,
        node,
        disp: solverResult.displacements && solverResult.displacements[node.id],
      };

      group.add(sphereMesh);
      interactablesRef.current.push(sphereMesh);

      // Support Geometry
      if (node.supportType !== 'free') {
        renderSupportSymbol(group, pos, node.supportType);
      }

      // Applied Load Arrows
      const loadMag = Math.sqrt(node.fx * node.fx + node.fy * node.fy + node.fz * node.fz);
      if (loadMag > 1) {
        const loadDir = new THREE.Vector3(node.fx, node.fy, node.fz).normalize();
        const arrowLength = Math.min(2.5, Math.max(0.8, (loadMag / 30000) * 1.5));
        const arrowColor = 0xef4444;

        const arrowStart = pos.clone().addScaledVector(loadDir, -arrowLength);
        const arrowHelper = new THREE.ArrowHelper(loadDir, arrowStart, arrowLength, arrowColor, 0.35, 0.2);
        group.add(arrowHelper);
      }

      // Support Reaction Arrows
      const reaction = solverResult.reactions && solverResult.reactions[node.id];
      if (reaction) {
        const rxMag = Math.sqrt(reaction.rx * reaction.rx + reaction.ry * reaction.ry);
        if (rxMag > 50) {
          const rDir = new THREE.Vector3(reaction.rx, reaction.ry, 0).normalize();
          const rLength = Math.min(2.0, Math.max(0.6, (rxMag / 30000) * 1.2));
          const rArrow = new THREE.ArrowHelper(rDir, pos, rLength, 0x10b981, 0.3, 0.15);
          group.add(rArrow);
        }
      }
    }
  }, [
    nodes,
    members,
    solverResult,
    selectedNodeId,
    selectedMemberId,
    deformationScale,
    colorMode,
    stressScaleMode,
    stressDisplayMetric,
    stressCustomMin,
    stressCustomMax,
    memberDraftStartNodeId,
    showGrid,
    activeChallengeId,
  ]);

  const handlePointerDown = (event) => {
    if (!canvasRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(interactablesRef.current, true);

    if (intersects.length > 0) {
      const topHit = intersects[0].object;
      const data = topHit.userData;

      if (builderTool === 'select') {
        if (data.type === 'node') {
          selectNode(data.id);
        } else if (data.type === 'member') {
          selectMember(data.id);
        }
      } else if (builderTool === 'add_member') {
        if (data.type === 'node') {
          if (!memberDraftStartNodeId) {
            setMemberDraftStart(data.id);
          } else {
            addMember(memberDraftStartNodeId, data.id);
            setMemberDraftStart(null);
          }
        }
      } else if (builderTool === 'delete') {
        if (data.type === 'node') deleteNode(data.id);
        if (data.type === 'member') deleteMember(data.id);
      }
    } else {
      if (builderTool === 'add_node') {
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        if (intersectPoint) {
          addNode(intersectPoint.x, intersectPoint.y, 0);
        }
      } else if (builderTool === 'select') {
        selectNode(null);
        selectMember(null);
      }
    }
  };

  const handlePointerMove = (event) => {
    if (!canvasRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(interactablesRef.current, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object.userData;
      if (hit.type === 'member' && hit.analysis) {
        const a = hit.analysis;
        const forceStr = `${(a.axialForce / 1000).toFixed(1)} kN (${a.axialForce >= 0 ? 'Tension' : 'Compression'})`;
        const stressStr = `${(Math.abs(a.axialStress) / 1e6).toFixed(1)} MPa (FOS: ${a.factorOfSafety.toFixed(2)})`;
        setHoveredInfo({
          text: `Member ${hit.id}: ${forceStr}`,
          subtext: `${stressStr} | ${a.state.toUpperCase()}`,
          x: event.clientX - rect.left + 15,
          y: event.clientY - rect.top - 30,
        });
      } else if (hit.type === 'node' && hit.node) {
        const n = hit.node;
        const disp = hit.disp || [0, 0, 0];
        const dispMagMm = Math.sqrt(disp[0] * disp[0] + disp[1] * disp[1] + disp[2] * disp[2]) * 1000;
        setHoveredInfo({
          text: `Node ${n.id} (${n.supportType})`,
          subtext: `Deflection: ${dispMagMm.toFixed(2)} mm | Load: ${((n.fy || 0) / 1000).toFixed(1)} kN`,
          x: event.clientX - rect.left + 15,
          y: event.clientY - rect.top - 30,
        });
      }
    } else {
      setHoveredInfo(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredInfo(null)}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Floating Hover Telemetry Card */}
      {hoveredInfo && (
        <div
          style={{ left: `${hoveredInfo.x}px`, top: `${hoveredInfo.y}px` }}
          className="pointer-events-none absolute z-20 px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-cyan-500/40 rounded shadow-xl text-xs font-mono"
        >
          <div className="font-semibold text-cyan-300">{hoveredInfo.text}</div>
          {hoveredInfo.subtext && <div className="text-slate-400 mt-0.5">{hoveredInfo.subtext}</div>}
        </div>
      )}

      {/* Drafting active notification banner */}
      {memberDraftStartNodeId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-950/80 border border-emerald-500 rounded-full shadow-lg text-emerald-300 text-xs font-mono animate-pulse">
          Click second joint to complete member connection (or press Esc)
        </div>
      )}
    </div>
  );
}

export function getAnsysColor(normalizedT) {
  const t = Math.max(0.0, Math.min(1.0, isNaN(normalizedT) ? 0.0 : normalizedT));
  // 8-stop ANSYS / Jet engineering spectrum:
  const stops = [
    { t: 0.00, r: 0.12, g: 0.25, b: 0.69 }, // Deep Blue (#1e40af)
    { t: 0.14, r: 0.01, g: 0.52, b: 0.78 }, // Sky Blue (#0284c7)
    { t: 0.28, r: 0.02, g: 0.71, b: 0.83 }, // Cyan (#06b6d4)
    { t: 0.42, r: 0.06, g: 0.73, b: 0.51 }, // Emerald Green (#10b981)
    { t: 0.57, r: 0.52, g: 0.80, b: 0.09 }, // Yellow-Green (#84cc16)
    { t: 0.71, r: 0.92, g: 0.70, b: 0.03 }, // Amber-Yellow (#eab308)
    { t: 0.85, r: 0.98, g: 0.45, b: 0.09 }, // Orange (#f97316)
    { t: 1.00, r: 0.86, g: 0.15, b: 0.15 }, // Crimson Red (#dc2626)
  ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const span = upper.t - lower.t;
  const factor = span > 0 ? (t - lower.t) / span : 0;

  const color = new THREE.Color();
  color.setRGB(
    lower.r + (upper.r - lower.r) * factor,
    lower.g + (upper.g - lower.g) * factor,
    lower.b + (upper.b - lower.b) * factor
  );
  return color;
}

function renderSupportSymbol(group, pos, type) {
  if (type === 'pinned') {
    const coneGeo = new THREE.ConeGeometry(0.25, 0.45, 4);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.set(pos.x, pos.y - 0.25, pos.z);
    coneMesh.rotation.y = Math.PI / 4;
    group.add(coneMesh);
  } else if (type === 'roller_x' || type === 'roller_y') {
    const cylGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const roller = new THREE.Mesh(cylGeo, mat);
    roller.position.set(pos.x, pos.y - 0.15, pos.z);
    roller.rotation.x = Math.PI / 2;
    group.add(roller);
  } else if (type === 'fixed') {
    const boxGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(pos.x, pos.y - 0.2, pos.z);
    group.add(boxMesh);
  }
}
