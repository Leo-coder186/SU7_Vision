/**
 * @Description: useLensflare 车灯光晕效果 Hook
 *              使用 Three.js 的 Lensflare（镜头光晕）类创建逼真的车灯效果
 *              Lensflare 模拟真实镜头在强光源下产生的光学衍射现象
 *
 * @param {THREE.Vector3} position - 车灯在 3D 空间中的位置
 *
 * @returns {THREE.PointLight} - 创建的带光晕的点光源对象
 */

import { Lensflare } from 'three/addons/objects/Lensflare.js';
import { LensflareElement } from 'three/addons/objects/Lensflare.js';
import * as THREE from 'three'

/**
 * useLensflare: 创建车灯光晕效果的函数
 *
 * @param {THREE.Vector3} position - 车灯在 3D 空间中的位置
 * @returns {THREE.PointLight} - 配置好的点光源（已添加光晕效果）
 *
 * 实现原理：
 * 1. 创建一个 PointLight（点光源），点光源会向所有方向发光
 * 2. 创建一个 Lensflare 对象作为光源的子元素
 * 3. 为 Lensflare 添加 LensflareElement（光晕元素）
 * 4. 将光晕的位置设置为与点光源相同
 * 5. 返回配置好的点光源，可以直接添加到场景
 *
 * Lensflare 效果说明：
 * - 当相机镜头对准强光源时，光线在镜头内部产生衍射
 * - 会在光源周围形成多个环形或弧形的光斑
 * - 这些光斑沿光源-相机连线分布，越远越淡
 */
const useLensflare = (position) => {
    /**
     * light: 创建点光源
     *
     * 参数说明：
     * - 0xffffff: 白色光（十六进制颜色值）
     * - 1.5: 光照强度
     * - 2000: 光照最大距离（超过此距离光照衰减为 0）
     *
     * PointLight 特点：
     * - 从一点向所有方向发射光线
     * - 有光照衰减，距离越远光线越暗
     * - 常用于灯泡、烛光、车灯等点状光源
     */
    const light = new THREE.PointLight(0xffffff, 1.5, 2000);

    /**
     * lensflare: 创建镜头光晕对象
     *
     * Three.js 的 Lensflare 类：
     * - 模拟相机镜头拍摄强光源时的光学现象
     * - 可以添加多个光晕元素，每个元素有不同的大小、颜色、距离
     */
    const lensflare = new Lensflare();

    /**
     * textureFlare: 加载光晕纹理图片
     *
     * po.png 应该是：
     * - 圆形渐变或发光效果的图片
     * - 中心最亮，向外逐渐透明
     * - 用于模拟真实镜头光晕的视觉效果
     *
     * TextureLoader.load: 异步加载图片为纹理
     */
    const textureFlare = new THREE.TextureLoader().load('/src/assets/images/po.png')

    /**
     * lensflare.addElement: 添加光晕元素
     *
     * 参数说明：
     * - new LensflareElement(textureFlare, 512, 0)
     *   - textureFlare: 光晕使用的纹理图片
     *   - 512: 光晕元素的大小（像素）
     *   - 0: 光晕元素距离光源的偏移（0 表示位于光源位置）
     *
     * 可以添加多个 LensflareElement 来创建复杂的光晕效果
     */
    lensflare.addElement(new LensflareElement(textureFlare, 512, 0));

    /**
     * light.add(lensflare): 将光晕添加为点光源的子元素
     *
     * 这样当点光源移动时，光晕会跟着一起移动
     * 确保光晕始终在正确的位置
     */
    light.add(lensflare);

    /**
     * 设置点光源的位置
     * 使用传入的 position 参数，确保光晕在车灯的正确位置
     */
    light.position.copy(position)

    /**
     * 返回配置好的点光源
     * 组件中使用 scene.add(light) 将其添加到场景
     */
    return light
}

/**
 * 默认导出 useLensflare 函数
 */
export default useLensflare
