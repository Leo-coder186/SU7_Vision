<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import eventBus from '@/utils/eventBus'
import * as THREE from 'three'

const isActive = ref(false)
const { scene, camera } = useTresContext()

// 1. 隧道中心曲线 - 坚守 X 轴方向不变
const tunnelCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-300, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(300, 0, 0)
])

// 2. 动态构建高级流光光束（抛弃小圆点粒子，改用线段 LineSegments，拉出高阶运动残影）
const particleCount = 350
const linePositions = new Float32Array(particleCount * 2 * 3) // 每条线2个点(起点、终点)，每个点3个坐标
const lineColors = new Float32Array(particleCount * 2 * 3)
const speeds = new Float32Array(particleCount)
const lineLengths = new Float32Array(particleCount)

const initParticles = () => {
  const colorFront = new THREE.Color('#00ffff') // 流光头部（高亮青）
  const colorBack = new THREE.Color('#001133')  // 流光尾部（深蓝淡出）
  
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    // 收紧半径，让流光贴着 SU7 车身飞掠，速度感更爆棚
    const radius = 1.6 + Math.random() * 3.5 
    
    const length = 15 + Math.random() * 25 // 流光线长度
    const xPos = -300 + Math.random() * 600 // 散落在整条隧道内
    lineLengths[i] = length
    speeds[i] = 240 + Math.random() * 100 // 大幅提升冲锋时速（原先40太慢像龟速）

    const y = Math.sin(angle) * radius + 0.7 // 对应车身高度
    const z = Math.cos(angle) * radius

    // 点1：线段后端
    linePositions[i * 6] = xPos
    linePositions[i * 6 + 1] = y
    linePositions[i * 6 + 2] = z

    // 点2：线段前端（前进方向）
    linePositions[i * 6 + 3] = xPos + length
    linePositions[i * 6 + 4] = y
    linePositions[i * 6 + 5] = z

    // 设置渐变色：前端亮、后端暗，自带速度剪裁效果
    lineColors[i * 6] = colorBack.r;     lineColors[i * 6 + 1] = colorBack.g;     lineColors[i * 6 + 2] = colorBack.b
    lineColors[i * 6 + 3] = colorFront.r; lineColors[i * 6 + 4] = colorFront.g;  lineColors[i * 6 + 5] = colorFront.b
  }
}
initParticles()

const linesGeometry = new THREE.BufferGeometry()
linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))

// 3. 预创建所有 3D 核心容器
const tunnelGroup = new THREE.Group()

// 【超级视觉升级 A】不透明实心钛金外壳（完全盖住背景杂光）
// 采用 Standard 物理材质，能够完美反射车灯和霓虹环的光芒，产生类似真车的反射质感
const tunnelMesh = new THREE.Mesh(
  new THREE.TubeGeometry(tunnelCurve, 80, 4.8, 16, false),
  new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    transparent: false, // 🚨 关键修复：完全不透明！
    opacity: 1.0,       // 🚨 关键修复：死死挡住外面的大楼和天空盒背景
    color: new THREE.Color('#020509'), // 极深邃的极客黑
    roughness: 0.15,    // 较低粗糙度，带来反射倒影
    metalness: 0.85     // 高金属度
  })
)

// 激光流光线段
const linesMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending // 辉光爆亮模式
})
const speedLines = new THREE.LineSegments(linesGeometry, linesMaterial)

tunnelGroup.add(tunnelMesh)
tunnelGroup.add(speedLines)

// 【超级视觉升级 B】内置 15 组等距科幻霓虹灯环（解决马赛克贴图粗糙不好看的问题）
const ringCount = 15
const ringsArray = []
const ringSpacing = 40 

for (let i = 0; i < ringCount; i++) {
  const ringGeo = new THREE.TorusGeometry(4.75, 0.04, 8, 24)
  ringGeo.rotateY(Math.PI / 2) // 摆正角度，垂直套在 X 轴上
  
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(i % 2 === 0 ? '#00e5ff' : '#0055ff'), // 青蓝相间
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })
  
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  ringMesh.position.x = -200 + i * ringSpacing
  tunnelGroup.add(ringMesh)
  ringsArray.push(ringMesh)
}

// 压低车底反光的网格底座
const gridHelper = new THREE.GridHelper(600, 60, new THREE.Color('#002233'), new THREE.Color('#010408'))
gridHelper.position.y = -0.38
tunnelGroup.add(gridHelper)

tunnelGroup.visible = false

// 4. 加载纹理做辅助层叠
const textureLoader = new THREE.TextureLoader()
textureLoader.load('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500', (tex) => {
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 2)
  tunnelMesh.material.map = tex
  tunnelMesh.material.needsUpdate = true
})

// 5. 核心渲染循环
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  if (!isActive.value) return

  // 动画 A：隧道贴图沿 X 轴高速流转
  if (tunnelMesh.material.map) {
    tunnelMesh.material.map.offset.x -= delta * 8
  }

  // 动画 B：霓虹灯环向后高速抽离（形成高级的空间透视纵深动效）
  ringsArray.forEach((ring) => {
    ring.position.x -= delta * 130 // 向左后退
    if (ring.position.x < -240) {
      ring.position.x = 360 // 抽离后接回右侧末尾
    }
  })

  // 动画 C：【方向核心纠正】粒子线段应当向左疾驰扑面而来（模拟车往前开）
  const posArr = speedLines.geometry.attributes.position.array
  for (let i = 0; i < particleCount; i++) {
    const currentSpeed = speeds[i] * delta * 4
    
    // 线段的前端和后端同时向左移（坐标减小）
    posArr[i * 6] -= currentSpeed     
    posArr[i * 6 + 3] -= currentSpeed 

    // 当线段完全飞出左边界（X < -250），无缝刷回到右侧最深处重新投射
    if (posArr[i * 6 + 3] < -250) {
      const xPos = 250 + Math.random() * 50
      posArr[i * 6] = xPos
      posArr[i * 6 + 3] = xPos + lineLengths[i]
    }
  }
  speedLines.geometry.attributes.position.needsUpdate = true

  // 动画 D：同步纠正车轮旋转速度与前进方向匹配
  if (scene.value) {
    scene.value.traverse((object) => {
      if (object.isMesh && (object.name.toLowerCase().includes('wheel') || object.name.includes('轮'))) {
        object.rotation.x += delta * 160 // 正向狂飙
      }
    })
  }

  // 动画 E：相机高级颠簸共振（Y轴和X轴复合高频晃动，更逼真）
  if (camera.value) {
    const cam = camera.value.camera || camera.value.instance || camera.value
    if (cam) {
      cam.position.x += Math.sin(elapsed * 150) * 0.006
      cam.position.y += Math.cos(elapsed * 120) * 0.003
    }
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
  if (newVal && scene.value) {
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
  <TresGroup />
</template>