<!--
 * @Description: CarModel 整车模型加载与交互组件
 *              负责加载汽车 GLB 模型、初始化材质、配置交互功能
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 10:15:22
 * @LastEditors: your name
 * @LastEditTime: 2024-12-23 11:14:34
-->
<template>
  <!-- 汽车模型容器：设置位置在地面上方偏移 0.05 单位，避免浮空或穿插 -->
  <TresGroup :position="[0,0.05,0]">
    <!-- primitive 组件用于直接渲染 Three.js 原生对象，这里渲染加载的 GLTF 模型 -->
    <primitive :object="model"/>
  </TresGroup>

  <!-- 静态反射地板：在车辆静止状态下显示，使用高反射材质模拟地面倒影 -->
  <TresGroup v-if="!isMoved">
    <Suspense>
      <Ground/>
    </Suspense>
  </TresGroup>

  <!-- 移动旋转地板：在车辆启动状态下显示，地面会移动产生动态效果 -->
  <TresGroup v-if="isMoved">
    <Suspense>
      <GroundMoved/>
    </Suspense>
  </TresGroup>
</template>

<script setup>
/**
 * 引入的依赖模块说明：
 * - ref: Vue 3 响应式引用，用于创建响应式状态变量
 * - useGLTF: @tresjs/cientos 提供的组合式函数，用于异步加载 GLTF/GLB 3D模型
 * - useModelInit: 自定义 Hook，用于初始化模型（隐藏辅助粒子、提取车灯位置等）
 * - TextureHandler: 自定义类，用于创建 lil-gui 材质调节面板
 * - useMaterial: 自定义 Hook，用于材质方案的管理（存储、读取、切换）
 * - useMeshStatic: 自定义 Hook，用于渲染材质球选择界面
 * - useAnimation: 自定义 Hook，用于处理开关门动画和轮胎旋转
 * - useLensflare: 自定义 Hook，用于创建车灯光晕效果
 * - eventBus: 事件总线，用于组件间通信（如开关车灯、启动车辆等事件）
 * - useTresContext: @tresjs/core 提供的组合式函数，用于获取 TresJS 的渲染上下文
 * - lil: lil-gui 库，用于创建交互式参数调节面板
 */
import {ref, onMounted} from 'vue'
import {useGLTF} from '@tresjs/cientos'
import useModelInit from '@/hooks/useModelinit';
import TextureHandler from '@/hooks/textureHandler'
import useMaterial from '@/hooks/useMaterial';
import useMeshStatic from '@/hooks/useMeshStatic';
import useAnimation from '@/hooks/useAnimation';
import useLensflare from '@/hooks/useLensflare';
import GroundMoved from './GroundMove.vue';
import Ground from './Ground.vue'
import * as lil from 'lil-gui'
import eventBus from '@/utils/eventBus.js';
import {useTresContext} from '@tresjs/core'

/**
 * useTresContext() 获取 TresJS 的渲染上下文
 * scene: THREE.Scene 实例，所有 3D 对象都添加到这个场景中
 */
const {scene}=useTresContext()

/**
 * isMoved: 响应式变量，控制地板状态
 * - false: 静止状态，显示反射地板
 * - true: 移动状态，显示旋转移动地板
 */
const isMoved=ref(false)

/**
 * 创建全局 lil-gui 实例，用于材质参数调节面板
 */
const gui = new lil.GUI()

/**
 * useGLTF: 异步加载 su7.glb 汽车模型
 * - 第一个参数：模型文件路径
 * - 第二个参数：配置对象
 *   - draco: true 表示使用 Draco 压缩算法压缩过的模型
 * 返回值解构：
 * - scene: THREE.Group，包含加载的所有网格、材质、动画
 * - animations: THREE.AnimationClip[]，模型中包含的所有关键帧动画
 * - materials: Record<string, THREE.Material>，模型中所有材质的对象
 */
const {scene:model,animations,materials}=await useGLTF('/src/assets/models/su7.glb',{
    draco:true
})

// 强制设置车身为海湾蓝（小米SU7标准色 #0077be）
// 材质名称是 Car_body
if (materials['Car_body']) {
    materials['Car_body'].color.set('#0077be')
}

/**
 * emit: 定义组件可以触发的事件
 * camera-ready: 当模型加载完成后触发，通知父组件相机已准备就绪
 */
const emit = defineEmits(['camera-ready'])

// 模型加载完成后通知父组件
emit('camera-ready')

/**
 * TextureHandler: 创建材质调节面板
 * 参数：materials - 模型的材质对象集合
 * 功能：创建 lil-gui 面板，允许用户实时调节材质参数
 */
const textureHandler = new TextureHandler(materials)

/**
 * 添加保存材质球按钮到 GUI
 */
