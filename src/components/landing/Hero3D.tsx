import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Sparkles, FileText, Cpu, Network } from 'lucide-react'

export const Hero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [webglSupported, setWebglSupported] = useState<boolean>(true)

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setWebglSupported(false)
      return
    }

    const currentMount = mountRef.current
    if (!currentMount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      setWebglSupported(false)
      return
    }

    const width = currentMount.clientWidth || 550
    const height = currentMount.clientHeight || 550

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    currentMount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const coreLight = new THREE.PointLight(0x6366f1, 5, 20)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 15)
    cyanLight.position.set(3, 2, 2)
    scene.add(cyanLight)

    const violetLight = new THREE.PointLight(0x8b5cf6, 3, 15)
    violetLight.position.set(-3, -2, 2)
    scene.add(violetLight)

    // Central Intelligence Core (Icosahedron with wireframe inner mesh)
    const coreGroup = new THREE.Group()

    const coreGeo = new THREE.IcosahedronGeometry(1.1, 1)
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      emissive: 0x6366f1,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.6,
      thickness: 1.2,
      transparent: true,
      opacity: 0.85,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreGroup.add(coreMesh)

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.7, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerMesh)

    scene.add(coreGroup)

    // Floating Translucent Document Cards (Plane Geometries with rounded edges or borders)
    const cardsGroup = new THREE.Group()
    const cardGeo = new THREE.PlaneGeometry(1.2, 1.6)

    const cardPositions = [
      { pos: new THREE.Vector3(-2.6, 1.4, 0.8), rot: new THREE.Euler(0.2, 0.4, -0.1), color: 0x6366f1 },
      { pos: new THREE.Vector3(2.5, 1.2, 0.4), rot: new THREE.Euler(-0.15, -0.35, 0.1), color: 0x06b6d4 },
      { pos: new THREE.Vector3(-2.2, -1.5, 1.2), rot: new THREE.Euler(0.1, 0.3, 0.15), color: 0x8b5cf6 },
      { pos: new THREE.Vector3(2.4, -1.4, 0.7), rot: new THREE.Euler(-0.2, -0.4, -0.1), color: 0x3b82f6 },
      { pos: new THREE.Vector3(0, -2.4, -0.5), rot: new THREE.Euler(0.3, 0, 0), color: 0x6366f1 },
    ]

    const cardMeshes: THREE.Mesh[] = []

    cardPositions.forEach((cp) => {
      const cardMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.7,
        thickness: 0.5,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(cardGeo, cardMat)
      mesh.position.copy(cp.pos)
      mesh.rotation.copy(cp.rot)

      // Wireframe border
      const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(cardGeo),
        new THREE.LineBasicMaterial({ color: cp.color, transparent: true, opacity: 0.6 })
      )
      mesh.add(wireframe)

      cardsGroup.add(mesh)
      cardMeshes.push(mesh)
    })

    scene.add(cardsGroup)

    // Connecting Particle Pathways (Curved Beziers from cards to core)
    const particleCount = 120
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)

      // Gradient between electric violet and cyan
      const isCyan = Math.random() > 0.5
      particleColors[i * 3] = isCyan ? 0.02 : 0.39
      particleColors[i * 3 + 1] = isCyan ? 0.71 : 0.4
      particleColors[i * 3 + 2] = isCyan ? 0.83 : 0.94
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Orbital rings around core representing RAG retrieval loops
    const ringGeo = new THREE.RingGeometry(1.6, 1.62, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    })
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat)
    ringMesh1.rotation.x = Math.PI / 2.5
    scene.add(ringMesh1)

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat.clone())
    ringMesh2.rotation.x = -Math.PI / 3
    ringMesh2.rotation.y = Math.PI / 4
    scene.add(ringMesh2)

    // Mouse Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onPointerMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener('mousemove', onPointerMove)

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return
      const newWidth = currentMount.clientWidth
      const newHeight = currentMount.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(currentMount)

    // Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Smooth pointer parallax
      targetX += (mouseX * 0.8 - targetX) * 0.05
      targetY += (mouseY * 0.8 - targetY) * 0.05

      camera.position.x = targetX
      camera.position.y = targetY
      camera.lookAt(0, 0, 0)

      // Rotate core
      coreGroup.rotation.y = elapsedTime * 0.25
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15
      innerMesh.rotation.y = -elapsedTime * 0.4

      // Gentle floating motion for document cards
      cardMeshes.forEach((mesh, index) => {
        const offset = index * 1.3
        mesh.position.y = cardPositions[index].pos.y + Math.sin(elapsedTime * 0.7 + offset) * 0.15
        mesh.rotation.z = cardPositions[index].rot.z + Math.cos(elapsedTime * 0.5 + offset) * 0.05
      })

      // Rotate particles and rings
      particles.rotation.y = elapsedTime * 0.08
      particles.rotation.x = elapsedTime * 0.04
      ringMesh1.rotation.z = elapsedTime * 0.15
      ringMesh2.rotation.z = -elapsedTime * 0.12

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onPointerMove)
      resizeObserver.disconnect()
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement)
      }
      renderer.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      cardGeo.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[600px] flex items-center justify-center">
      {/* Background glow orb */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-cyan-500/15 blur-[90px] translate-x-24 -translate-y-12 pointer-events-none" />

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full relative z-10" />

      {/* Graceful Fallback if WebGL unavailable or reduced motion */}
      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-md p-6 rounded-3xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <Cpu className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Neural Retrieval Architecture</h4>
            <p className="text-sm text-slate-300">
              Vectorized document clustering and real-time semantic RAG synthesis engine.
            </p>
          </div>
        </div>
      )}

      {/* Floating Badges for visual depth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute top-6 left-4 sm:left-8 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/75 backdrop-blur-md shadow-xl text-xs text-white"
      >
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="font-medium">Hybrid BM25 + Dense Vectors</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 right-4 sm:right-8 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/75 backdrop-blur-md shadow-xl text-xs text-white"
      >
        <Network className="w-4 h-4 text-indigo-400" />
        <span className="font-medium">Direct Evidence Citation</span>
      </motion.div>
    </div>
  )
}

