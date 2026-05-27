/**
 * @Description: types 类型定义文件
 *              为 JavaScript 代码提供 TypeScript 类型支持
 *              定义项目中使用的核心数据结构的接口
 */

/**
 * MaterialParam: 材质参数配置接口
 *
 * 描述单个材质部件（如车身材质、车窗材质等）的参数配置
 *
 * 属性说明：
 * - color: 十六进制颜色字符串，如 '#ff9ecf'
 * - metalness: 金属度，范围 0-1
 * - roughness: 粗糙度，范围 0-1
 * - [key: string]: 允许添加其他任意属性（字符串或数字类型）
 */
export interface MaterialParam {
    /** 材质的基础颜色（十六进制格式） */
    color: string;

    /** 金属度，0 表示非金属（如塑料），1 表示纯金属 */
    metalness: number;

    /** 粗糙度，0 表示完全光滑有反射，1 表示完全粗糙无反射 */
    roughness: number;

    /** 允许添加其他自定义参数（如 opacity 透明度等） */
    [key: string]: string | number;
}

/**
 * MaterialPlan: 材质方案配置对象接口
 *
 * 描述一整套材质配置方案，包含多个部件的材质参数
 * 每个材质方案有唯一的 ID，用于标识和检索
 *
 * 属性说明：
 * - uniqId: 材质方案的唯一标识符（数字类型）
 * - [folderName: string]: 以文件夹名称为键的属性，值为 MaterialParam 或 uniqId
 *
 * 结构示例：
 * {
 *   uniqId: 1,
 *   '车身材质': { color: '#ff9ecf', metalness: 0.9, roughness: 0.1 },
 *   '车窗材质': { color: '#88ccff', metalness: 0.1, roughness: 0.05 },
 *   ...
 * }
 */
export interface MaterialPlan {
    /** 材质方案的唯一标识 */
    uniqId: number;

    /**
     * 材质部件配置
     * 键为文件夹/部件名称，值为材质参数对象
     * 也可能是数字类型（继承自 MaterialParam 的索引签名）
     */
    [folderName: string]: MaterialParam | number;
}