gui.add({
    saveMaterial: () => {
        // 获取当前所有材质参数，创建新方案
        const newPlan = {
            uniqId: Date.now(),
            '车身材质': {
                typeName: 'Car_body',
                color: '#' + (materials['Car_body']?.color?.getHexString() || '#0077be'),
                metalness: materials['Car_body']?.metalness ?? 0.9,
                roughness: materials['Car_body']?.roughness ?? 0.1
            },
            '车窗材质': {
                typeName: 'Car_window',
                color: '#' + (materials['Car_window']?.color?.getHexString() || '88ccff'),
                metalness: materials['Car_window']?.metalness ?? 0.1,
                roughness: materials['Car_window']?.roughness ?? 0.05
            },
            '轮胎材质': {
                typeName: 'M_Wheel_ALL.005',
                color: '#' + (materials['M_Wheel_ALL.005']?.color?.getHexString() || '333333'),
                metalness: materials['M_Wheel_ALL.005']?.metalness ?? 0.0,
                roughness: materials['M_Wheel_ALL.005']?.roughness ?? 0.9
            }
        }
        const {setMateiralList} = useMaterial()
        setMateiralList(newPlan)
        alert('材质球已保存！刷新页面查看。')
    }
}, 'saveMaterial').name('保存材质球')



/**
 * 获取材质球信息
 */
const {getBallInfos} = useMaterial()
const ballInfos = getBallInfos()

/**
 * useModelInit: 初始化汽车模型
 * 功能：
 * 1. 隐藏用于标注位置的粒子精灵（sprite）
 * 2. 提取车灯位置信息（lensflares）
 * 3. 提取尺寸标注标记（marker）
 * 返回值：
 * - sprites: 粒子精灵数组，用于车门开合交互
 * - lensflares: 车灯发光体数组，用于创建车灯效果
 * - toggleMarker: 控制尺寸标注显示/隐藏的函数
 */
const {sprites,lensflares,toggleMarker}=useModelInit(model)

/**
 * useMeshStatic: 在屏幕上渲染材质球选择面板
 * 参数：
 * - ballInfos: 材质方案信息数组，包含每个方案的颜色、位置等
 * - materials: 模型的材质对象，用于应用选中的材质方案
 * - 4500: 延迟4.5秒后开始渲染材质球，避开开场动画的卡顿
 * 功能：创建一个虚拟场景渲染材质球，支持鼠标悬停放大、点击应用材质
 */
useMeshStatic(ballInfos, materials, 4500)

/**
 * useAnimation: 处理动画逻辑
 * 参数：
 * - sprites: 车门粒子精灵数组
 * - animations: 模型中的关键帧动画剪辑
 * - model: 汽车模型对象
 * 功能：
 * 1. 渲染车门粒子并添加点击事件
 * 2. 处理开关门动画播放
 * 3. 处理轮胎旋转动画
 * 返回值：
 * - playTireRotation: 开始轮胎旋转
 * - stopTireRotation: 停止轮胎旋转
 */
const {playTireRotation,stopTireRotation}=useAnimation(sprites,animations,model)

/**
 * lights: 存储创建的车灯 PointLight 对象数组
 * 用于后续移除和销毁
 */
const lights=[]

/**
 * 监听"开启车灯"事件
 * eventBus.on('changeCarLight', callback)
 * 当用户点击开启车灯按钮时触发
 */
eventBus.on('changeCarLight',(value)=>{
  if(value){
    /**
     * 开启车灯：
     * 1. 遍历所有车灯位置
     * 2. 使用 useLensflare 创建带光晕的点光源
     * 3. 将光源添加到场景中
     */
    lensflares.forEach(item=>{
      const pointLight=useLensflare(item.position)
      scene.value.add(pointLight)
      lights.push(pointLight)
    })
  }else{
    /**
     * 关闭车灯：
     * 1. 从场景中移除所有车灯光源
     * 2. 释放光源占用的内存
     * 3. 清空 lights 数组
     */
    lights.forEach(light => {
      scene.value.remove(light)
      light.dispose()
    })
    lights.length=0
  }
})

/**
 * 监听"一键启动"事件
 * eventBus.on('changeCarStart', callback)
 * 当用户点击启动按钮时触发
 */
eventBus.on('changeCarStart',value=>{
    isMoved.value=value
    if(isMoved.value){
      /**
       * 车辆启动：
       * 1. 切换地板到移动模式
       * 2. 开始播放轮胎旋转动画
       */
      playTireRotation()
    }else{
      /**
       * 车辆停止：
       * 1. 切换地板到静止模式
       * 2. 停止轮胎旋转动画
       */
      stopTireRotation()
    }
})

/**
 * 监听"显示尺寸"事件
 * eventBus.on('changeCarSize', callback)
 * 当用户点击尺寸按钮时触发
 */
eventBus.on('changeCarSize',value=>{
    /**
     * toggleMarker: 控制尺寸标注的显示/隐藏
     * 参数 true 显示标注，false 隐藏标注
     */
    toggleMarker(value)
})
</script>

<style scoped>
/* 组件作用域样式，当前为空 */
</style>
