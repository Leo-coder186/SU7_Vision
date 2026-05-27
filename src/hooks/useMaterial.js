/**
 * @Description: useMaterial 材质方案管理 Hook
 *              提供材质方案的创建、存储、读取、应用等完整生命周期管理
 *              支持最多存储 8 套不同的材质方案，供用户随时切换
 *
 * 主要功能：
 * 1. 保存当前材质方案到 localStorage
 * 2. 获取当前材质方案
 * 3. 将材质方案添加到方案列表
 * 4. 获取材质方案列表
 * 5. 获取渲染材质球所需的信息（颜色、位置、金属度等）
 * 6. 根据 ID 获取特定的材质方案
 */

import * as THREE from 'three'

const useMaterial = () => {
    /**
     * materialName: localStorage 中存储当前材质方案使用的键名
     * 用于保存用户最近一次使用的材质配置
     */
    const materialName = 'su7-material'

    /**
     * materialPlanListName: localStorage 中存储材质方案列表使用的键名
     * 用于保存用户保存过的所有材质方案（最多 8 套）
     */
    const materialPlanListName = 'su7-materials'

    /**
     * maxPlanCount: 最大可保存的材质方案数量
     * 当超过此数量时，新的方案会替换最早的方案
     */
    const maxPlanCount = 8

    /**
     * ballRenderType: 材质球渲染时匹配使用的材质类型名称
     * 用于从材质方案中筛选出适合在材质球上展示的参数
     * 例如：'Car_body.004' 表示车身材质
     */
    const ballRenderType = 'Car_body.004'

    /**
     * setMaterial: 保存材质方案到 localStorage
     *
     * @param {MaterialPlan} materialPlan - 材质方案对象
     *
     * 功能：将材质方案以 JSON 格式保存到浏览器 localStorage
     * 这样用户在刷新页面后，之前配置的材质不会丢失
     */
    const setMaterial = (materialPlan) => {
        window.localStorage.setItem(materialName, JSON.stringify(materialPlan))
    }

    /**
     * getMaterial: 从 localStorage 获取当前材质方案
     *
     * @returns {MaterialPlan} - 当前保存的材质方案对象
     *                          如果没有保存过，返回空对象 {}
     *
     * 功能：从浏览器 localStorage 读取之前保存的材质配置
     */
    const getMaterial = () => {
        return JSON.parse(window.localStorage.getItem(materialName)) || {}
    }

    /**
     * setMateiralList: 将材质方案添加到方案列表中
     *
     * @param {MaterialPlan} materialPlan - 要添加的材质方案对象
     *
     * 功能说明：
     * 1. 从 localStorage 获取现有的方案列表
     * 2. 如果列表为空，初始化版本信息并添加第一个方案
     * 3. 如果列表已满（达到 maxPlanCount），移除最早的方案
     * 4. 将新方案添加到列表末尾
     * 5. 保存更新后的列表到 localStorage
     *
     * 注意：最多保存 8 套方案，超出时采用 FIFO（先进先出）策略
     */
    const setMateiralList = (materialPlan) => {
        // 先从存储中获取材质方案列表
        const planList = getMateiralList()
        if (!planList.materials) {
            // 初始化版本信息
            const initVersion = {
                version: '1.0',  // 版本号，用于未来兼容升级
                materials: []     // 材质方案数组
            }

            // 如果有传入方案，添加到数组中
            materialPlan && initVersion.materials.push(materialPlan)
            window.localStorage.setItem(materialPlanListName, JSON.stringify(initVersion))
        } else {
            // 列表已存在，检查是否已满
            if (planList.materials.length >= maxPlanCount) {
                // 超过最大数量，移除最早的方案（数组头部）
                planList.materials.shift()
            }
            // 添加新方案到数组末尾
            materialPlan && planList.materials.push(materialPlan)
            window.localStorage.setItem(materialPlanListName, JSON.stringify(planList))
        }
    }

    /**
     * getMateiralList: 获取材质方案列表
     *
     * @returns {Object} - 包含版本号和材质方案数组的对象
     *                     格式：{ version: '1.0', materials: [...] }
     *                     如果没有数据，返回空对象 {}
     */
    const getMateiralList = () => {
        return JSON.parse(window.localStorage.getItem(materialPlanListName)) || {}
    }

    /**
     * getBallInfos: 获取渲染材质球所需的信息
     *
     * @returns {Array} - 材质球信息数组，每个元素包含：
     *                    - uniqId: 材质方案的唯一标识
     *                    - color: THREE.Color 颜色对象（用于渲染材质球）
     *                    - metalness: 金属度值
     *                    - position: THREE.Vector2 屏幕位置（用于定位材质球）
     *
     * 功能说明：
     * 1. 从 localStorage 获取材质方案列表
     * 2. 遍历每个方案，提取用于渲染材质球的数据
     * 3. 计算每个材质球在屏幕上的位置（沿屏幕宽度均匀分布）
     * 4. 只提取 ballRenderType 对应材质的数据用于材质球展示
     *
     * 材质球位置计算：
     * - deltX = window.innerWidth / maxPlanCount（每个位置宽度）
     * - deltY = window.innerHeight * 0.85（屏幕高度的 85% 处）
     * - 位置索引从 1 开始，所以实际位置是 deltX * (index + 1)
     */
    const getBallInfos = () => {
        const planList = getMateiralList()
        const ballInfos = []
        if (planList.materials) {
            // 计算材质球在屏幕上的位置增量
            const deltX = window.innerWidth / maxPlanCount
            const deltY = window.innerHeight * 0.85
            planList.materials.forEach((item, index) => {
                const { uniqId } = item
                const res = { uniqId }
                // 遍历方案中的所有材质，找到匹配的类型用于材质球渲染
                for (let key in item) {
                    if (item[key].typeName === ballRenderType) {
                        // 提取颜色（转为 THREE.Color 对象）
                        res.color = new THREE.Color(item[key].color)
                        // 提取金属度
                        res.metalness = item[key].metalness
                    }
                }
                // 计算屏幕位置
                res.position = new THREE.Vector2(deltX * (index + 1), deltY)

                ballInfos.push(res)
            })
        }
        return ballInfos
    }

    /**
     * getMaterialPlanById: 根据唯一 ID 获取材质方案
     *
     * @param {Number} uniqId - 材质方案的唯一标识符
     * @returns {MaterialPlan|null} - 找到的材质方案对象，如果没找到返回 null
     *
     * 功能：在材质方案列表中查找指定 ID 的方案
     * 用于当用户点击某个材质球时，获取该球对应的完整材质配置
     */
    const getMaterialPlanById = (uniqId) => {
        const planList = getMateiralList()
        if (!planList.materials) {
            return null
        } else {
            // 使用 Array.find 通过 uniqId 查找对应方案
            return planList.materials.find(item => item.uniqId === uniqId)
        }
    }

    /**
     * deleteMaterialPlan: 根据唯一 ID 删除材质方案
     *
     * @param {Number} uniqId - 材质方案的唯一标识符
     * @returns {Boolean} - 删除成功返回 true，没找到返回 false
     *
     * 功能：从 localStorage 的方案列表中删除指定 ID 的方案
     */
    const deleteMaterialPlan = (uniqId) => {
        const planList = getMateiralList()
        if (!planList.materials) {
            return false
        }
        const index = planList.materials.findIndex(item => item.uniqId === uniqId)
        if (index === -1) {
            return false
        }
        planList.materials.splice(index, 1)
        window.localStorage.setItem(materialPlanListName, JSON.stringify(planList))
        return true
    }

    /**
     * 返回值：暴露给组件使用的所有方法和常量
     */
    return {
        setMaterial,         // 保存当前材质方案
        getMaterial,        // 获取当前材质方案
        setMateiralList,    // 添加材质方案到列表
        getMateiralList,    // 获取材质方案列表
        getBallInfos,       // 获取材质球渲染信息
        getMaterialPlanById, // 根据 ID 获取材质方案
        deleteMaterialPlan // 删除材质方案
    }
}

/**
 * 默认导出 useMaterial hook
 * 组件中使用方式：const { 方法名 } = useMaterial()
 */
export default useMaterial
