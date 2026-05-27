/**
 * @Description: useMeshStatic 材质球静态渲染 Hook
 *              在屏幕侧边创建一个虚拟场景，用于渲染材质选择球
 *              支持鼠标悬停放大效果和点击应用材质
 *
 * @param {Array} ballInfos - 材质球信息数组
 * @param {Record<string, THREE.Material>} materials - 模型的材质集合
 *
 * 功能说明：
 * 1. 创建一个独立的 3D 正交相机和场景
 * 2. 在屏幕上渲染多个材质球（代表不同的材质方案）
 * 3. 实现鼠标悬停时材质球放大旋转效果
 * 4. 实现鼠标点击时将对应材质应用到汽车模型
 */

import * as THREE from 'three'
import {useTresContext, useLoop} from '@tresjs/core'
import { pick } from '../utils';
import { TweenScale, TweenColorChange } from '../utils/TweenAni';
import * as TWEEN from '@tweenjs/tween.js'
import useMaterial from './useMaterial';

/**
 * 获取材质管理方法
 */
const {getMaterialPlanById} = useMaterial()

/**
 * screenPosToWorld: 将屏幕坐标转换为世界坐标
 *
 * @param {Object} screenPos - 屏幕坐标 {x, y}
 * @param {THREE.Camera} camera - 相机对象
 * @returns {THREE.Vector3} - 转换后的世界坐标
 *
 * 转换步骤：
 * 1. 将屏幕坐标标准化到 NDC 范围（-1 到 1）
 * 2. 使用相机的 unproject 方法反投影到世界坐标
 */
export const screenPosToWorld = (screenPos, camera) => {
    // 创建临时向量存储屏幕坐标
    const screenPosition = new THREE.Vector3();

    /**
     * 步骤1：将屏幕坐标转为 NDC（归一化设备坐标）
     *
     * screenPos.x / window.innerWidth: 0（左）到 1（右）
     * (screenPos.x / window.innerWidth) * 2 - 1: -1（左）到 1（右）
     *
     * screenPos.y / window.innerHeight: 0（顶）到 1（底）
     * -(screenPos.y / window.innerHeight) * 2 + 1: 1（顶）到 -1（底）
     * 注意：屏幕 Y 轴向下，NDC Y 轴向上，所以需要取反
     */
    screenPosition.x = (screenPos.x / window.innerWidth) * 2 - 1;
    screenPosition.y = -(screenPos.y / window.innerHeight) * 2 + 1;
    screenPosition.z = 0.5; // 深度值设为 0.5（相机近平面和远平面之间的中间值）

    /**
     * 步骤2：使用相机的 unproject 方法将 NDC 坐标反投影到世界坐标
     *
     * unproject 的原理是：
     * 从相机位置出发，沿着经过给定 NDC 点的射线方向发射，
     * 将射线与指定深度的平面相交，得到世界坐标
     */
    screenPosition.unproject(camera);

    return screenPosition;
};

/**
 * handleIntersection: 处理射线交叉（当前未使用，预留接口）
 */
const handleIntersection = () => {

}

/**
 * useMeshStatic: 材质球静态渲染主函数
 *
 * @param {Array<{uniqId: number, color: THREE.Color, metalness: Number, position: THREE.Vector2}>} ballInfos
 *        材质球信息数组，每个元素包含：
 *        - uniqId: 材质方案唯一 ID
 *        - color: 材质球颜色
 *        - metalness: 金属度
 *        - position: 屏幕上的位置（THREE.Vector2）
 *
 * @param {Record<string, THREE.MeshStandardMaterial>} materials
 *        模型材质集合，键是材质名称，值是 THREE 材质对象
 */
