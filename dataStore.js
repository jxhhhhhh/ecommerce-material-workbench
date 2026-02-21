// ==================== 数据存储管理器 ====================
// 所有数据持久化到 LocalStorage，实现真正的动态系统

const STORAGE_KEYS = {
    PRODUCTS: 'ecommerce_products',
    GENERATION_HISTORY: 'ecommerce_generation_history',
    TEMPLATES: 'ecommerce_templates',
    ANALYTICS: 'ecommerce_analytics',
    USER_STATS: 'ecommerce_user_stats',
    ACTIVITIES: 'ecommerce_activities'
};

// ==================== 商品管理 ====================
export const ProductStore = {
    // 获取所有商品
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    },

    // 根据ID获取商品
    getById(id) {
        const products = this.getAll();
        return products.find(p => p.id === id);
    },

    // 添加商品
    add(product) {
        const products = this.getAll();
        const newProduct = {
            ...product,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            generationCount: 0
        };
        products.push(newProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        ActivityStore.add('create_product', `添加商品：${newProduct.name}`);
        return newProduct;
    },

    // 更新商品
    update(id, updates) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            ActivityStore.add('update_product', `更新商品：${products[index].name}`);
            return products[index];
        }
        return null;
    },

    // 删除商品
    delete(id) {
        const products = this.getAll();
        const product = products.find(p => p.id === id);
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        if (product) {
            ActivityStore.add('delete_product', `删除商品：${product.name}`);
        }
        return true;
    },

    // 增加生成次数
    incrementGenerationCount(id) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index].generationCount = (products[index].generationCount || 0) + 1;
            products[index].updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        }
    },

    // 获取商品统计数据
    getStats() {
        const products = this.getAll();
        const categoryCount = {};
        products.forEach(p => {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });
        return {
            total: products.length,
            categoryCount,
            recentProducts: products.slice(-5).reverse()
        };
    }
};

// ==================== 生成历史管理 ====================
export const HistoryStore = {
    // 获取所有历史
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    // 添加生成记录
    add(record) {
        const history = this.getAll();
        const newRecord = {
            ...record,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            // 模拟效果数据（实际应用中可以从后端获取真实数据）
            performance: {
                views: Math.floor(Math.random() * 1000) + 100,
                clicks: Math.floor(Math.random() * 100) + 10,
                conversions: Math.floor(Math.random() * 20) + 1
            }
        };
        history.unshift(newRecord);
        // 只保留最近100条
        if (history.length > 100) {
            history.pop();
        }
        localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(history));
        
        // 更新统计数据
        UserStatsStore.incrementGenerationCount();
        ActivityStore.add('generate_copy', `生成文案：${record.productName}`);
        
        return newRecord;
    },

    // 删除历史记录
    delete(id) {
        const history = this.getAll();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(filtered));
        return true;
    },

    // 清空历史
    clear() {
        localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify([]));
        ActivityStore.add('clear_history', '清空生成历史');
        return true;
    },

    // 获取统计数据
    getStats() {
        const history = this.getAll();
        const today = new Date().toDateString();
        const todayCount = history.filter(h => new Date(h.createdAt).toDateString() === today).length;
        
        // 按类型统计
        const typeCount = {};
        history.forEach(h => {
            typeCount[h.type] = (typeCount[h.type] || 0) + 1;
        });

        return {
            total: history.length,
            todayCount,
            typeCount,
            recentHistory: history.slice(0, 10)
        };
    }
};

// ==================== 模板库管理 ====================
export const TemplateStore = {
    // 获取所有模板
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        return data ? JSON.parse(data) : this.getDefaultTemplates();
    },

    // 获取默认模板
    getDefaultTemplates() {
        return [
            {
                id: 'template_1',
                name: '爆款商品模板',
                category: '服装',
                description: '适合服装类商品的爆款文案风格',
                data: {
                    name: '显瘦连衣裙',
                    category: '服装',
                    material: '棉麻混纺',
                    color: '黑色',
                    features: '显瘦、透气、百搭'
                },
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'template_2',
                name: '美妆好物模板',
                category: '美妆',
                description: '适合美妆护肤类商品的推荐文案',
                data: {
                    name: '保湿精华液',
                    category: '美妆',
                    material: '玻尿酸配方',
                    color: '',
                    features: '深层补水、提亮肤色'
                },
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'template_3',
                name: '零食推荐模板',
                category: '食品',
                description: '适合食品零食类商品的种草文案',
                data: {
                    name: '网红薯片',
                    category: '食品',
                    material: '优质土豆',
                    color: '',
                    features: '酥脆爽口、多种口味'
                },
                isDefault: true,
                createdAt: new Date().toISOString()
            }
        ];
    },

    // 添加模板
    add(template) {
        const templates = this.getAll();
        const newTemplate = {
            ...template,
            id: `template_${Date.now()}`,
            isDefault: false,
            createdAt: new Date().toISOString()
        };
        templates.push(newTemplate);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        ActivityStore.add('save_template', `保存模板：${newTemplate.name}`);
        return newTemplate;
    },

    // 删除模板
    delete(id) {
        const templates = this.getAll();
        const template = templates.find(t => t.id === id);
        const filtered = templates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
        if (template) {
            ActivityStore.add('delete_template', `删除模板：${template.name}`);
        }
        return true;
    },

    // 根据ID获取模板
    getById(id) {
        const templates = this.getAll();
        return templates.find(t => t.id === id);
    }
};

