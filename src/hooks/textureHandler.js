/**
 * @Description: textureHandler 材质调节面板类
 *              使用 lil-gui 库创建交互式材质参数调节面板
 *              允许用户实时调整车身材质、车窗、轮胎等参数
 *
 * @Description:
 * @Author: your name
 * @version:
 * @Date: 2024-12-26 14:37:45
 * @LastEditors: your name
 * @LastEditTime: 2024-12-26 15:08:50
 */

import * as Settings from "./carMaterialsSettings";
import { Color} from "three";
import * as lil from "lil-gui";

/**
 * TextrueHandler: 纹理处理器类
 * 构造函数参数：
 * - materials: THREE.Scene 中所有材质的对象（通常是 GLTF 模型导出的 materials）
 *
 * 功能：
 * 1. 遍历 carMaterialsSettings 中定义的所有材质类型
 * 2. 为每种材质创建独立的 GUI 文件夹
 * 3. 在文件夹中添加可调节的参数控件（颜色滑块、数值滑块）
 * 4. 当参数改变时，自动更新场景中对应材质的外观
 */
class TextrueHandler {
    /**
     * 构造函数
     * @param {Record<string, THREE.Material>} materials - 场景中的材质对象集合
     */
    constructor(materials) {
        /**
         * gui: 创建 lil-gui 实例
         * lil-gui 是一个轻量级的参数调节面板库
         */
        this.gui = new lil.GUI();

        /**
         * materials: 保存材质对象引用，用于后续参数更新
         */
        this.materials = materials;

        console.log('模型材质名称:', Object.keys(materials));
        console.log('Settings对象:', Settings);
        console.log('carPaint:', Settings.carPaint);

        /**
         * folderList: 存储所有创建的 GUI 文件夹
         * 用于后续遍历批量初始化控件
         */
        this.folderList = [];

        /**
         * 遍历 carMaterialsSettings 中导出的所有材质配置
         * 为每种材质创建一个 GUI 文件夹
         */
        for(let key in Settings){
            // 从配置对象中解构出 folderName 和其他参数
            const {folderName, ...rest} = Settings[key]
            // 创建 GUI 文件夹
            const folder = this.gui.addFolder(folderName)
            // 将材质参数对象绑定到文件夹的 targetObj
            // 这样后续 add 的控件会关联到这个对象
            folder.targetObj = rest
            // 将文件夹保存到列表中
            this.folderList.push(folder)
        }

        /**
         * 调用初始化方法，设置所有 GUI 控件和事件监听
         */
        this.initGui();
    }

    /**
     * initGui: 初始化所有 GUI 控件
     *
     * 遍历每个材质文件夹：
     * 1. 为文件夹中的每个参数添加对应的控件（颜色用颜色控件，数值用范围滑块）
     * 2. 设置参数的调节范围（roughness/metalness/opacity 是 0-1，其他是 0-10）
     * 3. 为每个控件绑定 onChange 回调，当数值变化时更新材质
     */
    initGui() {
        this.folderList.forEach((folder) => {
            // 找到 folder 操作的对应对象
            const { targetObj } = folder;

            /**
             * change: 参数变化时的回调函数
             * 遍历场景中所有材质，找到匹配类型的材质并应用新参数
             */
            const change = () => {
                for (let key in this.materials) {
                    const material = this.materials[key];
                    // 调用 changeMaterial 更新匹配到的材质
                    this.changeMaterial(targetObj.typeName, targetObj, material);
                }
            };

            /**
             * 如果有 color 参数，添加颜色选择控件
             * lil-gui 的 addColor 方法会创建一个颜色选择器
             * .onChange(change) 表示当颜色改变时调用 change 函数
             */
            targetObj.color && folder.addColor(targetObj, "color").onChange(change);

            /**
             * 遍历 targetObj 的所有属性（除了 color）
             * 为每个属性添加数值范围控件
             */
            Object.keys(targetObj).forEach((item) => {
                /**
                 * range: 参数的调节范围数组
                 * 默认 [0, 10]，如果是粗糙度/金属度/透明度则为 [0, 1]
                 */
                let range = [0, 10];
                if (item === "roughness" || item === "metalness" || item === 'opacity') {
                    range = [0, 1];  // 这类参数范围是 0-1
                }

                /**
                 * 如果不是 color 参数，添加数值滑块控件
                 * - min/max/step 定义滑块的最小/最大/步进值
                 * - .onChange(change) 监听数值变化
                 */
                if (item !== "color") {
                    folder.add(targetObj, item, range[0], range[1], 0.1).onChange(change);
                }
            });

            /**
             * 初始化时执行一次 change，确保 UI 和材质同步
             */
            change();
        });
    }

    /**
     * changeMaterial: 更新特定材质的外观参数
     *
     * @param {string} key - 材质类型名称（如 'Car_body'）
     * @param {Object} target - GUI 中绑定的参数对象（包含新的参数值）
     * @param {THREE.Material} material - 场景中实际的三维材质对象
     *
     * 逻辑：
     * 1. 检查材质名称是否包含目标类型名称
     * 2. 如果匹配，从 target 中提取参数并应用到材质
     * 3. color 需要特殊处理，转为 THREE.Color 对象
     */
    changeMaterial = (key, target, material) => {
        /**
         * material.name: THREE.js 材质对象的名称属性
         * 通常从 GLTF 模型加载时，名称会保留模型中的命名
         */
        if (material.name.includes(key)) {
            /**
             * 从 target 提取 color 和其他参数
             * rest 包含 metalness、roughness、opacity 等
             */
            const {color, ...rest} = target

            /**
             * 如果有 color 参数，将字符串转为 THREE.Color 对象并赋值
             */
            if(color){
                material.color = new Color(color);
            }

            /**
             * 遍历 rest，将其他数值参数直接赋值给材质
             */
            for(let key in rest){
                material[key] = rest[key]
            }
        }
    };
}

/**
 * 默认导出 TextrueHandler 类
 * 组件中使用方式：new TextrueHandler(materials)
 */
export default TextrueHandler;
