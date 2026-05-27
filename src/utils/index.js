/**
 * @Description: index 工具函数模块
 *              导出项目中使用的通用工具函数
 *
 * 包含功能：
 * - pick: 射线拾取函数，用于检测鼠标与 3D 物体的交互
 * - flyTo: 相机视角平滑跳转动画
 */

import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { Easing } from '@tweenjs/tween.js'

/**
 * pick: 射线拾取函数
 *        将鼠标点击位置转换为射线，与场景中的物体进行相交检测
 *
 * @param {THREE.Vector2} screenPosition - 鼠标在屏幕上的位置 {x, y}
 * @param {THREE.Object3D[]} pickObjects - 需要检测的 3D 物体数组
 * @param {THREE.Camera} camera - 当前使用的相机
 * @returns {THREE.Intersection[]} - 相交结果数组，包含所有与射线相交的物体信息
 *
 * 使用示例：
 *   const mousePos = new THREE.Vector2(e.clientX, e.clientY);
 *   const intersects = pick(mousePos, sprites, camera.value);
 *   if (intersects.length > 0) {
 *     console.log('点击到了:', intersects[0].object);
 *   }
 *
 * 返回值说明：
 * - intersects[0]: 距离相机最近的相交物体
 * - intersects[0].object: 相交的物体本身
 * - intersects[0].point: 相交点的世界坐标
 * - intersects[0].distance: 交点与相机之间的距离
 *
 * 原理说明：
 * 1. 将屏幕坐标标准化到 NDC 空间（-1 到 1）
 * 2. 使用相机的 setFromCamera 方法创建射线
 * 3. 使用 raycaster.intersectObjects 检测射线与物体的相交
 */
export const pick = (screenPosition, pickObjects, camera) => {
    /**
     * raycaster: THREE.Raycaster 实例
     * 用于发射射线并检测与物体的相交
     */
    const rayCaster = new THREE.Raycaster()

    /**
     * 将屏幕坐标标准化到 NDC（归一化设备坐标）空间
     *
     * X 轴：屏幕左边缘 -1，右边缘 1
     * Y 轴：屏幕上边缘 1，下边缘 -1（屏幕 Y 轴向下，NDC Y 轴向上）
     */
    const ndcx = (screenPosition.x / window.innerWidth) * 2 - 1
    const ndcy = -(screenPosition.y / window.innerHeight) * 2 + 1

    /**
     * setFromCamera: 设置射线的起点和方向
     *
     * 参数：
     * - new THREE.Vector2(ndcx, ndcy): NDC 空间的屏幕坐标
     * - camera: 用于计算射线方向的相机
     *
     * 原理：
     * 射线从相机位置发射，经过 NDC 点对应的方向
     * 对于正交相机，方向恒定；对于透视相机，方向指向 NDC 点对应的场景位置
     */
    rayCaster.setFromCamera(new THREE.Vector2(ndcx, ndcy), camera)

    /**
     * intersectObjects: 执行射线与物体的相交检测
     *
     * 参数：
     * - pickObjects: 要检测的物体数组
     *
     * 返回值：
     * - 按距离排序的相交结果数组
     * - 距离相机最近的物体排在最前面
     */
    const intersects = rayCaster.intersectObjects(pickObjects)

    return intersects
}

/**
 * flyTo: 相机视角平滑跳转动画
 *        让相机从当前位置平滑过渡到目标位置
 *
 * @param {THREE.Camera} camera - 要控制移动的相机
 * @param {THREE.Vector3} destination - 目标位置坐标
 * @param {Number} duration - 动画持续时间（毫秒）
 * @param {Function} onComplete - 动画完成后的回调函数
 *
 * 使用示例：
 *   flyTo(camera, new THREE.Vector3(10, 5, 10), 2000, () => {
 *     console.log('相机移动完成');
 *   });
 *
 * 参数说明：
 * - Easing.Quintic.InOut: 五次方缓动，起始和结束慢，中间快
 * - onUpdate: 动画每帧更新时调用的回调，用于更新相机位置
 * - onComplete: 动画结束时调用的回调
 *
 * 注意：
 * - 动画使用的是 TWEEN.js 库，需要在渲染循环中调用 TWEEN.update()
 * - 相机需要支持 position 属性的赋值操作
 */
export const flyTo = (camera, destination, duration, onComplete) => {
    /**
     * startPos: 记录相机初始位置
     * 注意：这里创建了一个新对象，而不是直接引用 camera.position
     * 这样 Tween 动画可以独立地修改位置而不影响原相机
     */
    const startPos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    }

    /**
     * 创建补间动画
     *
     * - to: 目标位置
     * - duration: 动画时长（毫秒）
     * - easing: 缓动函数（Quintic.InOut 适合相机移动）
     * - onUpdate: 每帧更新时将 startPos 的值赋给相机
     * - onComplete: 动画结束时调用回调函数
     */
    new TWEEN.Tween(startPos)
        .to({
            x: destination.x,
            y: destination.y,
            z: destination.z
        }, duration)
        .easing(Easing.Quintic.InOut)  // 五次方缓动
        .onUpdate(() => {
            // 将更新后的位置赋给相机
            camera.position.set(startPos.x, startPos.y, startPos.z)
        })
        .onComplete(() => {
            // 动画完成后执行回调
            onComplete && onComplete()
        })
        .start()
}
