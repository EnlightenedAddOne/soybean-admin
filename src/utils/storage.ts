import { createLocalforage, createStorage } from '@sa/utils';

/** 存储前缀配置 从环境变量中获取存储前缀，如果未设置则使用空字符串 用于区分不同项目的存储空间 */
const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || '';

/** localStorage存储实例 用于持久化存储数据，数据会一直保存在浏览器中，除非手动清除 使用泛型类型StorageType.Local限制存储的数据类型 */
export const localStg = createStorage<StorageType.Local>('local', storagePrefix);

/** sessionStorage存储实例 用于临时存储数据，数据在会话结束（关闭浏览器）后自动清除 使用泛型类型StorageType.Session限制存储的数据类型 */
export const sessionStg = createStorage<StorageType.Session>('session', storagePrefix);

/** localforage存储实例 基于IndexedDB的存储方案，支持存储大容量数据 提供异步API，适合存储较大的数据结构 使用泛型类型StorageType.Local限制存储的数据类型 */
export const localforage = createLocalforage<StorageType.Local>('local');
