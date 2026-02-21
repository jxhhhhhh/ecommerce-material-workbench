// ==================== 历史记录管理模块 ====================

const HISTORY_KEY = 'douyin_copy_history';
const MAX_HISTORY_ITEMS = 50; // 最多保存50条记录

/**
 * 获取所有历史记录
 * @returns {Array} 历史记录数组
 */
const getHistory = () => {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('读取历史记录失败:', error);
        return [];
    }
};

/**
 * 保存历史记录
 * @param {Array} history 历史记录数组
 */
const saveHistory = (history) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
};

/**
 * 添加新的历史记录
 * @param {Object} item 历史记录项
 * @param {string} item.id 唯一ID
 * @param {string} item.type 类型：'copy' | 'tiktok' | 'poster'
 * @param {string} item.title 标题
 * @param {string} item.content 内容
 * @param {Object} item.productInfo 商品信息
 * @param {string} item.timestamp 时间戳
 * @param {string} item.image 图片URL（可选）
 */
const addHistoryItem = (item) => {
    const history = getHistory();
    
    // 新记录添加到开头
    const newItem = {
        ...item,
        id: item.id || Date.now().toString(),
        timestamp: item.timestamp || new Date().toISOString(),
    };
    
    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    saveHistory(newHistory);
    
    return newItem;
};

/**
 * 删除单条历史记录
 * @param {string} id 记录ID
 */
const deleteHistoryItem = (id) => {
    const history = getHistory();
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
};

/**
 * 清空所有历史记录
 */
const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

/**
 * 根据ID获取单条记录
 * @param {string} id 记录ID
 * @returns {Object|null} 历史记录项
 */
const getHistoryItemById = (id) => {
    const history = getHistory();
    return history.find(item => item.id === id) || null;
};

/**
 * 搜索历史记录
 * @param {string} keyword 关键词
 * @returns {Array} 匹配的历史记录
 */
const searchHistory = (keyword) => {
    const history = getHistory();
    if (!keyword.trim()) return history;
    
    const lowerKeyword = keyword.toLowerCase();
    return history.filter(item => {
        const titleMatch = item.title && item.title.toLowerCase().includes(lowerKeyword);
        const contentMatch = item.content && item.content.toLowerCase().includes(lowerKeyword);
        const productMatch = item.productInfo && (
            (item.productInfo.name && item.productInfo.name.toLowerCase().includes(lowerKeyword)) ||
            (item.productInfo.category && item.productInfo.category.toLowerCase().includes(lowerKeyword))
        );
        return titleMatch || contentMatch || productMatch;
    });
};

/**
 * 按类型筛选历史记录
 * @param {string} type 类型：'copy' | 'tiktok' | 'poster' | 'all'
 * @returns {Array} 筛选后的历史记录
 */
const filterHistoryByType = (type) => {
    const history = getHistory();
    if (type === 'all' || !type) return history;
    return history.filter(item => item.type === type);
};

/**
 * 格式化时间显示
 * @param {string} timestamp ISO时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }
    // 小于24小时
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 小于7天
    if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`;
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 导出API
const HistoryManager = {
    getHistory,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    getHistoryItemById,
    searchHistory,
    filterHistoryByType,
    formatTime,
};

// 兼容CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
