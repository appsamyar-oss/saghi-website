import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Compass, 
  Share2, 
  Check, 
  ShoppingBag, 
  Music, 
  Play 
} from 'lucide-react';

interface InfiniteGallery3DProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenInquiry?: (artwork: Artwork) => void;
}

export const InfiniteGallery3D: React.FC<InfiniteGallery3DProps> = ({
  artworks,
  onSelectArtwork,
  onOpenInquiry,
}) => {
  const { isFa, t, getLocalized } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Active artwork index in the carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isColorActive, setIsColorActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // References for animation state
  const stateRef = useRef({
    currentScroll: 0,
    targetScroll: 0,
    snapTimer: null as any,
    isMoving: false,
    stopTimeout: null as any,
    materials: [] as THREE.ShaderMaterial[],
    targetSaturations: [] as number[],
    paintingGroups: [] as THREE.Group[],
    meshes: [] as THREE.Mesh[],
    hoveredIndex: null as number | null,
    mouse: { x: 0, y: 0 },
    isDragging: false,
    startX: 0,
    lastScrollX: 0,
  });

  const items = useMemo(() => {
    if (artworks.length === 0) return [];
    return artworks;
  }, [artworks]);

  const activeArtwork = items[activeIndex] || items[0] || null;

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const CONFIG = {
      slideCount: items.length,
      spacingX: 38,
      pWidth: 15,
      pHeight: 18,
      camZ: 28,
      wallAngleY: -0.22,
      snapDelay: 180,
      lerpSpeed: 0.07,
    };

    const totalGalleryWidth = CONFIG.slideCount * CONFIG.spacingX;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 10, 110);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, CONFIG.camZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    const textureLoader = new THREE.TextureLoader();
    const planeGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight, 16, 16);

    // Custom Shader for Monochromatic Movement -> Smooth Color Bloom on Stop
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uSaturation;
      uniform float uActive;
      varying vec2 vUv;

      void main() {
        vec4 tex = texture2D(uTexture, vUv);
        
        // High-contrast monochromatic luminance calculation
        float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        vec3 bw = vec3(pow(gray, 1.08));
        
        // Blend from black & white into vibrant full colors
        vec3 color = mix(bw, tex.rgb, clamp(uSaturation, 0.0, 1.0));
        
        // Subtle warm vignette/amber accent on borders
        vec2 uvCenter = vUv - 0.5;
        float dist = length(uvCenter);
        float vignette = smoothstep(0.75, 0.4, dist);
        color *= mix(0.9, 1.0, vignette);

        // Active center artwork enhancement with subtle warm gold glow
        color = mix(color, color * 1.05 + vec3(0.025, 0.018, 0.008) * uActive, uActive * 0.4);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const materials: THREE.ShaderMaterial[] = [];
    const paintingGroups: THREE.Group[] = [];
    const paintingMeshes: THREE.Mesh[] = [];

    const raycaster = new THREE.Raycaster();

    items.forEach((art, i) => {
      const group = new THREE.Group();
      group.position.set(i * CONFIG.spacingX, 0, 0);

      const texture = textureLoader.load(art.imageUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uSaturation: { value: 0.0 },
          uActive: { value: i === 0 ? 1.0 : 0.0 },
        },
      });

      materials.push(mat);

      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.userData = { index: i, artwork: art };
      paintingMeshes.push(mesh);

      // Fine Museum Outer Frame Edge
      const edges = new THREE.EdgesGeometry(planeGeo);
      const outline = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.8 })
      );

      // Soft Floor / Wall Shadow
      const shadowGeo = new THREE.PlaneGeometry(CONFIG.pWidth + 0.6, CONFIG.pHeight + 0.6);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.position.set(0.6, -0.6, -0.4);

      // Perspective Architectural Gallery Grid Lines
      const lineZ = -0.8;
      const lineLen = CONFIG.spacingX;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-lineLen / 2, 13.5, lineZ),
        new THREE.Vector3(lineLen / 2, 13.5, lineZ),
        new THREE.Vector3(-lineLen / 2, -13.5, lineZ),
        new THREE.Vector3(lineLen / 2, -13.5, lineZ),
      ]);
      const lines = new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x181818 })
      );

      group.add(shadow);
      group.add(mesh);
      group.add(outline);
      group.add(lines);

      galleryGroup.add(group);
      paintingGroups.push(group);
    });

    galleryGroup.rotation.y = CONFIG.wallAngleY;
    galleryGroup.position.x = 6;

    stateRef.current.materials = materials;
    stateRef.current.paintingGroups = paintingGroups;
    stateRef.current.meshes = paintingMeshes;

    // Snapping logic
    const snapToNearest = () => {
      const index = Math.round(stateRef.current.targetScroll / CONFIG.spacingX);
      stateRef.current.targetScroll = index * CONFIG.spacingX;
    };

    // Wheel Scroll Event
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.targetScroll += e.deltaY * 0.08;
      stateRef.current.isMoving = true;

      if (stateRef.current.snapTimer) clearTimeout(stateRef.current.snapTimer);
      stateRef.current.snapTimer = setTimeout(snapToNearest, CONFIG.snapDelay);
    };

    // Touch & Mouse Dragging Events with Mobile Tap Detection
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let hasMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.ui-interactive')) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      hasMoved = false;
      stateRef.current.isMoving = true;
      if (stateRef.current.snapTimer) clearTimeout(stateRef.current.snapTimer);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.ui-interactive')) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = touchStartX - currentX;
      const diffY = touchStartY - currentY;

      // If predominantly horizontal swipe, lock gallery movement
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        hasMoved = true;
      }

      stateRef.current.targetScroll += diffX * 0.35;
      touchStartX = currentX;
      touchStartY = currentY;
      stateRef.current.isMoving = true;
      if (stateRef.current.snapTimer) clearTimeout(stateRef.current.snapTimer);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;

      // Detect clean mobile tap on canvas
      if (!hasMoved && touchDuration < 300 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = container.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        const touchMouse = new THREE.Vector2(
          (clientX / width) * 2 - 1,
          -(clientY / height) * 2 + 1
        );

        raycaster.setFromCamera(touchMouse, camera);
        const intersects = raycaster.intersectObjects(stateRef.current.meshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitIdx = hitMesh.userData.index;
          const currentRawIndex = Math.round(stateRef.current.targetScroll / CONFIG.spacingX);
          const currentSafeIndex = ((currentRawIndex % CONFIG.slideCount) + CONFIG.slideCount) % CONFIG.slideCount;

          if (hitIdx === currentSafeIndex) {
            onSelectArtwork(items[hitIdx]);
          } else {
            stateRef.current.targetScroll = hitIdx * CONFIG.spacingX;
          }
          return;
        }
      }

      snapToNearest();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.ui-interactive')) return;
      stateRef.current.isDragging = true;
      stateRef.current.startX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      stateRef.current.mouse.x = (clientX / width) * 2 - 1;
      stateRef.current.mouse.y = -(clientY / height) * 2 + 1;

      // Raycast to detect hover over paintings
      raycaster.setFromCamera(stateRef.current.mouse, camera);
      const intersects = raycaster.intersectObjects(stateRef.current.meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitIdx = hitMesh.userData.index;
        stateRef.current.hoveredIndex = hitIdx;
        container.style.cursor = 'pointer';
      } else {
        stateRef.current.hoveredIndex = null;
        container.style.cursor = stateRef.current.isDragging ? 'grabbing' : 'grab';
      }

      if (stateRef.current.isDragging) {
        const diff = stateRef.current.startX - e.clientX;
        stateRef.current.targetScroll += diff * 0.15;
        stateRef.current.startX = e.clientX;
        stateRef.current.isMoving = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (stateRef.current.isDragging) {
        const dragDist = Math.abs(e.clientX - stateRef.current.startX);
        stateRef.current.isDragging = false;

        // If it was a clean click on a painting without dragging
        if (dragDist < 6 && stateRef.current.hoveredIndex !== null) {
          const clickedIdx = stateRef.current.hoveredIndex;
          const currentRawIndex = Math.round(stateRef.current.targetScroll / CONFIG.spacingX);
          const currentSafeIndex = ((currentRawIndex % CONFIG.slideCount) + CONFIG.slideCount) % CONFIG.slideCount;

          if (clickedIdx === currentSafeIndex) {
            // Already centered: open full high-resolution artwork detail view
            onSelectArtwork(items[clickedIdx]);
          } else {
            // Center the clicked artwork and bloom its colors
            stateRef.current.targetScroll = clickedIdx * CONFIG.spacingX;
          }
        } else {
          snapToNearest();
        }
      }
    };

    // Attach listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        stateRef.current.targetScroll += CONFIG.spacingX;
        snapToNearest();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        stateRef.current.targetScroll -= CONFIG.spacingX;
        snapToNearest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const prevScroll = stateRef.current.currentScroll;
      stateRef.current.currentScroll +=
        (stateRef.current.targetScroll - stateRef.current.currentScroll) * CONFIG.lerpSpeed;

      const delta = Math.abs(stateRef.current.currentScroll - prevScroll);
      const isMovingNow = delta > 0.015;

      const xMove = stateRef.current.currentScroll * Math.cos(CONFIG.wallAngleY);
      const zMove = stateRef.current.currentScroll * Math.sin(CONFIG.wallAngleY);
      camera.position.x = xMove;
      camera.position.z = CONFIG.camZ - zMove;

      camera.rotation.x = stateRef.current.mouse.y * 0.035;
      camera.rotation.y = -stateRef.current.mouse.x * 0.035;

      paintingGroups.forEach((group, i) => {
        const originalX = i * CONFIG.spacingX;
        const distFromCam = stateRef.current.currentScroll - originalX;
        const shift = Math.round(distFromCam / totalGalleryWidth) * totalGalleryWidth;
        group.position.x = originalX + shift;
      });

      const rawIndex = Math.round(stateRef.current.currentScroll / CONFIG.spacingX);
      const safeIndex =
        ((rawIndex % CONFIG.slideCount) + CONFIG.slideCount) % CONFIG.slideCount;

      setActiveIndex(safeIndex);

      if (isMovingNow) {
        setIsColorActive(false);
        materials.forEach((mat, i) => {
          const isHovered = i === stateRef.current.hoveredIndex;
          const targetSat = isHovered ? 0.8 : 0.0;
          mat.uniforms.uSaturation.value += (targetSat - mat.uniforms.uSaturation.value) * 0.12;
          mat.uniforms.uActive.value += (0.0 - mat.uniforms.uActive.value) * 0.1;
        });
      } else {
        setIsColorActive(true);
        materials.forEach((mat, i) => {
          const isCurrent = i === safeIndex;
          const isHovered = i === stateRef.current.hoveredIndex;
          const isNear =
            Math.abs(i - safeIndex) === 1 ||
            Math.abs(i - safeIndex) === CONFIG.slideCount - 1;

          let targetSat = 0.0;
          if (isCurrent || isHovered) {
            targetSat = 1.0;
          } else if (isNear) {
            targetSat = 0.35;
          }

          const targetActive = (isCurrent || isHovered) ? 1.0 : 0.0;

          mat.uniforms.uSaturation.value +=
            (targetSat - mat.uniforms.uSaturation.value) * (isHovered ? 0.15 : 0.08);
          mat.uniforms.uActive.value +=
            (targetActive - mat.uniforms.uActive.value) * 0.08;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [items]);

  const scrollToSlide = (idx: number) => {
    const spacingX = 38;
    stateRef.current.targetScroll = idx * spacingX;
  };

  const handleNext = () => {
    const spacingX = 38;
    stateRef.current.targetScroll += spacingX;
  };

  const handlePrev = () => {
    const spacingX = 38;
    stateRef.current.targetScroll -= spacingX;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeArtwork) return null;

  const title = getLocalized(activeArtwork.title, activeArtwork.titleFa);
  const subtitle = getLocalized(activeArtwork.subtitle, activeArtwork.subtitleFa);
  const desc = getLocalized(activeArtwork.description, activeArtwork.descriptionFa);
  const artist = getLocalized(activeArtwork.artist, activeArtwork.artistFa);
  const medium = getLocalized(activeArtwork.medium, activeArtwork.mediumFa);
  const dastgah = getLocalized(activeArtwork.dastgah, activeArtwork.dastgahFa);
  const isMusic = activeArtwork.mediaType === 'audio' || activeArtwork.mediaType === 'video';

  return (
    <div 
      className="relative w-full h-[88vh] min-h-[600px] max-h-[920px] bg-black overflow-hidden select-none rounded-3xl border border-white/10 shadow-2xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={containerRef} 
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0" 
      />

      {/* Floating Status Badge: Monochrome In Motion vs Color Bloom */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 shadow-xl text-[10px] font-mono tracking-widest uppercase">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isColorActive ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-white/40'
            }`}
          />
          <span className="text-white/80">
            {isColorActive
              ? isFa
                ? 'رنگ‌ها و اصالت اثر نمایان شد'
                : 'COLOR & DETAIL REVEALED'
              : isFa
              ? 'در حال گردش سه‌بعدی • مونوکروم'
              : 'MONOCHROME IN MOTION'}
          </span>
        </div>
      </div>

      {/* Floating Editorial Catalogue Overlay - Fixed LEFT Alignment for both languages per user specification */}
      <div dir="ltr" className="absolute inset-0 z-10 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
        {/* Top Right Actions */}
        <div className="flex items-center justify-end gap-3 pointer-events-auto ui-interactive">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/70 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Share"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={() => onSelectArtwork(activeArtwork)}
            className="p-2.5 rounded-full bg-black/70 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Full Details"
          >
            <Maximize2 className="w-4 h-4 text-rose-400" />
          </button>
        </div>

        {/* Left Side Info Card (Fixed to Left Side of Screen) */}
        <div dir={isFa ? 'rtl' : 'ltr'} className={`max-w-md lg:max-w-lg pointer-events-auto ui-interactive self-start ${isFa ? 'text-right' : 'text-left'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeArtwork.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            >
              {/* Catalogue Tag */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-light tracking-[0.25em] uppercase flex items-center gap-1.5">
                  <span className={isFa ? 'font-vazir' : ''}>{t.common.volArchive}</span>
                  <span dir="ltr" className="font-mono">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="text-white/30">/</span>
                  <span dir="ltr" className="font-mono">{String(items.length).padStart(2, '0')}</span>
                </span>
                <span className="text-white/50 font-light flex items-center gap-2">
                  <span dir="ltr" className="font-mono">{activeArtwork.duration || activeArtwork.year}</span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${isFa ? 'font-vazir' : ''}`}>
                    {isMusic && <Music className="w-3 h-3 text-amber-400" />}
                    <span>{activeArtwork.category}</span>
                  </span>
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug ${
                  isFa ? 'font-vazir font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 py-0.5' : 'font-playfair'
                }`}>
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-xs sm:text-sm text-amber-300/80 font-light mt-1.5 ${isFa ? 'font-vazir' : 'font-serif'}`}>
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className={`text-xs sm:text-sm text-white/70 font-light leading-relaxed line-clamp-3 ${isFa ? 'font-vazir' : ''}`}>
                {desc}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className={`text-[10px] font-mono text-white/40 uppercase tracking-wider block ${isFa ? 'font-vazir' : ''}`}>
                    {dastgah ? t.detail.dastgahInfo : t.detail.artist}
                  </span>
                  <span className={`text-white/90 font-medium truncate block ${isFa ? 'font-vazir' : 'font-serif'}`}>
                    {dastgah || artist}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] font-mono text-white/40 uppercase tracking-wider block ${isFa ? 'font-vazir' : ''}`}>
                    {t.detail.medium}
                  </span>
                  <span className={`text-cyan-300 font-light truncate block ${isFa ? 'font-vazir' : ''}`}>
                    {medium}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Details & Purchase/Inquiry */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectArtwork(activeArtwork)}
                  className={`flex-1 py-3 px-4 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${isFa ? 'font-vazir' : 'font-mono'}`}
                >
                  {isMusic ? <Play className="w-3.5 h-3.5 fill-black" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isMusic ? t.common.playAudio : t.common.viewDetails}</span>
                </button>

                {onOpenInquiry && (
                  <button
                    onClick={() => onOpenInquiry(activeArtwork)}
                    className={`py-3 px-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 ${isFa ? 'font-vazir' : 'font-mono'}`}
                    title={t.common.inquirePiece}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t.common.inquirePiece}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Carousel Thumbnail Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto ui-interactive pt-4">
          <div className="text-[11px] font-mono text-white/40 flex items-center gap-2 tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className={isFa ? 'font-vazir' : ''}>
              {isFa
                ? 'درگ یا اسکرول کنید • توقف برای نمایش رنگی و بافت اثر'
                : 'Drag or scroll • Pause to reveal colors & detail'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-xl overflow-x-auto max-w-full">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => scrollToSlide(idx)}
                className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 select-none ${
                  activeIndex === idx
                    ? 'border-amber-400 scale-110 shadow-[0_0_8px_#fbbf24]'
                    : 'border-white/10 opacity-50 hover:opacity-80'
                }`}
                title={getLocalized(item.title, item.titleFa)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover pointer-events-none" 
                  referrerPolicy="no-referrer" 
                />
              </button>
            ))}

            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
