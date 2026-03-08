import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/*
  ┌──────────────────────────────────────────────────┐
  │  Three.js 3D Chessboard Background               │
  │  • Fixed behind all content                       │
  │  • 8×8 board with all 32 chess pieces             │
  │  • Cursor hover → pieces glow + squares light up  │
  │  • Subtle ambient animation keeps it alive        │
  └──────────────────────────────────────────────────┘
*/

// ─── Chess piece 3D shapes (simplified geometric representations) ───
const PIECE_CONFIGS = {
  pawn:   { height: 0.5,  radius: 0.15, segments: 8  },
  rook:   { height: 0.7,  radius: 0.18, segments: 4  },
  knight: { height: 0.75, radius: 0.18, segments: 6  },
  bishop: { height: 0.8,  radius: 0.16, segments: 8  },
  queen:  { height: 0.9,  radius: 0.2,  segments: 12 },
  king:   { height: 1.0,  radius: 0.2,  segments: 12 },
};

// Standard chess starting position
const BOARD_SETUP = [
  ['rook','knight','bishop','queen','king','bishop','knight','rook'],
  ['pawn','pawn','pawn','pawn','pawn','pawn','pawn','pawn'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['pawn','pawn','pawn','pawn','pawn','pawn','pawn','pawn'],
  ['rook','knight','bishop','queen','king','bishop','knight','rook'],
];

const GOLD     = 0xC6A15B;
const GOLD_HEX = '#C6A15B';
const DARK_SQ  = 0x1a1200;   // deep dark espresso
const LIGHT_SQ = 0x7a6238;   // warm gold-brown (much brighter)
const BG_COLOR = 0x080808;

function createPieceGeometry(type) {
  const cfg = PIECE_CONFIGS[type];
  const group = new THREE.Group();

  // Base cylinder
  const baseGeo = new THREE.CylinderGeometry(cfg.radius, cfg.radius * 1.2, 0.1, cfg.segments);
  const baseMesh = new THREE.Mesh(baseGeo);
  baseMesh.position.y = 0.05;
  group.add(baseMesh);

  // Body
  const bodyGeo = new THREE.CylinderGeometry(cfg.radius * 0.7, cfg.radius, cfg.height * 0.6, cfg.segments);
  const bodyMesh = new THREE.Mesh(bodyGeo);
  bodyMesh.position.y = cfg.height * 0.35;
  group.add(bodyMesh);

  // Top
  if (type === 'king') {
    // Cross on top
    const crossV = new THREE.BoxGeometry(0.04, 0.2, 0.04);
    const crossH = new THREE.BoxGeometry(0.15, 0.04, 0.04);
    const cv = new THREE.Mesh(crossV);
    cv.position.y = cfg.height;
    const ch = new THREE.Mesh(crossH);
    ch.position.y = cfg.height + 0.05;
    group.add(cv, ch);
  } else if (type === 'queen') {
    // Crown sphere
    const crownGeo = new THREE.SphereGeometry(cfg.radius * 0.5, cfg.segments, 8);
    const crownMesh = new THREE.Mesh(crownGeo);
    crownMesh.position.y = cfg.height * 0.75;
    group.add(crownMesh);
  } else if (type === 'bishop') {
    // Pointed top
    const topGeo = new THREE.ConeGeometry(cfg.radius * 0.5, 0.25, cfg.segments);
    const topMesh = new THREE.Mesh(topGeo);
    topMesh.position.y = cfg.height * 0.75;
    group.add(topMesh);
  } else if (type === 'knight') {
    // Angled head
    const headGeo = new THREE.BoxGeometry(0.15, 0.25, 0.25);
    const headMesh = new THREE.Mesh(headGeo);
    headMesh.position.set(0.05, cfg.height * 0.65, 0);
    headMesh.rotation.z = -0.3;
    group.add(headMesh);
  } else if (type === 'rook') {
    // Flat top with notches
    const topGeo = new THREE.CylinderGeometry(cfg.radius * 0.9, cfg.radius * 0.7, 0.15, cfg.segments);
    const topMesh = new THREE.Mesh(topGeo);
    topMesh.position.y = cfg.height * 0.7;
    group.add(topMesh);
  } else {
    // Pawn — simple sphere top
    const topGeo = new THREE.SphereGeometry(cfg.radius * 0.55, 8, 6);
    const topMesh = new THREE.Mesh(topGeo);
    topMesh.position.y = cfg.height * 0.6;
    group.add(topMesh);
  }

  return group;
}

const ChessboardBg = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.FogExp2(BG_COLOR, 0.015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0x555544, 5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    mainLight.position.set(5, 12, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xC6A15B, 1.8);
    fillLight.position.set(-5, 8, -3);
    scene.add(fillLight);

    // Gold point light that follows cursor (starts offscreen)
    const cursorLight = new THREE.PointLight(GOLD, 0, 8);
    cursorLight.position.set(-999, 3, -999);
    scene.add(cursorLight);

    // Rim lights
    const rimLight1 = new THREE.PointLight(GOLD, 1.8, 30);
    rimLight1.position.set(-5, 4, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(GOLD, 1.5, 30);
    rimLight2.position.set(5, 4, 5);
    scene.add(rimLight2);

    // ─── Chessboard ───
    const SQUARE_SIZE = 1;
    const BOARD_SIZE = 8;
    const OFFSET = (BOARD_SIZE * SQUARE_SIZE) / 2 - SQUARE_SIZE / 2;
    const squares = [];
    const squareMeshes = [];

    const darkMat = new THREE.MeshStandardMaterial({
      color: DARK_SQ,
      roughness: 0.5,
      metalness: 0.2,
      emissive: 0x100a02,
    });
    const lightMat = new THREE.MeshStandardMaterial({
      color: LIGHT_SQ,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x2a1e08,
    });

    const squareGeo = new THREE.BoxGeometry(SQUARE_SIZE, 0.1, SQUARE_SIZE);

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isDark = (row + col) % 2 === 1;
        const mat = isDark ? darkMat.clone() : lightMat.clone();
        const square = new THREE.Mesh(squareGeo, mat);
        square.position.set(col * SQUARE_SIZE - OFFSET, 0, row * SQUARE_SIZE - OFFSET);
        square.receiveShadow = true;
        square.userData = { row, col, isDark, originalColor: mat.color.clone() };
        scene.add(square);
        squares.push(square);
        squareMeshes.push(square);
      }
    }

    // ─── Chess Pieces ───
    const pieces = [];
    const pieceMaterial = new THREE.MeshStandardMaterial({
      color: GOLD,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x3a2a10,
    });
    const darkPieceMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3825,
      roughness: 0.4,
      metalness: 0.5,
      emissive: 0x1a1208,
    });

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const pieceType = BOARD_SETUP[row][col];
        if (!pieceType) continue;

        const isWhite = row >= 6; // Bottom two rows are "white" (gold)
        const pieceGroup = createPieceGeometry(pieceType);

        // Apply material to all meshes in the group
        const mat = isWhite ? pieceMaterial.clone() : darkPieceMaterial.clone();
        pieceGroup.traverse((child) => {
          if (child.isMesh) {
            child.material = mat;
            child.castShadow = true;
          }
        });

        pieceGroup.position.set(
          col * SQUARE_SIZE - OFFSET,
          0.05,
          row * SQUARE_SIZE - OFFSET
        );
        pieceGroup.userData = {
          row, col, type: pieceType, isWhite,
          originalY: 0.05,
          material: mat,
        };
        scene.add(pieceGroup);
        pieces.push(pieceGroup);
      }
    }

    // ─── Board border / frame ───
    const borderGeo = new THREE.BoxGeometry(BOARD_SIZE + 0.4, 0.08, BOARD_SIZE + 0.4);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x1a1408,
      roughness: 0.6,
      metalness: 0.3,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -0.02;
    scene.add(border);

    // Gold edge lines
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOARD_SIZE + 0.4, 0.1, BOARD_SIZE + 0.4));
    const edgeMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.02;
    scene.add(edgeLines);

    // ─── Raycaster for mouse interaction ───
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredSquare = null;

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleMouseLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // ─── Scroll-based camera tilt ───
    let scrollProgress = 0;
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ─── Resize ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation Loop ───
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle camera orbit based on scroll
      const baseAngle = elapsed * 0.05;
      const scrollTilt = scrollProgress * 0.6;
      const camRadius = 12 - scrollProgress * 2;
      const camHeight = 9 - scrollProgress * 2;

      camera.position.x = Math.sin(baseAngle) * camRadius;
      camera.position.z = Math.cos(baseAngle) * camRadius;
      camera.position.y = camHeight + Math.sin(elapsed * 0.3) * 0.3;
      camera.lookAt(0, 0, 0);

      // Raycast for hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(squareMeshes);

      // Reset previously hovered items
      squares.forEach((sq) => {
        const ud = sq.userData;
        sq.material.emissive.lerp(new THREE.Color(0x000000), 0.1);
        sq.material.color.lerp(ud.originalColor, 0.08);
      });

      pieces.forEach((p) => {
        p.position.y += (p.userData.originalY - p.position.y) * 0.08;
        p.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive.lerp(new THREE.Color(0x000000), 0.1);
          }
        });
      });

      cursorLight.intensity += (0 - cursorLight.intensity) * 0.1;

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const hitRow = hit.userData.row;
        const hitCol = hit.userData.col;

        // Glow the hovered square
        hit.material.emissive.set(GOLD);
        hit.material.emissive.multiplyScalar(0.35);

        // Highlight surrounding squares
        squares.forEach((sq) => {
          const dr = Math.abs(sq.userData.row - hitRow);
          const dc = Math.abs(sq.userData.col - hitCol);
          if (dr <= 2 && dc <= 2 && (dr + dc > 0)) {
            const dist = Math.max(dr, dc);
            sq.material.emissive.set(GOLD);
            sq.material.emissive.multiplyScalar(dist === 1 ? 0.2 : 0.08);
          }
        });

        // Animate pieces near cursor
        pieces.forEach((p) => {
          const pr = p.userData.row;
          const pc = p.userData.col;
          const dr = Math.abs(pr - hitRow);
          const dc = Math.abs(pc - hitCol);
          const dist = Math.sqrt(dr * dr + dc * dc);

          if (dist < 3) {
            const intensity = 1 - dist / 3;
            // Lift piece up
            p.position.y = p.userData.originalY + intensity * 0.4;
            // Glow piece brightly
            p.traverse((child) => {
              if (child.isMesh) {
                child.material.emissive.set(GOLD);
                child.material.emissive.multiplyScalar(intensity * 0.8);
              }
            });
          }
        });

        // Position cursor light at hit point
        const hitPoint = intersects[0].point;
        cursorLight.position.set(hitPoint.x, 3, hitPoint.z);
        cursorLight.intensity = 4;
      }

      // Subtle idle piece bobbing
      pieces.forEach((p, i) => {
        const idleBob = Math.sin(elapsed * 0.8 + i * 0.5) * 0.02;
        p.position.y += idleBob;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ChessboardBg;