const useMeshStatic = (ballInfos, materials) => {
    // 如果没有材质球数据，直接返回
    if (!ballInfos || ballInfos.length === 0) {
        console.warn('没有材质方案数据，材质球不显示')
        return
    }

    /**
     * sceneVisual: 虚拟材质球场景
     * 独立于主场景，用于渲染材质选择球
     */
    const sceneVisual = new THREE.Scene()

    /**
     * cameraVisual: 正交相机
     *
     * 正交相机特点：
     * - 没有透视变形，物体大小与距离无关
     * - 适合渲染 UI 类元素（如材质球选择器）
     * - 相机位置和朝向决定了场景的"投影窗口"
     *
     * 参数说明：
     * - left/right: 相机视锥体左右边界（负值/正值）
     * - top/bottom: 相机视锥体上下边界
     * - near/far: 近裁切面和远裁切面距离
     */
    const cameraVisual = new THREE.OrthographicCamera(
        -window.innerWidth / 2,   // left: 左边界
        window.innerWidth / 2,     // right: 右边界
        window.innerHeight / 2,    // top: 上边界
        -window.innerHeight / 2,   // bottom: 下边界
        0.01,                      // near: 近裁切面
        100000                     // far: 远裁切面
    )

    /**
     * 获取 TresJS 上下文中的主场景、渲染器和相机
     */
    const {scene, renderer, camera} = useTresContext()

    /**
     * onAfterRender: 在主场景渲染之后执行的回调
     * 用于将虚拟材质球场景叠加渲染到主场景之上
     */
    const {onAfterRender} = useLoop()

    /**
     * normalTexture: 材质球的法线贴图
     * 用于给材质球表面增加凹凸感
     */
    const normalTexture = new THREE.TextureLoader().load('/src/assets/images/normal_ball.png')

    /**
     * 将主场景的环境光复制到虚拟场景
     * 这样材质球也能受到环境光影响，渲染出正确的 PBR 效果
     */
    sceneVisual.environment = scene.value.environment

    /**
     * 将主场景中所有光源复制到虚拟场景
     * 筛选条件 item.isLight 确保只复制光源对象
     */
    sceneVisual.children = scene.value.children.filter(item => item.isLight)

    /**
     * balls: 存储创建的材质球网格对象数组
     */
    const balls = []

    /**
     * 遍历 ballInfos，为每个材质方案创建一个 3D 球体网格
     */
    ballInfos.forEach(info => {
        const { color, uniqId, position, metalness } = info

        // 创建球体几何体：半径 64，32 分段
        const geometry = new THREE.SphereGeometry(64, 32)

        // 创建 PBR 材质
        const material = new THREE.MeshStandardMaterial({
            color,                  // 基础颜色
            metalness: 0.8,         // 金属度（材质球使用较高的金属度）
            roughness: 0.2,          // 粗糙度（材质球表面较光滑）
            normalMap: normalTexture // 法线贴图增加表面细节
        })

        // 创建网格对象
        const mesh = new THREE.Mesh(geometry, material)

        /**
         * 将屏幕位置转换为世界坐标
         * 注意：这里使用的是正交相机 cameraVisual
         */
        const positionWorld = screenPosToWorld(position, cameraVisual)
        mesh.position.copy(positionWorld)

        // 保存材质方案的 uniqId，用于点击时识别
        mesh.uniqId = uniqId

        // 将球体添加到虚拟场景
        sceneVisual.add(mesh)

        // 保存到数组用于后续交互
        balls.push(mesh)
    })

    /**
     * 禁用渲染器的自动清除功能
     * 这样可以实现叠加渲染：先渲染主场景，再渲染虚拟场景
     */
    renderer.value.autoClear = false

    /**
     * hoveredBall: 当前悬停的材质球
     * 用于在渲染循环中让悬停的球旋转
     */
    let hoveredBall

    /**
     * onAfterRender: 渲染循环回调
     *
     * 功能：
     * 1. 更新 TWEEN 动画引擎
     * 2. 如果有悬停的球，让它持续旋转
     * 3. 渲染主场景
     * 4. 清除深度缓冲区
     * 5. 渲染虚拟材质球场景
     */
    onAfterRender(() => {
        // 更新所有 TWEEN 动画
        TWEEN.update()

        // 如果有悬停的材质球，让它绕 Y 轴旋转
        if (hoveredBall) {
            hoveredBall.rotation.y += 0.02
        }

        // 清除渲染器的颜色和深度缓冲区
        renderer.value.clear()

        // 渲染主场景
        renderer.value.render(scene.value, camera.value)

        // 清除深度缓冲区（保留颜色缓冲区）
        // 这样虚拟场景可以叠加在主场景之上
        renderer.value.clearDepth()

        // 渲染虚拟材质球场景
        renderer.value.render(sceneVisual, cameraVisual)
    })

    /**
     * mousemove: 鼠标移动事件
     *
     * 功能：
     * 1. 检测鼠标是否悬停在某个材质球上
     * 2. 如果悬停，放大材质球并改变鼠标样式
     * 3. 如果离开，恢复材质球大小
     */
    addEventListener('mousemove', e => {
        // 将鼠标位置转为屏幕坐标
        const screenPosition = new THREE.Vector2(e.clientX, e.clientY)

        // 射线检测，获取与材质球相交的对象
        const intersects = pick(screenPosition, balls, cameraVisual)

        if (intersects.length) {
            // 获取悬停的材质球
            hoveredBall = intersects[0].object

            // 缩小材质球（从 1.4 倍缩小到 1 倍）
            TweenScale(hoveredBall, false)

            // 改变鼠标样式为手型
            document.body.style.cursor = 'pointer'
        } else {
            // 如果之前有悬停的球
            if (hoveredBall) {
                // 恢复材质球大小（从 1 倍放大到 1.4 倍）
                TweenScale(hoveredBall, true)
                hoveredBall = null
            }
        }
    })

    /**
     * click: 鼠标点击事件
     *
     * 功能：
     * 1. 检测是否点击了某个材质球
     * 2. 如果点击，通过 uniqId 获取材质方案
     * 3. 将材质方案应用到汽车模型的各个部件
     */
    addEventListener('click', e => {
        // 将鼠标位置转为屏幕坐标
        const screenPosition = new THREE.Vector2(e.clientX, e.clientY)

        // 射线检测，获取与材质球相交的对象
        const intersects = pick(screenPosition, balls, cameraVisual)

        if (intersects.length) {
            // 获取点击的材质球
            const clickedBall = intersects[0].object

            // 根据 uniqId 获取完整的材质方案
            const materialPlan = getMaterialPlanById(clickedBall.uniqId)

            /**
             * 应用材质方案到汽车模型
             *
             * 遍历材质方案中的每个部件配置
             * 结构示例：
             * {
             *   uniqId: 1,
             *   '车身材质': { typeName: 'Car_body', color: '#ff0000', metalness: 0.9, ... },
             *   '车窗材质': { typeName: 'Car_window', color: '#00ff00', ... },
             *   ...
             * }
             */
            const { uniqId, ...rest } = materialPlan
            for (let key in rest) {
                // 解构出部件的类型名称和参数
                const { typeName, ...restItems } = rest[key]

                // 从模型材质集合中找到对应名称的材质
                const targetMaterial = materials[typeName]

                // 遍历参数并应用到目标材质
                for (let item in restItems) {
                    /**
                     * 如果是颜色参数，使用颜色渐变动画
                     * TweenColorChange 会让颜色平滑过渡，而不是突变
                     */
                    if (item === 'color') {
                        TweenColorChange(
                            targetMaterial.color,
                            new THREE.Color(restItems[item])
                        )
                    } else {
                        /**
                         * 其他参数（metalness, roughness 等）直接赋值
                         */
                        targetMaterial[item] = restItems[item]
                    }
                }
            }
        }
    })
}

/**
 * 默认导出 useMeshStatic 函数
 */
export default useMeshStatic
