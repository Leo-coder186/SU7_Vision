/**
 * @Description: useModelInit 模型初始化 Hook
 *              在加载 GLTF 模型后，对模型进行预处理：
 *              隐藏用于标注位置的粒子精灵、提取车灯位置、配置尺寸标注等
 *
 * @param {THREE.Group} model - useGLTF 加载返回的模型对象（THREE.Group）
 *
 * @returns {Object} - 包含初始化后的数据和方法：
 *                     - sprites: 车门粒子精灵数组
 *                     - lensflares: 车灯位置信息数组
 *                     - markerMesh: 尺寸标注网格对象
 *                     - toggleMarker: 控制尺寸标注显示/隐藏的函数
 */

import * as THREE from 'three'
import { TweenFadeInOut } from '../utils/TweenAni'

/**
 * useModelInit: 模型初始化函数
 *
 * @param {THREE.Group} model - Three.js 模型组对象
 * @returns {Object} - 初始化后的数据和方法
 */
const useModelInit = (model) => {
    /**
     * sprites: 存储车门粒子精灵的数组
     * 这些粒子用于标注车门位置，点击后可以触发开关门动画
     */
    const sprites = []

    /**
     * lensflares: 存储车灯位置信息的数组
     * 用于后续创建车灯透镜光晕效果
     */
    const lensflares = []

    /**
     * markerMesh: 尺寸标注网格对象
     * 用于在 3D 空间中显示车身尺寸
     */
    let markerMesh

    /**
     * model.traverse: 遍历模型中的所有子对象
     * 这是一个深度优先遍历，会递归访问每个节点
     *
     * 对于每个子对象，检查其类型和名称，进行相应处理
     */
    model.traverse(mesh => {
        /**
         * 条件1：mesh.isMesh（是网格类型）且名称包含 'sprite'
         * 这些是用于标注车门位置的粒子精灵
         */
        if (mesh.isMesh && mesh.name.includes('sprite')) {
            // 保存到 sprites 数组
            sprites.push(mesh)
            // 设置材质为透明
            mesh.material.transparent = true
            // 初始透明度为 0（隐藏状态）
            mesh.material.opacity = 0
            /**
             * alphaTest: 透明度测试阈值
             * 当像素透明度低于此值时，该像素不会被渲染
             * 设置为 0.1 可以优化透明物体的渲染性能
             */
            mesh.material.alphaTest = 0.1
        }

        /**
         * 条件2：mesh.isMesh 且名称包含 'Lensflare'
         * 这些是车灯的发光标注点
         */
        if (mesh.isMesh && mesh.name.includes('Lensflare')) {
            // 保存到 lensflares 数组
            lensflares.push(mesh)
            // 设置为透明隐藏
            mesh.material.transparent = true
            mesh.material.opacity = 0
            mesh.material.alphaTest = 0.1
        }

        /**
         * 条件3：mesh.isMesh 且名称等于 'marker'
         * 这是用于显示车身尺寸的标注网格
         */
        if (mesh.isMesh && mesh.name === 'marker') {
            // 设置为透明隐藏
            mesh.material.transparent = true
            mesh.material.opacity = 0
            mesh.material.alphaTest = 0.1
            // 保存引用，用于后续控制显示/隐藏
            markerMesh = mesh
        }
    })

    /**
     * toggleMarker: 控制尺寸标注的显示/隐藏
     *
     * @param {boolean} show - true 显示标注，false 隐藏标注
     *
     * 功能：
     * - 当 show 为 true 时，opacity 设为 1（完全不透明）
     * - 当 show 为 false 时，opacity 设为 0（完全透明）
     * - 使用 TweenFadeInOut 创建渐变过渡动画
     */
    const toggleMarker = (show = true) => {
        if (markerMesh) {
            // 根据 show 参数设置目标透明度
            let opacity = show ? 1 : 0
            // 调用动画函数，使透明度以动画方式过渡到目标值
            TweenFadeInOut(markerMesh, opacity)
        }
    }

    /**
     * 返回值：暴露给组件使用的数据和方法
     */
    return {
        sprites,            // 车门粒子精灵数组
        lensflares,         // 车灯位置数组
        markerMesh,         // 尺寸标注网格
        toggleMarker        // 控制尺寸标注显示/隐藏
    }
}

/**
 * 默认导出 useModelInit 函数
 */
export default useModelInit