// ==================== 用户统计管理 ====================
export const UserStatsStore = {
    // 获取统计数据
    get() {
        const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
        if (data) {
            return JSON.parse(data);
        }
        return this.getDefaultStats();
    },

    // 默认统计数据
    getDefaultStats() {
        return {
            totalGenerations: 0,
            totalProducts: 0,
            totalTemplates: 0,
            favoriteCategory: '',
            avgGenerationTime: 2.3,
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
    },

    // 更新统计
    update(updates) {
        const stats = this.get();
        const newStats = { ...stats, ...updates, lastActive: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(newStats));
        return newStats;
    },

    // 增加生成次数
    incrementGenerationCount() {
        const stats = this.get();
        stats.totalGenerations += 1;
        stats.lastActive = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
        return stats;
    },

    // 获取动态统计数据（用于首页展示）
    getDynamicStats() {
        const stats = this.get();
        const products = ProductStore.getAll();
        const templates = TemplateStore.getAll();
        const history = HistoryStore.getAll();
        
        // 计算今日生成数
        const today = new Date().toDateString();
        const todayGenerations = history.filter(h => 
            new Date(h.createdAt).toDateString() === today
        ).length;

        // 计算收藏模板数（非默认模板）
        const savedTemplates = templates.filter(t => !t.isDefault).length;

        return {
            totalGenerations: stats.totalGenerations || history.length,
            todayGenerations,
            totalProducts: products.length,
            savedTemplates,
            avgGenerationTime: stats.avgGenerationTime || 2.3
        };
    }
};

// ==================== 活动记录管理 ====================
export const ActivityStore = {
    // 获取所有活动
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        return data ? JSON.parse(data) : [];
    },

    // 添加活动记录
    add(type, description) {
        const activities = this.getAll();
        const activity = {
            id: Date.now().toString(),
            type,
            description,
            createdAt: new Date().toISOString()
        };
        activities.unshift(activity);
        // 只保留最近20条
        if (activities.length > 20) {
            activities.pop();
        }
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
        return activity;
    },

    // 获取最近活动
    getRecent(count = 5) {
        const activities = this.getAll();
        return activities.slice(0, count);
    },

    // 清空活动记录
    clear() {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    }
};

// ==================== 数据分析 ====================
export const AnalyticsStore = {
    // 获取分析数据
    getDashboardData() {
        const products = ProductStore.getAll();
        const history = HistoryStore.getAll();
        const stats = UserStatsStore.getDynamicStats();
        const activities = ActivityStore.getRecent(5);

        // 计算品类分布
        const categoryDistribution = {};
        products.forEach(p => {
            categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
        });

        // 计算最近7天的生成趋势
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const count = history.filter(h => 
                new Date(h.createdAt).toDateString() === dateStr
            ).length;
            last7Days.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                count
            });
        }

        // 计算热门关键词（从生成历史中）
        const keywordCount = {};
        history.forEach(h => {
            if (h.keywords) {
                h.keywords.forEach(k => {
                    keywordCount[k] = (keywordCount[k] || 0) + 1;
                });
            }
        });
        const hotKeywords = Object.entries(keywordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        return {
            stats,
            totalProducts: products.length,
            totalHistory: history.length,
            categoryDistribution,
            generationTrend: last7Days,
            hotKeywords,
            recentActivities: activities,
            recentProducts: products.slice(-5).reverse()
        };
    }
};

// ==================== 数据导出 ====================
export const ExportStore = {
    // 导出商品数据为Excel
    exportProductsToExcel() {
        const products = ProductStore.getAll();
        const data = products.map(p => ({
            '商品名称': p.name,
            '商品类目': p.category,
            '材质': p.material,
            '颜色': p.color,
            '商品卖点': p.features,
            '生成次数': p.generationCount,
            '创建时间': new Date(p.createdAt).toLocaleString(),
            '更新时间': new Date(p.updatedAt).toLocaleString()
        }));
        return data;
    },

    // 导出历史记录为Excel
    exportHistoryToExcel() {
        const history = HistoryStore.getAll();
        const data = history.map(h => ({
            '商品名称': h.productName,
            '生成类型': h.type,
            '生成标题': h.title,
            '生成文案': h.copy,
            '关键词': h.keywords ? h.keywords.join(', ') : '',
            '生成时间': new Date(h.createdAt).toLocaleString()
        }));
        return data;
    },

    // 导入商品数据
    importProductsFromExcel(data) {
        const imported = [];
        data.forEach(row => {
            if (row['商品名称'] && row['商品类目']) {
                const product = ProductStore.add({
                    name: row['商品名称'],
                    category: row['商品类目'],
                    material: row['材质'] || '',
                    color: row['颜色'] || '',
                    features: row['商品卖点'] || ''
                });
                imported.push(product);
            }
        });
        return imported;
    }
};

// ==================== 初始化数据 ====================
export const initializeData = () => {
    // 检查是否首次使用
    const hasData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!hasData) {
        // 添加示例商品
        ProductStore.add({
            name: '冬季羽绒服',
            category: '服装',
            material: '白鸭绒',
            color: '黑色',
            features: '保暖、轻薄、防风'
        });
        ProductStore.add({
            name: '保湿面霜',
            category: '美妆',
            material: '玻尿酸',
            color: '',
            features: '深层补水、锁水保湿'
        });
        ProductStore.add({
            name: '运动跑鞋',
            category: '鞋靴',
            material: '网面',
            color: '白色',
            features: '透气、减震、轻便'
        });

        // 初始化模板
        TemplateStore.getAll();

        console.log('数据初始化完成');
    }
};

// 默认导出
export default {
    ProductStore,
    HistoryStore,
    TemplateStore,
    UserStatsStore,
    ActivityStore,
    AnalyticsStore,
    ExportStore,
    initializeData
};
