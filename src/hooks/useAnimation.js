/**
 * @Description: useAnimation 动画控制 Hook
 *              处理车门开关动画、轮胎旋转动画、粒子特效渲染等
 *
 * @param {THREE.Mesh[]} spriteMeshes - 车门粒子精灵网格数组
 * @param {THREE.AnimationClip[]} carAnimations - 模型中的关键帧动画剪辑数组
 * @param {THREE.Group} carModel - 汽车模型对象
 *
 * @returns {Object} - 包含动画控制方法：
 *                     - playTireRotation: 开始轮胎旋转
 *                     - stopTireRotation: 停止轮胎旋转
 */

import * as THREE from 'three'
import { useTresContext, useLoop } from '@tresjs/core'
import { TweenBiling, TweenMove } from '../utils/TweenAni'
import { pick } from '../utils'

/**
 * useAnimation: 动画控制主函数
 *
 * @param {THREE.Mesh[]} spriteMeshes - 车门粒子精灵网格数组
 * @param {THREE.AnimationClip[]} carAnimations - 关键帧动画剪辑数组
 * @param {THREE.Group} carModel - 汽车模型组
 * @returns {Object} - 动画控制方法
 */
const useAnimation = (spriteMeshes, carAnimations, carModel) => {
    /**
     * useTresContext: 获取 TresJS 的上下文
     * 包含 scene（场景）、camera（相机）等
     */
    const { scene, camera } = useTresContext()

    /**
     * useLoop: 获取渲染循环控制函数
     * onBeforeRender: 在每帧渲染之前调用的回调
     * 用于更新动画状态（关键帧动画、骨骼动画等）
     */
    const { onBeforeRender } = useLoop()

    /**
     * renderData: 车门动画渲染数据数组
     * 包含每个车门的：名称、初始位置（关闭）、目标位置（打开）
     *
     * 数据结构：
     * - name: 动画/粒子名称
     * - start: 车门关闭时粒子位置
     * - end: 车门打开时粒子位置
     */
    const renderData = [
        {
            name: '左前门开',
            start: spriteMeshes.find(item => item.name === 'spriteLeftFront').position.clone(),
            end: spriteMeshes.find(item => item.name === 'spriteLeftFront-open').position.clone(),
        },
        {
            name: '左后门开',
            start: spriteMeshes.find(item => item.name === 'spriteLeftBehind').position.clone(),
            end: spriteMeshes.find(item => item.name === 'spriteLeftBehind-open').position.clone(),
        },
        {
            name: '右前门开',
            start: spriteMeshes.find(item => item.name === 'spriteRightFront').position.clone(),
            end: spriteMeshes.find(item => item.name === 'spriteRightFront-open').position.clone(),
        },
        {
            name: '右后门开',
            start: spriteMeshes.find(item => item.name === 'spriteRightBehind').position.clone(),
            end: spriteMeshes.find(item => item.name === 'spriteRightBehind-open').position.clone(),
        }
    ]

    /**
     * sprites: 存储创建的 THREE.Sprite 粒子对象数组
     * 用于点击交互和位置动画
     */
    const sprites = []

    /**
     * renderSprites: 渲染车门粒子
     *
     * 功能：
     * 1. 加载粒子纹理图片
     * 2. 为每个车门位置创建一个 Sprite 对象
     * 3. 给粒子添加闪烁动画效果
     * 4. 将粒子添加到场景
     */
    const renderSprites = () => {
        // 加载粒子纹理：使用 pointSprite.png 作为粒子图片
        const texture = new THREE.TextureLoader().load('/src/assets/images/pointSprite.png')

        // 创建粒子材质
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,              // 粒子纹理图片
            transparent: true          // 启用透明
        })

        // 遍历 renderData，为每个车门创建一个粒子
        renderData.forEach(item => {
            const { start, end, name } = item

            // 创建 THREE.Sprite 粒子对象
            const sprite = new THREE.Sprite(spriteMaterial)

            // 设置粒子初始位置（车门关闭时的位置）
            sprite.position.copy(start)

            // 保存车门打开和关闭时的位置，用于动画
            sprite.end = end      // 车门打开时粒子的目标位置
            sprite.start = start  // 车门关闭时粒子的起始位置

            // 将名称保存到 sprite 对象上，用于后续事件处理
            sprite.name = name

            /**
             * isClosed: 粒子状态标志
             * - true: 当前是关门状态（粒子在起始位置）
             * - false: 当前是开门状态（粒子在目标位置）
             */
            sprite.isClosed = false

            // 设置粒子初始大小（较小，便于点击车门区域）
            sprite.scale.set(0.2, 0.2, 0.2)

            // 给粒子添加闪烁动画效果（TweenBiling 会让粒子持续闪烁）
            TweenBiling(sprite, 0.4)

            // 将粒子添加到场景
            scene.value.add(sprite)

            // 保存到 sprites 数组
            sprites.push(sprite)
        })
    }

    /**
     * mixer: THREE.AnimationMixer 实例
     * 用于播放模型中的关键帧动画（开关门动画）
     */
    const mixer = new THREE.AnimationMixer(carModel)

    /**
     * addEvent: 添加点击事件监听
     *
     * 功能：
     * 1. 监听鼠标点击事件
     * 2. 通过射线检测判断是否点击到粒子
     * 3. 如果点击到粒子，执行开关门逻辑
     */
    const addEvent = () => {
        addEventListener('click', e => {
            // 将鼠标点击位置转为屏幕坐标
            const screenPosition = new THREE.Vector2(e.clientX, e.clientY)

            /**
             * pick: 射线拾取函数
             * 用于检测鼠标点击位置与场景中物体的交叉
             */
            const intersectObjects = pick(screenPosition, sprites, camera.value)

            // 如果有检测到交叉对象（点击到了粒子）
            if (intersectObjects.length) {
                // 获取被点击的粒子对象
                const targetSprite = intersectObjects[0].object

                // 通过粒子名称查找对应的动画剪辑
                const targetClip = carAnimations.find(item => item.name === targetSprite.name)

                // 根据粒子状态判断是开门还是关门
                if (!targetSprite.isClosed) {
                    /**
                     * 开门逻辑：
                     * 1. 播放开门动画（正向播放关键帧）
                     * 2. 将粒子移动到开门位置（使用 TweenMove 动画）
                     * 3. 将粒子状态改为关门状态
                     */
                    playAnimation(targetClip, 'open')
                    TweenMove(targetSprite, targetSprite.end)
                    targetSprite.isClosed = true
                } else {
                    /**
                     * 关门逻辑：
                     * 1. 播放关门动画（反向播放关键帧）
                     * 2. 将粒子移动到关门位置
                     * 3. 将粒子状态改为开门状态
                     */
                    playAnimation(targetClip, 'close')
                    TweenMove(targetSprite, targetSprite.start)
                    targetSprite.isClosed = false
                }
            }
        })
    }

    /**
     * playAnimation: 播放开关门关键帧动画
     *
     * @param {THREE.AnimationClip} clip - 动画剪辑对象
     * @param {string} type - 播放类型，'open' 开门（正向）或 'close' 关门（反向）
     *
     * 实现逻辑：
     * 1. 先停止所有当前正在播放的动画
     * 2. 获取动画动作（Action）并配置
     * 3. 设置播放参数：时间、速度、循环模式
     */
    const playAnimation = (clip, type = 'open') => {
        // 停止所有当前正在播放的动画动作
        mixer.stopAllAction()

        // 获取该剪辑对应的动画动作
        const action = mixer.clipAction(clip)

        // clampWhenFinished: 动画播放完毕后保持在最后一帧
        action.clampWhenFinished = true

        if (type === 'close') {
            /**
             * 关门动画（反向播放）：
             * 1. 将动画时间设置到最后一帧
             * 2. timeScale 设为 -1 表示反向播放
             */
            action.time = action.getClip().duration  // 跳到动画末尾
            action.timeScale = -1                     // 反向播放
        } else {
            /**
             * 开门动画（正向播放）：
             * 1. 将动画时间设置到第一帧
             * 2. timeScale 设为 1 表示正向播放
             */
            action.time = 0                           // 从头开始
            action.timeScale = 1                      // 正向播放
        }

        /**
         * loop: 循环模式
         * THREE.LoopOnce 表示只播放一次
         */
        action.loop = THREE.LoopOnce

        // 开始播放动画
        action.play()
    }

    /**
     * 轮胎旋转动画相关变量
     */
    let tireAni = false          // 是否正在播放轮胎动画
    let tireMeshes = []          // 存储四个轮胎网格对象

    /**
     * playTireRotation: 开始轮胎旋转动画
     *
     * 功能：
     * 1. 遍历汽车模型，找到四个车轮网格
     * 2. 标记 tireAni 为 true，开始在渲染循环中更新轮胎旋转
     */
    const playTireRotation = () => {
        /**
         * tireNames: 四个车轮的名称数组
         * 这些名称需要与 GLTF 模型中的节点名称匹配
         */
        const tireNames = [
            'Left-Wheel-Behind',   // 左后轮
            'Left-Wheel-Front',    // 左前轮
            'Right-Wheel-Behind',  // 右后轮
            'Right-Wheel-Front'    // 右前轮
        ]

        // 清空轮胎数组
        tireMeshes = []

        // 遍历汽车模型，查找名称匹配的车轮网格
        carModel.traverse(mesh => {
            if (tireNames.includes(mesh.name)) {
                // 保存找到的轮胎网格
                tireMeshes.push(mesh)
            }
        })

        // 标记开始轮胎动画
        tireAni = true
    }

    /**
     * stopTireRotation: 停止轮胎旋转动画
     *
     * 功能：将 tireAni 设为 false，渲染循环中将不再更新轮胎旋转
     */
    const stopTireRotation = () => {
        tireAni = false
    }

    /**
     * clock: THREE.Clock 实例
     * 用于计算动画更新间隔时间
     */
    const clock = new THREE.Clock()

    /**
     * onBeforeRender: 渲染循环回调
     *
     * 功能：
     * 1. 更新 AnimationMixer，使关键帧动画播放
     * 2. 如果轮胎动画启用，更新四个轮胎的旋转角度
     */
    onBeforeRender(() => {
        // 更新关键帧动画，传入上一帧到当前帧的时间差
        if (mixer) {
            mixer.update(clock.getDelta())
        }

        // 如果轮胎动画启用，旋转轮胎
        if (tireAni && tireMeshes.length) {
            tireMeshes.forEach(tire => {
                /**
                 * rotation.x -= 0.3:
                 * 每帧绕 X 轴旋转 0.3 弧度
                 * 负值表示向一个方向旋转（可模拟向前行驶）
                 */
                tire.rotation.x -= 0.3
            })
        }
    })

    // 初始化：渲染粒子并添加点击事件
    renderSprites()
    addEvent()

    // 返回动画控制方法供外部调用
    return {
        playTireRotation,    // 开始轮胎旋转
        stopTireRotation     // 停止轮胎旋转
    }
}

/**
 * 默认导出 useAnimation 函数
 */
export default useAnimation
