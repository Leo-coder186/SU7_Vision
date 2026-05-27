<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import eventBus from '@/utils/eventBus'
import * as THREE from 'three'

const isActive = ref(false)
const { scene, camera } = useTresContext()

// 隧道曲线 - 沿 X 轴方向
const tunnelCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-200, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(200, 0, 0)
])

// 粒子系统 - 沿 X 轴运动
const particleCount = 250
const positions = new Float32Array(particleCount * 3)
const speeds = new Float32Array(particleCount)

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = 2.5 + Math.random() * 4
  positions[i * 3] = -200 + Math.random() * 400  // X - 分散在隧道内
  positions[i * 3 + 1] = Math.sin(angle) * radius + 0.8  // Y
  positions[i * 3 + 2] = Math.cos(angle) * radius     // Z - 圆周分布
  speeds[i] = 40 + Math.random() * 60
}

const pointsGeometry = new THREE.BufferGeometry()
pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// 预创建 3D 对象
const tunnelGroup = new THREE.Group()
const tunnelMesh = new THREE.Mesh(
  new THREE.TubeGeometry(tunnelCurve, 64, 5, 12, false),
  new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8,
    color: new THREE.Color('#00E5FF')
  })
)

const pointsMaterial = new THREE.PointsMaterial({
  color: new THREE.Color('#0088FF'),
  size: 0.3,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
})
const points = new THREE.Points(pointsGeometry, pointsMaterial)

const gridHelper = new THREE.GridHelper(300, 80, new THREE.Color('#00E5FF'), new THREE.Color('#002244'))
gridHelper.position.y = -0.4

tunnelGroup.add(tunnelMesh)
tunnelGroup.add(points)
tunnelGroup.add(gridHelper)
tunnelGroup.visible = false

// 纹理加载
const textureLoader = new THREE.TextureLoader()
textureLoader.load('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500', (tex) => {
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 2)
  tunnelMesh.material.map = tex
  tunnelMesh.material.needsUpdate = true
})

// 渲染循环
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  if (!isActive.value) return

  // 隧道贴图动画 - 沿 X 轴
  if (tunnelMesh.material.map) {
    tunnelMesh.material.map.offset.x -= delta * 6
  }

  // 粒子动画 - 沿 X 轴负方向（向车尾方向）
  const posAttribute = points.geometry.attributes.position
  for (let i = 0; i < particleCount; i++) {
    posAttribute.array[i * 3] -= speeds[i] * delta * 2.5
    if (posAttribute.array[i * 3] < -200) {
      posAttribute.array[i * 3] = 200
    }
  }
  posAttribute.needsUpdate = true

  // 车轮旋转 - 沿 X 轴高速旋转
  if (scene.value) {
    scene.value.traverse((object) => {
      if (object.isMesh && (object.name.toLowerCase().includes('wheel') || object.name.includes('轮'))) {
        object.rotation.x -= delta * 200
      }
    })
  }

  // 相机震动 - 沿 X 轴
  if (camera.value) {
    camera.value.position.x += Math.sin(elapsed * 120) * 0.008
  }
})

const handleTunnelStatus = (status) => {
  isActive.value = status
}

onMounted(() => {
  eventBus.on('changeTunnelMotion', handleTunnelStatus)
})

onUnmounted(() => {
  eventBus.off('changeTunnelMotion', handleTunnelStatus)
  if (tunnelGroup.parent) {
    tunnelGroup.parent.remove(tunnelGroup)
  }
})

watch(isActive, (newVal) => {
  if (newVal) {
    tunnelGroup.visible = true
    scene.value.add(tunnelGroup)
  } else {
    tunnelGroup.visible = false
    if (tunnelGroup.parent) {
      tunnelGroup.parent.remove(tunnelGroup)
    }
  }
})
</script>

<template>
</template>