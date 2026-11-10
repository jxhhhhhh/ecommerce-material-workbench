const { useState, useRef, useEffect } = React;

// ==================== API Key 读取 ====================
// 密钥不要写进源码，请在 config.js 中设置 window.__APP_CONFIG__.DEEPSEEK_KEY
const getApiKey = () => (window.__APP_CONFIG__ && window.__APP_CONFIG__.DEEPSEEK_KEY) || '';

// 清除旧版本LocalStorage中的外部图片URL（兼容旧数据）
const cleanOldImageUrls = () => {
    try {
        const keys = ['ecommerce_history', 'ecommerce_products', 'ecommerce_templates'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                let parsed = JSON.parse(data);
                let modified = false;
                
                const cleanImageUrl = (url) => {
                    if (!url) return url;
                    // 如果是外部图片URL，替换为空
                    if (url.includes('unsplash') || url.includes('pexels') || url.includes('picsum')) {
                        return '';
                    }
                    return url;
                };
                
                if (Array.isArray(parsed)) {
                    parsed = parsed.map(item => {
                        if (item.productInfo && item.productInfo.image) {
                            const newImage = cleanImageUrl(item.productInfo.image);
                            if (newImage !== item.productInfo.image) {
                                item.productInfo.image = newImage;
                                modified = true;
                            }
                        }
                        if (item.image) {
                            const newImage = cleanImageUrl(item.image);
                            if (newImage !== item.image) {
                                item.image = newImage;
                                modified = true;
                            }
                        }
                        return item;
                    });
                }
                
                if (modified) {
                    localStorage.setItem(key, JSON.stringify(parsed));
                    console.log(`已清理 ${key} 中的旧图片URL`);
                }
            }
        });
    } catch (e) {
        console.error('清理旧图片URL失败:', e);
    }
};

// 应用启动时执行清理
cleanOldImageUrls();

// ==================== 错误边界组件 ====================
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#fef2f2',
                    borderRadius: '12px',
                    margin: '20px'
                }}>
                    <i className="fas fa-exclamation-triangle" style={{
                        fontSize: '48px',
                        color: '#ef4444',
                        marginBottom: '16px'
                    }}></i>
                    <h2 style={{ color: '#991b1b', marginBottom: '12px' }}>
                        页面出现错误
                    </h2>
                    <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>
                        请刷新页面重试，或联系管理员
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 24px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        <i className="fas fa-redo"></i> 刷新页面
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: '#fee2e2',
                            borderRadius: '8px',
                            textAlign: 'left'
                        }}>
                            <summary style={{ cursor: 'pointer', color: '#991b1b' }}>
                                错误详情（开发模式）
                            </summary>
                            <pre style={{
                                marginTop: '12px',
                                fontSize: '12px',
                                overflow: 'auto',
                                color: '#7f1d1d'
                            }}>
                                {this.state.error.toString()}\n{this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

// ==================== 全局工具函数 ====================

// Toast 提示 Hook
const useToast = () => {
    const [toast, setToast] = useState(null);
    
    const showToast = (message, type = 'error', duration = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    };
    
    const ToastComponent = () => {
        if (!toast) return null;
        return (
            <div className={`${toast.type}-toast show`}>
                <i className={`fas fa-${toast.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
                <span>{toast.message}</span>
            </div>
        );
    };
    
    return { showToast, ToastComponent };
};

// 全局Loading组件（带进度条）
const GlobalLoading = ({ message = '加载中...', progress = null }) => (
    <div className="loading-overlay">
        <div className="loading-spinner-large"></div>
        <div className="loading-text">
            {message}
            <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </span>
        </div>
        {progress !== null && (
            <div style={{
                width: '200px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                marginTop: '16px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: '#4f46e5',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>
        )}
        {progress !== null && (
            <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)'
            }}>
                {Math.round(progress)}%
            </div>
        )}
    </div>
);

// 进度Hook
const useProgress = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const startProgress = (initialMessage = '加载中...') => {
        setProgress(0);
        setMessage(initialMessage);
        setIsLoading(true);
    };

    const updateProgress = (value, msg) => {
        setProgress(Math.min(100, Math.max(0, value)));
        if (msg) setMessage(msg);
    };

    const incrementProgress = (increment, msg) => {
        setProgress(prev => Math.min(100, prev + increment));
        if (msg) setMessage(msg);
    };

    const endProgress = () => {
        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
        }, 300);
    };

    return {
        progress,
        message,
        isLoading,
        startProgress,
        updateProgress,
        incrementProgress,
        endProgress,
        ProgressComponent: () => isLoading ? <GlobalLoading message={message} progress={progress} /> : null
    };
};

// ==================== 类目兜底值配置 ====================
const categoryDefaults = {
    '服装': { name: '时尚单品', material: '优质面料', feature: '显瘦百搭' },
    '鞋靴': { name: '舒适鞋款', material: '透气材质', feature: '软底舒适' },
    '箱包': { name: '实用包包', material: '耐用材质', feature: '大容量' },
    '美妆': { name: '美妆好物', material: '温和配方', feature: '显白持妆' },
    '食品': { name: '美味零食', material: '天然原料', feature: '健康美味' },
    '家居': { name: '家居好物', material: '环保材质', feature: '实用高颜值' },
    '数码': { name: '数码神器', material: '优质材料', feature: '高效便携' },
    '母婴': { name: '母婴好物', material: '安全材质', feature: '温和无刺激' },
};

// ==================== 按类目定制的AI文案生成器 ====================
const categoryConfigs = {
    '服装': {
        trendKeywords: ['百搭', '显瘦', '显白', '时髦', '气质', 'OOTD', '穿搭'],
        titlePatterns: [
            (color, name, material, feature) => color ? `${color}${name}｜${material} ${feature || '显瘦显白'}神器` : `${name}｜${material} ${feature || '显瘦显白'}神器`,
            (color, name, material, feature) => color ? `被问爆的${color}${name}！${material} ${feature || '上身绝绝子'}` : `被问爆的${name}！${material} ${feature || '上身绝绝子'}`,
            (color, name, material, feature) => color ? `服装控必入✨ ${color}${name} ${material}太高级` : `服装控必入✨ ${name} ${material}太高级`,
            (color, name, material, feature) => color ? `显瘦10斤！${color}${name} ${material} ${feature || '舒适又时髦'}` : `显瘦10斤！${name} ${material} ${feature || '舒适又时髦'}`,
            (color, name, material, feature) => color ? `早春OOTD🌸 ${color}${name} ${material} ${feature || '温柔感拉满'}` : `早春OOTD🌸 ${name} ${material} ${feature || '温柔感拉满'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这件${name}真的是衣橱必备！${material}亲肤透气，版型设计显瘦又显高。${feature ? feature + '，' : ''}随便搭都好看，通勤约会都能穿。`,
            (name, category, material, feature) => `挖到宝了！${material}的${name}，触感柔软舒适。版型修饰身材，${feature || '上身效果超赞'}，闺蜜都问我要链接～`,
            (name, category, material, feature) => `质感绝了！严选${material}，${name}的设计很有小心机。${feature || '显瘦又百搭'}，洗了好几次都不变形，性价比超高！`,
        ],
    },
    '鞋靴': {
        trendKeywords: ['舒适', '增高', '百搭', '透气', '软底', '不累脚', '爆款'],
        titlePatterns: [
            (color, name, material, feature) => color ? `暴走不累！${color}${name} ${material} ${feature || '软底舒适'}` : `暴走不累！${name} ${material} ${feature || '软底舒适'}`,
            (color, name, material, feature) => color ? `增高5cm✨ ${color}${name} ${material} ${feature || '透气不闷脚'}` : `增高5cm✨ ${name} ${material} ${feature || '透气不闷脚'}`,
            (color, name, material, feature) => color ? `鞋靴控必入｜${color}${name} ${material} ${feature || '踩屎感满满'}` : `鞋靴控必入｜${name} ${material} ${feature || '踩屎感满满'}`,
            (color, name, material, feature) => color ? `月销2000+的${color}${name}！${material} ${feature || '好评如潮'}` : `月销2000+的${name}！${material} ${feature || '好评如潮'}`,
            (color, name, material, feature) => color ? `通勤神器👟 ${color}${name} ${material} ${feature || '一天不累'}` : `通勤神器👟 ${name} ${material} ${feature || '一天不累'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这双${name}太舒服了！${material}透气不闷脚，软底设计走一天都不累。${feature || '增高又显瘦'}，通勤逛街都能穿。`,
            (name, category, material, feature) => `终于找到好穿的鞋了！${material}柔软贴合，${name}的版型很正。${feature || '防滑耐磨'}，性价比真的高，闭眼入！`,
            (name, category, material, feature) => `回购三次的${name}！${material}越穿越舒服，设计时尚百搭。${feature || '脚感超棒'}，搭配裙子裤子都好看～`,
        ],
    },
    '箱包': {
        trendKeywords: ['大容量', '百搭', '轻便', '耐用', '通勤', '出游', '质感'],
        titlePatterns: [
            (color, name, material, feature) => color ? `能装下全世界！${color}${name} ${material} ${feature || '大容量'}` : `能装下全世界！${name} ${material} ${feature || '大容量'}`,
            (color, name, material, feature) => color ? `通勤必备✨ ${color}${name} ${material} ${feature || '轻便耐用'}` : `通勤必备✨ ${name} ${material} ${feature || '轻便耐用'}`,
            (color, name, material, feature) => color ? `出游神器｜${color}${name} ${material} ${feature || '百搭能装'}` : `出游神器｜${name} ${material} ${feature || '百搭能装'}`,
            (color, name, material, feature) => color ? `高级感${color}${name}！${material} ${feature || '质感满分'}` : `高级感${name}！${material} ${feature || '质感满分'}`,
            (color, name, material, feature) => color ? `学生党上班族都爱💼 ${color}${name} ${material}` : `学生党上班族都爱💼 ${name} ${material}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}容量超大！${material}轻便又耐用，设计简约大气。${feature || '隔层合理'}，电脑书本都能装，通勤出游都合适。`,
            (name, category, material, feature) => `质感超棒的${name}！${material}手感细腻，版型挺括有型。${feature || '五金精致'}，背出去很有面子，同事都问链接～`,
            (name, category, material, feature) => `用了半年还像新的！${material}的${name}真的很耐用，设计实用又好看。${feature || '容量惊人'}，日常通勤完全够用！`,
        ],
    },
    '美妆': {
        trendKeywords: ['显白', '持妆', '保湿', '温和', '养肤', '素颜', '必备'],
        titlePatterns: [
            (color, name, material, feature) => color ? `黄皮亲妈！${color}${name} ${material} ${feature || '显白持妆'}` : `黄皮亲妈！${name} ${material} ${feature || '显白持妆'}`,
            (color, name, material, feature) => color ? `伪素颜神器✨ ${color}${name} ${material} ${feature || '自然好皮'}` : `伪素颜神器✨ ${name} ${material} ${feature || '自然好皮'}`,
            (color, name, material, feature) => color ? `干皮救星｜${color}${name} ${material} ${feature || '保湿养肤'}` : `干皮救星｜${name} ${material} ${feature || '保湿养肤'}`,
            (color, name, material, feature) => color ? `美妆控必入！${color}${name} ${material} ${feature || '好评如潮'}` : `美妆控必入！${name} ${material} ${feature || '好评如潮'}`,
            (color, name, material, feature) => color ? `平价好用💄 ${color}${name} ${material} 学生党爱` : `平价好用💄 ${name} ${material} 学生党爱`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这款${name}真的绝了！${material}轻薄不闷痘，效果自然又持久。${feature || '显白不挑皮'}，素颜涂也超好看，日常通勤必备。`,
            (name, category, material, feature) => `被种草后无限回购！${material}温和不刺激，${name}的效果很明显。${feature || '保湿不拔干'}，敏感肌也能用，性价比超高～`,
            (name, category, material, feature) => `终于找到本命美妆了！${material}丝滑好推开，${name}持妆一整天不脱妆。${feature || '养肤不暗沉'}，越夜越美丽，姐妹们快冲！`,
        ],
    },
    '食品': {
        trendKeywords: ['健康', '美味', '低脂', '营养', '解馋', '追剧', '办公室'],
        // 食品类不使用颜色参数
        titlePatterns: [
            (name, material, feature) => `好吃不胖！${name} ${material} ${feature || '健康美味'}`,
            (name, material, feature) => `办公室解馋✨ ${name} ${material} ${feature || '停不下来'}`,
            (name, material, feature) => `追剧必备｜${name} ${material} ${feature || '越嚼越香'}`,
            (name, material, feature) => `配料干净！${name} ${material} ${feature || '吃得放心'}`,
            (name, material, feature) => `回购10次🍿 ${name} ${material} 全家爱吃`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}太好吃了！${material}保留原味，口感${feature || '酥脆爽口'}。配料表干净，吃着放心，追剧办公来一包超满足。`,
            (name, category, material, feature) => `挖到宝藏零食！${material}品质很好，${name}的味道很正。${feature || '低脂健康'}，解馋不怕胖，已经回购好几次了～`,
            (name, category, material, feature) => `全家都爱吃的${name}！${material}制作，风味浓郁。${feature || '营养丰富'}，老少皆宜，囤了一大箱慢慢吃！`,
        ],
    },
    '家居': {
        trendKeywords: ['实用', '高颜值', '收纳', '舒适', '品质', '温馨', '必备'],
        titlePatterns: [
            (color, name, material, feature) => color ? `提升幸福感！${color}${name} ${material} ${feature || '高颜值'}` : `提升幸福感！${name} ${material} ${feature || '高颜值'}`,
            (color, name, material, feature) => color ? `收纳神器✨ ${color}${name} ${material} ${feature || '实用省空间'}` : `收纳神器✨ ${name} ${material} ${feature || '实用省空间'}`,
            (color, name, material, feature) => color ? `温馨小家｜${color}${name} ${material} ${feature || '品质生活'}` : `温馨小家｜${name} ${material} ${feature || '品质生活'}`,
            (color, name, material, feature) => `懒人福音！${color}${name} ${material}材质 ${feature || '方便好用'}`,
            (color, name, material, feature) => `ins风🏠 ${color}${name} ${material}制作 ${feature || '拍照超美'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}真的买对了！${material}材质质感很好，设计实用又好看。${feature || '收纳方便'}，放在家里瞬间提升颜值，朋友来家里都问链接。`,
            (name, category, material, feature) => `家居好物分享！${material}制作的${name}，功能很贴心。${feature || '结实耐用'}，细节处理到位，用起来很顺手，性价比超高～`,
            (name, category, material, feature) => `打造温馨小窝必备！${material}材质的${name}，风格很百搭。${feature || '环保无异味'}，安装简单，独居女孩也能轻松搞定！`,
        ],
    },
    '数码': {
        trendKeywords: ['实用', '高效', '便携', '耐用', '科技感', '办公', '必备'],
        titlePatterns: [
            (color, name, material, feature) => `效率翻倍！${color}${name} ${material}材质 ${feature || '办公神器'}`,
            (color, name, material, feature) => `便携好用✨ ${color}${name} ${material}制作 ${feature || '出差必备'}`,
            (color, name, material, feature) => `科技感｜${color}${name} ${material}质感 ${feature || '颜值在线'}`,
            (color, name, material, feature) => `耐用之选！${color}${name} ${material}材质 ${feature || '品质保证'}`,
            (color, name, material, feature) => `桌面好物💻 ${color}${name} ${material}制作 ${feature || '提升格调'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}办公用太合适了！${material}材质质感高级，设计人性化。${feature || '功能齐全'}，用了一段时间效率提升不少，同事都问哪里买的。`,
            (name, category, material, feature) => `数码控必入好物！${material}制作的${name}，性能很稳定。${feature || '便携易携带'}，出差旅行都带着，质量可靠不踩雷～`,
            (name, category, material, feature) => `桌面颜值担当！${material}材质的${name}，外观简约大气。${feature || '散热良好'}，细节做工精致，放在桌上很有科技感！`,
        ],
    },
    '母婴': {
        trendKeywords: ['安全', '温和', '舒适', '实用', '宝妈', '宝宝', '必备'],
        titlePatterns: [
            (color, name, material, feature) => `宝妈必囤！${color}${name} ${material}材质 ${feature || '安全温和'}`,
            (color, name, material, feature) => `宝宝超爱✨ ${color}${name} ${material}制作 ${feature || '舒适好用'}`,
            (color, name, material, feature) => `安心之选｜${color}${name} ${material}配方 ${feature || '无刺激'}`,
            (color, name, material, feature) => `育儿神器！${color}${name} ${material}材质 ${feature || '省心省力'}`,
            (color, name, material, feature) => `口碑爆款👶 ${color}${name} ${material}制作 ${feature || '好评如潮'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `给宝宝用的${name}很放心！${material}材质安全无刺激，设计很贴心。${feature || '柔软舒适'}，宝宝用着开心，妈妈更安心。`,
            (name, category, material, feature) => `二胎妈妈强推！${material}制作的${name}，品质有保障。${feature || '易清洗好打理'}，用了几个月还很新，性价比超高～`,
            (name, category, material, feature) => `待产包必备好物！${material}材质的${name}，功能很实用。${feature || '细节设计周到'}，新手妈妈也能轻松上手，值得入手！`,
        ],
    },
};

// 参数兜底处理函数
const sanitizeParam = (param, defaultValue = '') => {
    if (param === undefined || param === null || param === 'undefined' || param === 'null') {
        return defaultValue;
    }
    return String(param).trim();
};

// 扩展的颜色美化映射表
const colorBeautify = {
    // 基础颜色
    '黑': '经典黑', '黑色': '经典黑', '墨黑': '经典黑', '深黑': '经典黑',
    '白': '纯净白', '白色': '纯净白', '象牙白': '象牙白', '奶白': '奶白',
    '红': '复古红', '红色': '复古红', '酒红': '酒红', '粉红': '粉红',
    '蓝': '深海蓝', '蓝色': '深海蓝', '藏蓝': '藏蓝', '天蓝': '天蓝',
    '绿': '清新绿', '绿色': '清新绿', '薄荷绿': '薄荷绿', '墨绿': '墨绿',
    '黄': '温暖黄', '黄色': '温暖黄', '米黄': '米黄', '鹅黄': '鹅黄',
    '灰': '高级灰', '灰色': '高级灰', '深空灰': '深空灰', '银灰': '银灰',
    '棕': '大地棕', '棕色': '大地棕', '驼色': '驼色', '焦糖色': '焦糖色',
    '粉': '温柔粉', '粉色': '温柔粉', '樱花粉': '樱花粉', '桃粉': '桃粉',
    '紫': '优雅紫', '紫色': '优雅紫', '深紫': '深紫', '淡紫': '淡紫',
    '橙': '活力橙', '橙色': '活力橙', '橘色': '橘色',
};

// 智能美化颜色
const beautifyColor = (color) => {
    if (!color || !color.trim()) return '';
    
    // 直接匹配
    if (colorBeautify[color]) {
        return colorBeautify[color];
    }
    
    // 包含匹配（如 "深空灰色" 匹配 "深空灰"）
    for (const [key, value] of Object.entries(colorBeautify)) {
        if (color.includes(key)) {
            return value;
        }
    }
    
    // 无匹配时返回原值
    return color;
};

// 过滤无意义的关键词
const meaninglessKeywords = ['优质', '商品', '产品', '东西', '好的'];
const isMeaningfulKeyword = (keyword) => {
    if (!keyword || keyword.length < 2) return false;
    return !meaninglessKeywords.includes(keyword);
};

const generateCopy = (productInfo) => {
    // 参数兜底处理 - 使用类目特定的兜底值
    let { name, category, material, color, features } = productInfo || {};
    
    category = sanitizeParam(category, '服装');
    
    // 获取类目兜底值
    const defaults = categoryDefaults[category] || categoryDefaults['服装'];
    
    name = sanitizeParam(name, defaults.name);
    material = sanitizeParam(material, defaults.material);
    color = sanitizeParam(color, '');
    features = sanitizeParam(features, '');
    
    const featureList = features ? features.split(/[,，、]/).filter(f => f.trim()) : [];
    const mainFeature = featureList[0] || defaults.feature;

    // 颜色美化
    const beautifiedColor = beautifyColor(color);

    // 获取类目配置，如果没有则使用默认
    const config = categoryConfigs[category] || categoryConfigs['服装'];

    // 安全获取随机模板
    const getRandomPattern = (patterns) => {
        if (!patterns || patterns.length === 0) {
            return () => `${name}｜${material} 品质优选`;
        }
        return patterns[Math.floor(Math.random() * patterns.length)];
    };

    // 生成标题 - 食品类不使用颜色参数
    const titlePattern = getRandomPattern(config.titlePatterns);
    let title;
    if (category === '食品') {
        // 食品类模板只需要3个参数
        title = titlePattern(name, material, mainFeature);
    } else {
        title = titlePattern(beautifiedColor, name, material, mainFeature);
    }

    // 生成卖点文案
    const sellingPointPattern = getRandomPattern(config.sellingPoints);
    const sellingPoint = sellingPointPattern(name, category, material, mainFeature);

    // 生成关键词 - 过滤无意义词汇
    const baseKeywords = [category, material]
        .filter(k => k && k.trim() && isMeaningfulKeyword(k));
    
    if (color && color.trim() && color.length >= 2) {
        baseKeywords.push(color);
    }
    if (mainFeature && mainFeature.trim() && isMeaningfulKeyword(mainFeature)) {
        baseKeywords.push(mainFeature);
    }
    
    const trendKeywords = config.trendKeywords || ['品质', '优选'];
    
    // 智能选择趋势关键词 - 避免与基础关键词重复
    const selectedTrend = [];
    const shuffled = [...trendKeywords].sort(() => 0.5 - Math.random());
    
    for (const trend of shuffled) {
        if (selectedTrend.length >= 3) break;
        // 检查是否与基础关键词语义重复
        const isDuplicate = baseKeywords.some(base => 
            base.includes(trend) || trend.includes(base) || base === trend
        );
        if (!isDuplicate) {
            selectedTrend.push(trend);
        }
    }
    
    // 合并关键词
    const keywords = [...baseKeywords, ...selectedTrend];

    return { 
        title, 
        sellingPoint, 
        keywords: [...new Set(keywords)].filter(k => k && k.trim() && k.length >= 2) 
    };
};

// 特征标签后缀配置 - 按类目定制
const featureSuffixConfig = {
    '服装': {
        suffixes: ['版型', '剪裁', '面料', '工艺'],
        defaultTags: ['显瘦版型', '舒适亲肤', '时尚百搭', '品质优选']
    },
    '鞋靴': {
        suffixes: ['鞋底', '鞋面', '内里', '工艺'],
        defaultTags: ['软底舒适', '透气不闷', '防滑耐磨', '增高显瘦']
    },
    '箱包': {
        suffixes: ['材质', '五金', '设计', '容量'],
        defaultTags: ['大容量', '轻便耐用', '质感五金', '多层收纳']
    },
    '美妆': {
        suffixes: ['质地', '效果', '配方', '妆感'],
        defaultTags: ['显白持妆', '温和养肤', '平价好用', '口碑爆款']
    },
    '食品': {
        suffixes: [''], // 食品类不添加后缀
        defaultTags: ['健康美味', '配料干净', '解馋必备', '全家爱吃']
    },
    '家居': {
        suffixes: ['材质', '设计', '工艺', '功能'],
        defaultTags: ['高颜值', '实用省空间', '品质生活', '温馨家居']
    },
    '数码': {
        suffixes: ['功能', '性能', '技术', '体验'],
        defaultTags: ['办公神器', '便携耐用', '科技感', '效率提升']
    },
    '母婴': {
        suffixes: ['材质', '设计', '工艺', '配方'],
        defaultTags: ['安全温和', '宝妈推荐', '宝宝喜爱', '省心省力']
    },
};

const generateSellingTag = (category, material, features) => {
    // 参数兜底
    category = sanitizeParam(category, '通用');
    material = sanitizeParam(material, '');
    features = sanitizeParam(features, '');
    
    const featureList = features ? features.split(/[,，、]/).filter(f => f.trim()) : [];
    
    // 获取类目配置
    const config = featureSuffixConfig[category] || {
        suffixes: ['设计'],
        defaultTags: ['品质优选', '限时特惠', '好评如潮']
    };

    // 构建特征标签
    let featureTag = null;
    if (featureList[0]) {
        const feature = featureList[0];
        // 智能选择后缀：根据特征词匹配最合适的后缀
        const suffix = selectBestSuffix(feature, category, config.suffixes);
        featureTag = suffix ? feature + suffix : feature;
    }

    const allTags = featureTag ? [featureTag, ...config.defaultTags] : config.defaultTags;
    
    // 安全获取随机标签
    if (!allTags || allTags.length === 0) {
        return '品质优选';
    }
    return allTags[Math.floor(Math.random() * allTags.length)];
};

// 智能选择最合适的后缀
const selectBestSuffix = (feature, category, suffixes) => {
    if (!suffixes || suffixes.length === 0 || suffixes[0] === '') {
        return ''; // 食品类等不需要后缀
    }
    
    // 特征词与后缀的匹配规则
    const featureSuffixRules = {
        '服装': {
            '显瘦': '版型', '修身': '版型', '宽松': '版型',
            '透气': '面料', '柔软': '面料', '亲肤': '面料',
            '刺绣': '工艺', '印花': '工艺'
        },
        '鞋靴': {
            '软底': '鞋底', '防滑': '鞋底', '减震': '鞋底',
            '透气': '鞋面', '防水': '鞋面', '网面': '鞋面',
            '增高': '鞋底', '平底': '鞋底'
        },
        '箱包': {
            '防水': '材质', '耐磨': '材质', '轻便': '材质',
            '多层': '设计', '大容量': '设计', '防盗': '设计'
        },
        '数码': {
            '快充': '功能', '无线': '功能', '智能': '功能',
            '高清': '性能', '流畅': '性能', '稳定': '性能'
        },
        '母婴': {
            '硅胶': '材质', '纯棉': '材质', '环保': '材质',
            '防呛': '设计', '易清洗': '设计', '可消毒': '设计'
        }
    };
    
    const rules = featureSuffixRules[category] || {};
    return rules[feature] || suffixes[0]; // 返回匹配的后缀或默认第一个
};

// ==================== 导航栏组件 ====================
// ==================== 主题切换 Hook ====================
const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        // 检查本地存储或系统偏好
        const savedTheme = localStorage.getItem('douyin_copy_theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // 应用主题
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('douyin_copy_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return { isDark, toggleTheme };
};

const Navbar = ({ currentPage, setPage }) => {
    const { isDark, toggleTheme } = useTheme();
    
    const navItems = [
        { id: 'home', label: '首页', icon: 'fa-home' },
        { id: 'workspace', label: '素材生成', icon: 'fa-wand-magic-sparkles' },
        { id: 'templates', label: '模板库', icon: 'fa-layer-group' },
        { id: 'profile', label: '个人中心', icon: 'fa-user' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
                    <i className="fas fa-magic"></i>
                    <span>电商素材工作台</span>
                </a>
                <div className="navbar-nav">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setPage(item.id); }}
                        >
                            <i className={`fas ${item.icon}`}></i> {item.label}
                        </a>
                    ))}
                </div>
                <div className="navbar-user">
                    <button className="theme-toggle" onClick={toggleTheme} title={isDark ? '切换到亮色模式' : '切换到暗黑模式'}>
                        <i className="fas fa-moon"></i>
                        <i className="fas fa-sun"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

// ==================== 首页组件 ====================
const HomePage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    return (
        <div>
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <i className="fas fa-sparkles"></i>
                        AI驱动的电商内容创作工具
                    </div>
                    <h1>让商品素材创作<br />变得简单高效</h1>
                    <p>智能生成商品主图、标题和卖点文案，帮助电商运营提升10倍工作效率</p>
                    <div className="hero-buttons">
                        <a href="#" className="btn btn-white" onClick={(e) => { e.preventDefault(); setPage('workspace'); }}>
                            <i className="fas fa-rocket"></i> 立即开始
                        </a>
                        <a href="#features" className="btn btn-outline">
                            <i className="fas fa-play-circle"></i> 了解更多
                        </a>
                    </div>
                </div>
            </section>

            <section id="features" className="features">
                <div className="section-header">
                    <h2>为什么选择我们</h2>
                    <p>专为电商运营设计的智能创作工具，让素材生产不再是瓶颈</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card" onClick={() => setPage('batch')} style={{cursor: 'pointer'}}>
                        <div className="feature-icon"><i className="fas fa-bolt"></i></div>
                        <h3>批量生成</h3>
                        <p>支持Excel批量导入，一次生成上百个商品的素材，告别重复劳动</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('polish')} style={{cursor: 'pointer'}}>
                        <div className="feature-icon"><i className="fas fa-brain"></i></div>
                        <h3>AI智能润色</h3>
                        <p>基于大模型的文案生成，标题更吸引人，卖点更有感染力</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('poster')} style={{cursor: 'pointer'}}>
                        <div className="feature-icon"><i className="fas fa-image"></i></div>
                        <h3>AI海报生成</h3>
                        <p>智能生成商品营销海报，支持多种风格选择，一键下载使用</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('templates')} style={{cursor: 'pointer'}}>
                        <div className="feature-icon"><i className="fas fa-bookmark"></i></div>
                        <h3>模板管理</h3>
                        <p>保存满意的生成结果作为模板，下次上新直接套用</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('analytics')} style={{cursor: 'pointer'}}>
                        <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
                        <h3>数据追踪</h3>
                        <p>记录每个素材的使用情况，优化高转化文案策略</p>
                    </div>
                    <div className="feature-card" style={{cursor: 'default', opacity: 0.7}}>
                        <div className="feature-icon"><i className="fas fa-shield-alt"></i></div>
                        <h3>安全可靠</h3>
                        <p>数据加密存储，支持团队协作，权限管理灵活</p>
                    </div>
                </div>
            </section>

            <section className="stats">
                <div className="stats-grid">
                    <div><div className="stat-number">10万+</div><div className="stat-label">生成素材数量</div></div>
                    <div><div className="stat-number">5000+</div><div className="stat-label">活跃商家</div></div>
                    <div><div className="stat-number">85%</div><div className="stat-label">效率提升</div></div>
                    <div><div className="stat-number">4.9</div><div className="stat-label">用户评分</div></div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

// ==================== 页脚组件 ====================
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3><i className="fas fa-magic"></i> 电商素材工作台</h3>
                    <p>让电商内容创作变得简单高效，助力商家提升运营效率，实现业务增长。</p>
                </div>
                <div className="footer-links">
                    <h4>产品功能</h4>
                    <a href="#">素材生成</a>
                    <a href="#">批量处理</a>
                    <a href="#">模板库</a>
                    <a href="#">API接口</a>
                </div>
                <div className="footer-links">
                    <h4>帮助支持</h4>
                    <a href="#">使用教程</a>
                    <a href="#">常见问题</a>
                    <a href="#">更新日志</a>
                    <a href="#">联系我们</a>
                </div>
                <div className="footer-links">
                    <h4>关于我们</h4>
                    <a href="#">公司介绍</a>
                    <a href="#">加入我们</a>
                    <a href="#">隐私政策</a>
                    <a href="#">服务条款</a>
                </div>
            </div>
            <div className="footer-bottom">
                © 2024 电商素材工作台. All rights reserved.
            </div>
        </footer>
    );
};

// ==================== 工作区页面 ====================
const FormInput = ({ label, required, ...props }) => (
    <div className="form-group">
        <label className="form-label">
            {label}
            {required && <span className="required">*</span>}
        </label>
        <input className="form-input" {...props} />
    </div>
);

const FormSelect = ({ label, required, options, ...props }) => (
    <div className="form-group">
        <label className="form-label">
            {label}
            {required && <span className="required">*</span>}
        </label>
        <select className="form-select" {...props}>
            <option value="">请选择</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const ImageUpload = ({ onImageUpload, imagePreview }) => {
    const fileInputRef = useRef(null);
    const handleClick = () => fileInputRef.current?.click();
    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onImageUpload(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="form-group">
            <label className="form-label">商品图片</label>
            <div className={`upload-area ${imagePreview ? 'has-file' : ''}`} onClick={handleClick}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} style={{display: 'none'}} />
                {imagePreview ? (
                    <img src={imagePreview} alt="预览" className="preview-image" />
                ) : (
                    <>
                        <div className="upload-icon"><i className="fas fa-cloud-upload-alt"></i></div>
                        <div className="upload-text">点击上传商品图片</div>
                        <div className="upload-hint">支持 JPG、PNG 格式，建议尺寸 800x800</div>
                    </>
                )}
            </div>
        </div>
    );
};

const SingleForm = ({ onGenerate, loading, templateData, clearTemplate }) => {
    const [formData, setFormData] = useState({ name: '', category: '', material: '', color: '', features: '' });
    const [imagePreview, setImagePreview] = useState(null);

    // 接收模板数据
    useEffect(() => {
        if (templateData) {
            setFormData(templateData);
            clearTemplate();
        }
    }, [templateData, clearTemplate]);

    const handleChange = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const fillExample = () => {
        setFormData({ name: '防水运动背包', category: '箱包', material: '涤纶', color: '深空灰', features: '防水、大容量' });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.category) {
            alert('请填写必填项');
            return;
        }
        onGenerate({ ...formData, image: imagePreview });
    };

    // 根据商品信息生成对应的图片URL - 使用 Base64 SVG 生成彩色占位图
    const generateProductImage = () => {
        const { name, category } = formData;

        // 商品关键词映射（用于生成不同颜色的占位图）
        const imageIdMap = {
            // 数码产品
            '鼠标': '392018', '手机': '1092644', '电脑': '18105', '笔记本': '18105', '笔记本电脑': '18105',
            '耳机': '374777', '蓝牙耳机': '374777', '键盘': '177212', '相机': '1203819', '手表': '211399',
            '充电器': '205153', '音箱': '1547813', '平板': '1334597', '智能手表': '211399',
            // 服装
            'T恤': '991678', 't恤': '991678', '纯棉T恤': '991678', '短袖': '991678',
            '衬衫': '1488507', '白衬衣': '1488507',
            '卫衣': '991678', '连帽衫': '991678',
            '外套': '1124467', '羽绒服': '1124467', '棉衣': '1124467',
            '裤子': '1082529', '牛仔裤': '1082529', '长裤': '1082529',
            '裙子': '1488507', '连衣裙': '1488507', '长裙': '1488507',
            '毛衣': '459486', '针织衫': '459486',
            // 鞋靴
            '运动鞋': '1478442', '跑鞋': '1478442', '跑步鞋': '1478442', '鞋子': '1478442',
            '靴子': '1478442', '马丁靴': '1478442', '短靴': '1478442',
            '高跟鞋': '292999', '皮鞋': '292999',
            '帆布鞋': '1478442', '板鞋': '1478442',
            // 箱包
            '背包': '1549190', '双肩包': '1549190', '书包': '1549190',
            '运动背包': '1549190', '旅行包': '1549190', '登山包': '1549190',
            '防水背包': '1549190', '防水运动背包': '1549190',
            '单肩包': '1152077', '斜挎包': '1152077', '手提包': '1152077',
            '钱包': '1152077', '皮钱包': '1152077', '真皮钱包': '1152077', '钱夹': '1152077',
            '公文包': '1152077', '商务包': '1152077',
            '行李箱': '1549190', '拉杆箱': '1549190', '旅行箱': '1549190',
            // 美妆
            '口红': '2536965', '唇膏': '2536965', '唇釉': '2536965',
            '粉底': '2536965', '粉底液': '2536965',
            '香水': '965990', '香氛': '965990',
            '面膜': '2536965', '护肤品': '2536965',
            // 食品
            '咖啡': '312418', '咖啡豆': '312418', '巧克力': '918327',
            '坚果': '1351238', '干果': '1351238', '零食': '1351238',
            '面包': '177504', '蛋糕': '177504',
            '牛奶': '162712', '酸奶': '162712',
            '水果': '1132040', '苹果': '1132040',
            // 家居
            '水杯': '157793', '保温杯': '157793', '杯子': '157793', '马克杯': '157793',
            '枕头': '157793', '抱枕': '157793',
            '台灯': '157793', '灯具': '157793',
            '收纳盒': '157793', '收纳': '157793',
            // 母婴
            '湿巾': '1549190', '婴儿湿巾': '1549190',
            '奶粉': '162712', '奶瓶': '162712',
            '玩具': '163036', '积木': '163036',
            '童装': '991678', '婴儿服': '991678',
            // 运动
            '瑜伽垫': '1549190', '哑铃': '1549190',
            '帐篷': '1549190', '户外': '1549190',
            '自行车': '1549190',
        };

        // 类目默认图片ID
        const categoryImageIds = {
            '数码': '1092644', '服装': '991678', '鞋靴': '1478442', '箱包': '1549190',
            '美妆': '2536965', '食品': '312418', '家居': '157793', '母婴': '1549190',
            '运动': '1549190', '配饰': '1152077',
        };

        // 根据商品名称查找对应的图片ID
        let imageId = '';
        
        // 1. 优先完整匹配
        if (name && imageIdMap[name]) {
            imageId = imageIdMap[name];
        }
        
        // 2. 部分匹配
        if (!imageId) {
            for (const [key, value] of Object.entries(imageIdMap)) {
                if (name && name.includes(key)) {
                    imageId = value;
                    break;
                }
            }
        }

        // 3. 如果没有匹配到具体商品，使用类目默认图片
        if (!imageId) {
            imageId = categoryImageIds[category] || '1092644';
        }

        // 使用 Base64 SVG 生成彩色占位图（不依赖外部网络）
        const categoryColors = {
            '数码': '#3b82f6', '服装': '#ec4899', '鞋靴': '#8b5cf6', '箱包': '#f59e0b',
            '美妆': '#f472b6', '食品': '#10b981', '家居': '#06b6d4', '母婴': '#fbbf24',
            '运动': '#ef4444', '配饰': '#8b5cf6',
        };
        const bgColor = categoryColors[category] || '#6b7280';
        const text = name ? name.substring(0, 2) : '商品';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect fill="${bgColor}" width="800" height="800"/><text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${text}</text></svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    const categories = [
        { value: '服装', label: '服装' }, { value: '鞋靴', label: '鞋靴' },
        { value: '箱包', label: '箱包' }, { value: '家居', label: '家居' },
        { value: '数码', label: '数码' }, { value: '美妆', label: '美妆' },
        { value: '食品', label: '食品' }, { value: '母婴', label: '母婴' },
    ];

    return (
        <div>
            <FormInput label="商品名称" required placeholder="请输入商品名称" value={formData.name} onChange={handleChange('name')} />
            <FormSelect label="商品类目" required options={categories} value={formData.category} onChange={handleChange('category')} />
            <FormInput label="材质" required placeholder="如：纯棉、真皮、实木等" value={formData.material} onChange={handleChange('material')} />
            <FormInput label="颜色" required placeholder="如：象牙白、深空灰等" value={formData.color} onChange={handleChange('color')} />
            <div className="form-group">
                <label className="form-label">商品特色（选填）</label>
                <textarea className="form-textarea" placeholder="描述商品的核心卖点，如：防水、透气、轻便等" value={formData.features} onChange={handleChange('features')} />
            </div>
            <div className="form-group">
                <label className="form-label">商品图片</label>
                {imagePreview ? (
                    <div style={{position: 'relative', marginBottom: 12}}>
                        <img src={imagePreview} alt="预览" style={{width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8}} />
                        <button 
                            onClick={() => setImagePreview(null)}
                            style={{position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer'}}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ) : (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12}}>
                        <div 
                            className="upload-area" 
                            onClick={() => document.getElementById('product-image').click()}
                            style={{cursor: 'pointer'}}
                        >
                            <input id="product-image" type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setImagePreview(reader.result);
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            <div className="upload-icon"><i className="fas fa-cloud-upload-alt"></i></div>
                            <div className="upload-text">上传照片</div>
                            <div className="upload-hint">使用真实商品图</div>
                        </div>
                        <div 
                            className="upload-area" 
                            onClick={() => {
                                // AI生成图片
                                if (!formData.name || !formData.category) {
                                    alert('请先填写商品名称和类目');
                                    return;
                                }
                                const aiImage = generateProductImage();
                                setImagePreview(aiImage);
                            }}
                            style={{cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}
                        >
                            <div className="upload-icon" style={{color: 'white'}}><i className="fas fa-robot"></i></div>
                            <div className="upload-text" style={{color: 'white'}}>AI生成</div>
                            <div className="upload-hint" style={{color: 'rgba(255,255,255,0.8)'}}>根据商品信息生成</div>
                        </div>
                    </div>
                )}
            </div>
            <button className="btn btn-secondary" onClick={fillExample} style={{marginTop: 12}}>
                <i className="fas fa-magic"></i> 填充示例商品
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{marginTop: 12}}>
                {loading ? <span className="loading-spinner" /> : <i className="fas fa-sparkles"></i>}
                {loading ? '生成中...' : '生成素材'}
            </button>
        </div>
    );
};

const BatchImport = ({ onBatchGenerate, loading, batchItems, setBatchItems, onSelectItem, selectedItemId }) => {
    const fileInputRef = useRef(null);

    // 根据商品名称获取图片种子
    const getProductSeed = (name, category) => {
        const productSeeds = {
            '背包': 1001, '书包': 1002, '双肩包': 1003, '旅行包': 1004,
            'T恤': 2001, '衬衫': 2002, '卫衣': 2003, '毛衣': 2004, '外套': 2005,
            '裤子': 2101, '牛仔裤': 2102, '短裤': 2103,
            '裙子': 2201, '连衣裙': 2202,
            '鞋子': 3001, '运动鞋': 3002, '靴子': 3003, '凉鞋': 3004, '拖鞋': 3005,
            '高跟鞋': 3006, '帆布鞋': 3007, '皮鞋': 3008,
            '包': 4001, '手提包': 4002, '单肩包': 4003, '斜挎包': 4004, '钱包': 4005,
            '化妆包': 4006, '卡包': 4007,
            '耳机': 5001, '手机': 5002, '电脑': 5003, '笔记本': 5004,
            '充电器': 5005, '数据线': 5006, '充电宝': 5007, '音箱': 5008,
            '鼠标': 5009, '键盘': 5010, '相机': 5011, '手表': 5012,
            '口红': 6001, '粉底': 6002, '眼影': 6003, '面膜': 6004,
            '精华': 6005, '乳液': 6006, '面霜': 6007, '洗面奶': 6008,
            '香水': 6009, '指甲油': 6010,
            '零食': 7001, '坚果': 7002, '巧克力': 7003, '饼干': 7004,
            '糖果': 7005, '茶叶': 7006, '咖啡': 7007, '饮料': 7008,
            '果汁': 7009, '牛奶': 7010, '面包': 7011, '蛋糕': 7012,
            '水杯': 8001, '保温杯': 8002, '收纳盒': 8003, '衣架': 8004,
            '枕头': 8005, '被子': 8006, '床单': 8007, '毛巾': 8008,
            '牙刷': 8009, '牙膏': 8010, '洗发水': 8011, '沐浴露': 8012,
            '梳子': 8013, '镜子': 8014, '台灯': 8015, '闹钟': 8016,
            '雨伞': 8017, '风扇': 8018,
            '玩具': 9001, '奶瓶': 9002, '尿布': 9003, '婴儿车': 9004, '婴儿床': 9005,
        };
        
        for (const [key, value] of Object.entries(productSeeds)) {
            if (name.includes(key)) return value;
        }
        
        const categorySeeds = {
            '服装': 100, '鞋靴': 200, '箱包': 300, '美妆': 400,
            '食品': 500, '家居': 600, '数码': 700, '母婴': 800,
        };
        return categorySeeds[category] || 9999;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            const items = jsonData.map((row, index) => ({
                id: index + 1,
                name: row['商品名称'] || row['name'] || '',
                category: row['类目'] || row['category'] || '',
                material: row['材质'] || row['material'] || '',
                color: row['颜色'] || row['color'] || '',
                features: row['特色'] || row['features'] || '',
                status: 'pending',
                generated: null,
            })).filter(item => item.name && item.category);
            setBatchItems(items);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleGenerateAll = () => {
        if (batchItems.length === 0) {
            alert('请先导入Excel文件');
            return;
        }
        onBatchGenerate(batchItems);
    };

    return (
        <div>
            <div className="file-input-wrapper">
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{display: 'none'}} />
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    <div className="upload-icon"><i className="fas fa-file-excel"></i></div>
                    <div className="upload-text">点击上传Excel文件</div>
                    <div className="upload-hint">支持 .xlsx、.xls 格式</div>
                </div>
            </div>
            {batchItems.length > 0 && (
                <div className="batch-list">
                    <div className="batch-title">已导入 {batchItems.length} 个商品</div>
                    {batchItems.map((item) => (
                        <div key={item.id} className={`batch-item ${selectedItemId === item.id ? 'selected' : ''}`} onClick={() => onSelectItem(item.id)} style={{cursor: item.generated ? 'pointer' : 'default'}}>
                            {item.status === 'completed' ? (
                                <div className="batch-item-image">
                                    <img src={item.generated?.image || `https://placehold.co/100x100/4f46e5/ffffff?text=${encodeURIComponent(item.name.substring(0, 4))}`} alt={item.name} />
                                </div>
                            ) : (
                                <div className="batch-item-index">{item.id}</div>
                            )}
                            <div className="batch-item-info">
                                <div className="batch-item-name">{item.name}</div>
                                <div className="batch-item-meta">{item.category} · {item.material} · {item.color}</div>
                            </div>
                            <div className={`batch-item-status ${item.status}`}>{item.status === 'pending' ? '待生成' : '已生成'}</div>
                        </div>
                    ))}
                    <button className="btn btn-primary" onClick={handleGenerateAll} disabled={loading} style={{marginTop: 16}}>
                        {loading ? <span className="loading-spinner" /> : <i className="fas fa-rocket"></i>}
                        {loading ? '批量生成中...' : '开始批量生成'}
                    </button>
                </div>
            )}
            <div className="batch-section">
                <div className="batch-title">Excel模板格式</div>
                <div style={{fontSize: 12, color: '#666', lineHeight: 1.8}}>请确保Excel包含以下列：商品名称、类目、材质、颜色、特色（可选）</div>
            </div>
        </div>
    );
};

// ==================== 文案评分组件 ====================
const CopyScorePanel = ({ copy, productInfo }) => {
    const [score, setScore] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const analyzeCopy = async () => {
        setLoading(true);
        try {
            const apiKey = getApiKey();
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "你是一个电商文案评分专家。请对文案进行评分（0-100分）并给出优化建议。返回JSON格式：{score: number, suggestions: string[], highlights: string[]}"},
                        {"role": "user", "content": `请评分并优化以下电商文案：\n商品：${productInfo.name}\n标题：${copy.title}\n卖点：${copy.sellingPoint}`}
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0]?.message?.content;
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    setScore(result.score);
                    setSuggestions(result.suggestions || []);
                }
            }
        } catch (err) {
            console.error('评分失败:', err);
            // 使用本地评分逻辑
            let localScore = 70;
            const localSuggestions = [];
            
            if (copy.title.length < 10) {
                localScore -= 10;
                localSuggestions.push('标题建议更长一些，包含更多关键词');
            }
            if (copy.title.length > 30) {
                localScore -= 5;
                localSuggestions.push('标题略长，建议控制在30字以内');
            }
            if (!copy.sellingPoint.includes('！') && !copy.sellingPoint.includes('。')) {
                localScore -= 10;
                localSuggestions.push('卖点文案建议添加标点符号，提升可读性');
            }
            if (copy.sellingPoint.length < 20) {
                localScore -= 10;
                localSuggestions.push('卖点文案可以更详细一些，突出商品优势');
            }
            
            setScore(Math.max(0, localScore));
            setSuggestions(localSuggestions.length > 0 ? localSuggestions : ['文案整体不错，可以尝试添加更多情感化描述']);
        }
        setLoading(false);
    };

    useEffect(() => {
        analyzeCopy();
    }, [copy]);

    const getScoreColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (s) => {
        if (s >= 80) return '优秀';
        if (s >= 60) return '良好';
        return '需优化';
    };

    if (loading) {
        return (
            <div style={{background: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280'}}>
                    <i className="fas fa-spinner fa-spin"></i>
                    正在分析文案质量...
                </div>
            </div>
        );
    }

    if (!score) return null;

    return (
        <div style={{background: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="fas fa-chart-line" style={{color: '#4f46e5'}}></i>
                    <span style={{fontWeight: '600'}}>文案质量评分</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontSize: '24px', fontWeight: '700', color: getScoreColor(score)}}>{score}</span>
                    <span style={{fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: getScoreColor(score) + '20', color: getScoreColor(score)}}>{getScoreLabel(score)}</span>
                </div>
            </div>
            
            {suggestions.length > 0 && (
                <div>
                    <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '8px'}}>优化建议：</div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        {suggestions.map((suggestion, idx) => (
                            <div key={idx} style={{display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#4b5563'}}>
                                <i className="fas fa-lightbulb" style={{color: '#f59e0b', marginTop: '2px'}}></i>
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== 多平台适配组件 ====================
const PlatformAdapter = ({ copy, productInfo }) => {
    const [platformCopies, setPlatformCopies] = useState({});
    const [loading, setLoading] = useState(false);
    const [activePlatform, setActivePlatform] = useState('douyin');

    const platforms = [
        { id: 'douyin', name: '抖音', icon: 'fa-video', color: '#000000', desc: '短视频平台，节奏快、有感染力' },
        { id: 'xiaohongshu', name: '小红书', icon: 'fa-book-open', color: '#ff2442', desc: '种草社区，真实分享、详细体验' },
        { id: 'taobao', name: '淘宝', icon: 'fa-shopping-cart', color: '#ff5000', desc: '电商平台，突出卖点、促进转化' },
    ];

    const adaptForPlatform = async (platformId) => {
        if (platformCopies[platformId]) return;
        
        setLoading(true);
        try {
            const apiKey = getApiKey();
            const platformNames = { douyin: '抖音', xiaohongshu: '小红书', taobao: '淘宝' };
            
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": `你是一个${platformNames[platformId]}文案专家。请将文案适配为适合${platformNames[platformId]}平台的风格。返回JSON格式：{title: string, content: string, tags: string[]}`},
                        {"role": "user", "content": `商品：${productInfo.name}\n原标题：${copy.title}\n原卖点：${copy.sellingPoint}\n请适配为${platformNames[platformId]}风格`}
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0]?.message?.content;
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    setPlatformCopies(prev => ({ ...prev, [platformId]: result }));
                }
            }
        } catch (err) {
            console.error('适配失败:', err);
            // 使用本地适配逻辑
            const localAdapters = {
                douyin: {
                    title: copy.title.replace(/[。，]/g, '') + '🔥',
                    content: copy.sellingPoint + ' 姐妹们快冲！#好物推荐 #' + productInfo.category,
                    tags: ['好物推荐', productInfo.category, '必买']
                },
                xiaohongshu: {
                    title: '【亲测】' + copy.title,
                    content: '最近入手了' + productInfo.name + '，' + copy.sellingPoint + ' 真的超级推荐！\n\n✨使用体验：\n' + copy.sellingPoint + '\n\n💡小贴士：\n建议搭配其他产品使用效果更佳\n\n#' + productInfo.category + ' #种草 #' + productInfo.name,
                    tags: ['种草', productInfo.category, '亲测', '好物分享']
                },
                taobao: {
                    title: copy.title + '【官方正品】',
                    content: '【商品卖点】' + copy.sellingPoint + '\n【品质保证】正品保证，假一赔十\n【售后无忧】7天无理由退换\n【限时优惠】现在下单享特惠价',
                    tags: ['正品保证', '限时特惠', '7天退换']
                }
            };
            setPlatformCopies(prev => ({ ...prev, [platformId]: localAdapters[platformId] }));
        }
        setLoading(false);
    };

    useEffect(() => {
        adaptForPlatform(activePlatform);
    }, [activePlatform]);

    const currentCopy = platformCopies[activePlatform];

    return (
        <div style={{background: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                <i className="fas fa-share-alt" style={{color: '#4f46e5'}}></i>
                <span style={{fontWeight: '600'}}>多平台适配</span>
            </div>
            
            {/* 平台选择 */}
            <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                {platforms.map(platform => (
                    <button
                        key={platform.id}
                        onClick={() => setActivePlatform(platform.id)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activePlatform === platform.id ? platform.color : 'white',
                            color: activePlatform === platform.id ? 'white' : '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className={`fas ${platform.icon}`} style={{fontSize: '16px'}}></i>
                        <span>{platform.name}</span>
                    </button>
                ))}
            </div>

            {/* 平台描述 */}
            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '12px', padding: '8px', background: 'white', borderRadius: '6px'}}>
                <i className="fas fa-info-circle"></i> {platforms.find(p => p.id === activePlatform)?.desc}
            </div>

            {/* 适配后的文案 */}
            {loading ? (
                <div style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                    <i className="fas fa-spinner fa-spin"></i> 正在适配...
                </div>
            ) : currentCopy ? (
                <div style={{background: 'white', borderRadius: '6px', padding: '12px'}}>
                    <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937'}}>{currentCopy.title}</div>
                    <div style={{fontSize: '13px', color: '#4b5563', lineHeight: '1.6', marginBottom: '8px', whiteSpace: 'pre-wrap'}}>{currentCopy.content}</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                        {currentCopy.tags?.map((tag, idx) => (
                            <span key={idx} style={{fontSize: '11px', padding: '2px 8px', background: '#e5e7eb', borderRadius: '10px', color: '#6b7280'}}>#{tag}</span>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

// ==================== A/B测试组件 ====================
const ABTestPanel = ({ copy, productInfo }) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const generateVariants = async () => {
        setLoading(true);
        try {
            const apiKey = getApiKey();
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "你是一个电商文案A/B测试专家。请基于原文案生成2个不同风格的变体版本用于A/B测试。返回JSON格式：{variants: [{style: string, title: string, sellingPoint: string, predictedCTR: number}]}"},
                        {"role": "user", "content": `商品：${productInfo.name}\n原标题：${copy.title}\n原卖点：${copy.sellingPoint}\n请生成2个不同风格的A/B测试版本，并预测点击率`}
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0]?.message?.content;
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    setVariants(result.variants || []);
                }
            }
        } catch (err) {
            console.error('A/B测试生成失败:', err);
            // 使用本地生成逻辑
            setVariants([
                {
                    style: '情感驱动型',
                    title: copy.title + '💕',
                    sellingPoint: '真心推荐！' + copy.sellingPoint + ' 用过就知道有多好！',
                    predictedCTR: 4.2
                },
                {
                    style: '理性分析型',
                    title: '【实测】' + copy.title,
                    sellingPoint: '经过实测，' + copy.sellingPoint + ' 数据说话，值得信赖。',
                    predictedCTR: 3.8
                }
            ]);
        }
        setLoading(false);
    };

    useEffect(() => {
        generateVariants();
    }, [copy]);

    return (
        <div style={{background: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="fas fa-flask" style={{color: '#4f46e5'}}></i>
                    <span style={{fontWeight: '600'}}>A/B测试对比</span>
                </div>
                <button 
                    onClick={generateVariants}
                    style={{padding: '4px 12px', fontSize: '12px', border: 'none', background: '#4f46e5', color: 'white', borderRadius: '6px', cursor: 'pointer'}}
                >
                    <i className="fas fa-sync"></i> 重新生成
                </button>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                    <i className="fas fa-spinner fa-spin"></i> 正在生成测试版本...
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {/* 原始版本 */}
                    <div style={{background: 'white', borderRadius: '6px', padding: '12px', border: '2px solid #4f46e5'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                            <span style={{fontSize: '11px', padding: '2px 8px', background: '#4f46e5', color: 'white', borderRadius: '10px'}}>原始版本</span>
                        </div>
                        <div style={{fontSize: '13px', fontWeight: '500'}}>{copy.title}</div>
                        <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>{copy.sellingPoint.substring(0, 50)}...</div>
                    </div>

                    {/* A/B测试版本 */}
                    {variants.map((variant, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setSelectedVariant(idx)}
                            style={{
                                background: 'white',
                                borderRadius: '6px',
                                padding: '12px',
                                border: selectedVariant === idx ? '2px solid #10b981' : '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px'}}>
                                <span style={{fontSize: '11px', padding: '2px 8px', background: '#10b981', color: 'white', borderRadius: '10px'}}>版本 {String.fromCharCode(65 + idx)}</span>
                                <span style={{fontSize: '11px', color: '#10b981', fontWeight: '600'}}>预估CTR: {variant.predictedCTR}%</span>
                            </div>
                            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>风格: {variant.style}</div>
                            <div style={{fontSize: '13px', fontWeight: '500'}}>{variant.title}</div>
                            <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>{variant.sellingPoint.substring(0, 50)}...</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PreviewPanel = ({ result, emptyText }) => {
    const [showTikTokModal, setShowTikTokModal] = useState(false);
    const [coreSellingPoint, setCoreSellingPoint] = useState('');
    const [tiktokCopies, setTikTokCopies] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);
    const [activeTab, setActiveTab] = useState('preview'); // preview | score | platform | abtest

    if (!result) {
        return (
            <div className="empty-state">
                <i className="fas fa-palette"></i>
                <div className="empty-state-text" dangerouslySetInnerHTML={{__html: emptyText}} />
            </div>
        );
    }

    const { productInfo, copy, sellingTag } = result;

    // 生成抖音文案
    const generateTikTokCopies = async () => {
        if (!coreSellingPoint.trim()) {
            setError('请输入商品核心卖点');
            return;
        }

        setGenerating(true);
        setError('');
        setTikTokCopies([]);

        try {
            // DeepSeek API 调用 - 使用用户提供的API Key
            const apiKey = getApiKey(); // 用户的API Key
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "你是一个资深的电商文案策划专家，擅长写抖音带货文案。"},
                        {"role": "user", "content": `帮我为[${coreSellingPoint}]写3条不同风格的抖音带货文案。每条文案要吸引人，有节奏感，适合在抖音平台推广。`}
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            
            if (content) {
                // 解析生成的文案，按序号分割
                const copies = content.split(/\n\d+\.\s*/).filter(c => c.trim());
                setTikTokCopies(copies.slice(0, 3)); // 只取前3条
            } else {
                throw new Error('API返回格式错误');
            }
        } catch (err) {
            console.error('生成抖音文案失败:', err);
            setError(`生成失败，请稍后重试: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    // 复制文案
    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(index);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    // 关闭模态框
    const closeModal = () => {
        setShowTikTokModal(false);
        setCoreSellingPoint('');
        setTikTokCopies([]);
        setError('');
        setCopied(null);
    };

    return (
        <div>
            <div className="preview-section">
                <div className="preview-section-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>主图预览</span>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => setShowTikTokModal(true)}
                        style={{padding: '6px 12px', fontSize: '14px'}}
                    >
                        <i className="fas fa-video"></i> 生成抖音文案
                    </button>
                </div>
                <div className="main-image-preview">
                    {productInfo.image ? (
                        <>
                            <img 
                                src={productInfo.image} 
                                alt={productInfo.name}
                                onError={(e) => {
                                    // 图片加载失败时显示占位符
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            {/* 图片加载失败时显示的占位符 */}
                            <div className="main-image-placeholder" style={{display: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                                <i className="fas fa-image"></i>
                                <div>图片加载失败</div>
                            </div>
                            {!productInfo.isUserUpload && (
                                <div className="ai-generated-badge"><i className="fas fa-robot"></i> AI生成</div>
                            )}
                            <div className="selling-point-overlay">
                                <span className="selling-point-tag">{sellingTag}</span>
                                <div className="selling-point-text">{copy.sellingPoint.substring(0, 30)}...</div>
                            </div>
                        </>
                    ) : (
                        <div className="main-image-placeholder">
                            <i className="fas fa-image"></i>
                            <div>暂无图片</div>
                        </div>
                    )}
                </div>
            </div>
            {/* Tab切换 */}
            <div style={{display: 'flex', gap: '4px', marginBottom: '16px', background: '#f3f4f6', padding: '4px', borderRadius: '8px'}}>
                {[
                    { id: 'preview', label: '文案预览', icon: 'fa-eye' },
                    { id: 'score', label: '智能评分', icon: 'fa-chart-line' },
                    { id: 'platform', label: '多平台适配', icon: 'fa-share-alt' },
                    { id: 'abtest', label: 'A/B测试', icon: 'fa-flask' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            border: 'none',
                            borderRadius: '6px',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? '#4f46e5' : '#6b7280',
                            fontSize: '12px',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className={`fas ${tab.icon}`}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab内容 */}
            {activeTab === 'preview' && (
                <div className="preview-section">
                    <div className="preview-section-title">文案预览</div>
                    <div className="copy-card">
                        <div className="copy-card-label"><i className="fas fa-heading"></i> 商品标题</div>
                        <div className="copy-card-content title">{copy.title}</div>
                    </div>
                    <div className="copy-card">
                        <div className="copy-card-label"><i className="fas fa-comment-dots"></i> 卖点文案</div>
                        <div className="copy-card-content">{copy.sellingPoint}</div>
                    </div>
                    <div className="copy-card">
                        <div className="copy-card-label"><i className="fas fa-tags"></i> 关键词标签</div>
                        <div className="tag-list">
                            {copy.keywords.map((keyword, index) => (
                                <span key={index} className="tag">{keyword}</span>
                            ))}
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setShowTikTokModal(true)}
                        style={{width: '100%', marginTop: '16px', padding: '12px'}}
                    >
                        <i className="fas fa-video"></i> 生成抖音文案
                    </button>
                </div>
            )}

            {activeTab === 'score' && (
                <CopyScorePanel copy={copy} productInfo={productInfo} />
            )}

            {activeTab === 'platform' && (
                <PlatformAdapter copy={copy} productInfo={productInfo} />
            )}

            {activeTab === 'abtest' && (
                <ABTestPanel copy={copy} productInfo={productInfo} />
            )}

            {/* 抖音文案生成模态框 */}
            {showTikTokModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>生成抖音文案</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">商品核心卖点</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="例如：纯棉T恤、透气、显瘦" 
                                    value={coreSellingPoint} 
                                    onChange={(e) => setCoreSellingPoint(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            {error && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i> {error}
                                </div>
                            )}
                            <button 
                                className="btn btn-primary" 
                                onClick={generateTikTokCopies}
                                disabled={generating}
                                style={{width: '100%', marginBottom: '20px'}}
                            >
                                {generating ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        <span style={{marginLeft: '8px'}}>生成中...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic"></i>
                                        <span style={{marginLeft: '8px'}}>开始生成</span>
                                    </>
                                )}
                            </button>
                            {tiktokCopies.length > 0 && (
                                <div className="tiktok-copies">
                                    <h4>生成的抖音文案</h4>
                                    {tiktokCopies.map((text, index) => (
                                        <div key={index} className="tiktok-copy-item">
                                            <div className="copy-index">{index + 1}</div>
                                            <div className="copy-content">{text}</div>
                                            <button 
                                                className={`copy-btn ${copied === index ? 'copied' : ''}`}
                                                onClick={() => handleCopy(text, index)}
                                                title="复制文案"
                                            >
                                                {copied === index ? (
                                                    <>
                                                        <i className="fas fa-check"></i>
                                                        <span>已复制</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-copy"></i>
                                                        <span>复制</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const WorkspacePage = ({ templateData, clearTemplate, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [activeTab, setActiveTab] = useState('single');
    const [loading, setLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState(null);
    const [batchItems, setBatchItems] = useState([]);
    const [selectedBatchItemId, setSelectedBatchItemId] = useState(null);

    // AI图片生成函数 - 使用 Base64 SVG 生成彩色占位图
    const generateAIImage = (productInfo) => {
        const { category, name } = productInfo;

        // 商品关键词映射（用于生成不同颜色的占位图）
        const imageIdMap = {
            // 数码产品
            '鼠标': '1272503',
            '手机': '1092644',
            '电脑': '18105',
            '笔记本': '18105',
            '耳机': '374777',
            '键盘': '1772123',
            '相机': '1203819',
            '手表': '190819',
            '充电器': '1272503',
            '音箱': '1272503',
            // 服装
            'T恤': '991678',
            '纯棉T恤': '991678',
            '短袖': '991678',
            '衬衫': '297933',
            '卫衣': '991678',
            '外套': '297933',
            '裤子': '67694',
            '牛仔裤': '67694',
            '裙子': '1488507',
            '连衣裙': '1488507',
            '羽绒服': '991678',
            '毛衣': '991678',
            // 鞋靴
            '运动鞋': '1478442',
            '跑鞋': '1478442',
            '鞋子': '1478442',
            '靴子': '1478442',
            '高跟鞋': '1478442',
            '皮鞋': '1478442',
            // 箱包
            '背包': '1549190',
            '运动背包': '1549190',
            '书包': '1549190',
            '手提包': '1152077',
            '单肩包': '1152077',
            '钱包': '1152077',
            '皮钱包': '1152077',
            '真皮钱包': '1152077',
            '公文包': '1152077',
            '旅行包': '1549190',
            // 美妆
            '口红': '2536965',
            '香水': '2536965',
            '面膜': '2536965',
            // 食品
            '咖啡': '312418',
            '巧克力': '918327',
            '坚果': '1351238',
            '面包': '1775043',
            // 家居
            '水杯': '157793',
            '保温杯': '157793',
            '杯子': '157793',
            '枕头': '157793',
            '台灯': '157793',
            '收纳': '157793',
        };

        // 类目默认图片ID
        const categoryImageIds = {
            '数码': '1092644',
            '服装': '991678',
            '鞋靴': '1478442',
            '箱包': '1549190',
            '美妆': '2536965',
            '食品': '312418',
            '家居': '157793',
            '母婴': '1549190',
        };

        // 根据商品名称查找对应的图片ID
        let imageId = '';
        for (const [key, value] of Object.entries(imageIdMap)) {
            if (name && name.includes(key)) {
                imageId = value;
                break;
            }
        }

        // 如果没有匹配到具体商品，使用类目默认图片
        if (!imageId) {
            imageId = categoryImageIds[category] || '1092644';
        }

        // 使用 Base64 SVG 生成彩色占位图（不依赖外部网络）
        const categoryColors = {
            '数码': '#3b82f6', '服装': '#ec4899', '鞋靴': '#8b5cf6', '箱包': '#f59e0b',
            '美妆': '#f472b6', '食品': '#10b981', '家居': '#06b6d4', '母婴': '#fbbf24',
            '运动': '#ef4444', '配饰': '#8b5cf6',
        };
        const bgColor = categoryColors[category] || '#6b7280';
        const text = name ? name.substring(0, 2) : '商品';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect fill="${bgColor}" width="800" height="800"/><text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${text}</text></svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    const handleGenerate = async (productInfo) => {
        setLoading(true);
        
        // 先生成文案
        const copy = generateCopy(productInfo);
        const sellingTag = generateSellingTag(productInfo.category, productInfo.material, productInfo.features);
        
        // 如果用户没有上传图片，生成AI图片
        let finalImage = productInfo.image;
        let isUserUpload = true;
        
        if (!finalImage) {
            try {
                finalImage = generateAIImage(productInfo);
                isUserUpload = false;
            } catch (e) {
                console.error('AI图片生成失败', e);
            }
        }
        
        const result = { productInfo: { ...productInfo, image: finalImage, isUserUpload }, copy, sellingTag };
        setPreviewResult(result);
        
        // 保存到历史记录
        if (addToHistory) {
            addToHistory({
                type: 'copy',
                title: `${productInfo.name}文案生成`,
                content: copy.sellingPoint,
                productInfo: { ...productInfo, image: finalImage },
                copies: copy,
            });
        }
        
        // 显示成功提示
        if (showToast) {
            showToast('文案生成成功！已保存到历史记录', 'success');
        }
        
        setLoading(false);
    };

    const handleBatchGenerate = async (items) => {
        setLoading(true);
        const updatedItems = items.map(item => {
            const copy = generateCopy(item);
            const sellingTag = generateSellingTag(item.category, item.material, item.features);
            // 为每个商品生成AI图片
            const aiImage = generateAIImage(item);
            return { ...item, status: 'completed', generated: { copy, sellingTag, image: aiImage } };
        });
        setBatchItems(updatedItems);
        setSelectedBatchItemId(updatedItems[0]?.id || null);
        if (updatedItems[0]) {
            setPreviewResult({
                productInfo: { ...updatedItems[0], image: updatedItems[0].generated.image, isUserUpload: false },
                copy: updatedItems[0].generated.copy,
                sellingTag: updatedItems[0].generated.sellingTag,
            });
        }

        // 保存到历史记录
        if (addToHistory) {
            updatedItems.forEach(item => {
                addToHistory({
                    type: 'copy',
                    title: `${item.name}文案生成`,
                    content: item.generated.copy.sellingPoint,
                    productInfo: { ...item, image: item.generated.image },
                    copies: item.generated.copy,
                });
            });
        }

        // 显示成功提示
        if (showToast) {
            showToast(`批量生成完成！已生成${updatedItems.length}个商品的素材`, 'success');
        }

        setLoading(false);
    };

    const handleSelectBatchItem = (itemId) => {
        const item = batchItems.find(i => i.id === itemId);
        if (item && item.generated) {
            setSelectedBatchItemId(itemId);
            setPreviewResult({
                productInfo: { ...item, image: item.generated.image },
                copy: item.generated.copy,
                sellingTag: item.generated.sellingTag,
            });
        }
    };

    const getEmptyStateText = () => {
        if (activeTab === 'batch' && batchItems.length > 0) {
            return '点击"开始批量生成"生成素材后<br />点击左侧商品查看详情';
        }
        return '在左侧填写商品信息并点击生成<br />即可预览生成的素材效果';
    };

    return (
        <div className="workspace-page">
            <div className="page-header">
                <h1><i className="fas fa-wand-magic-sparkles"></i> 素材生成工作台</h1>
                <p>智能生成商品主图、标题和卖点文案</p>
            </div>
            <div className="workspace-container">
                <div className="panel">
                    <div className="panel-title"><i className="fas fa-edit"></i> 商品信息</div>
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>
                            <i className="fas fa-file-alt"></i> 单个录入
                        </button>
                        <button className={`tab ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>
                            <i className="fas fa-copy"></i> 批量导入
                        </button>
                    </div>
                    {activeTab === 'single' ? (
                        <SingleForm 
                            onGenerate={handleGenerate} 
                            loading={loading} 
                            templateData={templateData}
                            clearTemplate={clearTemplate}
                        />
                    ) : (
                        <BatchImport
                            onBatchGenerate={handleBatchGenerate}
                            loading={loading}
                            batchItems={batchItems}
                            setBatchItems={setBatchItems}
                            onSelectItem={handleSelectBatchItem}
                            selectedItemId={selectedBatchItemId}
                        />
                    )}
                </div>
                <div className="panel">
                    <div className="panel-title"><i className="fas fa-eye"></i> 效果预览</div>
                    <PreviewPanel result={previewResult} emptyText={getEmptyStateText()} />
                </div>
            </div>
        </div>
    );
};

// ==================== 模板库页面 ====================
const TemplatesPage = ({ setPage, setTemplateData, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    // 根据商品名称获取图片种子
    const getProductSeed = (name, category) => {
        const productSeeds = {
            '背包': 1001, '书包': 1002, '双肩包': 1003, '旅行包': 1004,
            'T恤': 2001, '衬衫': 2002, '卫衣': 2003, '毛衣': 2004, '外套': 2005,
            '裤子': 2101, '牛仔裤': 2102, '短裤': 2103,
            '裙子': 2201, '连衣裙': 2202,
            '鞋子': 3001, '运动鞋': 3002, '靴子': 3003, '凉鞋': 3004, '拖鞋': 3005,
            '高跟鞋': 3006, '帆布鞋': 3007, '皮鞋': 3008,
            '包': 4001, '手提包': 4002, '单肩包': 4003, '斜挎包': 4004, '钱包': 4005,
            '化妆包': 4006, '卡包': 4007,
            '耳机': 5001, '手机': 5002, '电脑': 5003, '笔记本': 5004,
            '充电器': 5005, '数据线': 5006, '充电宝': 5007, '音箱': 5008,
            '鼠标': 5009, '键盘': 5010, '相机': 5011, '手表': 5012,
            '口红': 6001, '粉底': 6002, '眼影': 6003, '面膜': 6004,
            '精华': 6005, '乳液': 6006, '面霜': 6007, '洗面奶': 6008,
            '香水': 6009, '指甲油': 6010,
            '零食': 7001, '坚果': 7002, '巧克力': 7003, '饼干': 7004,
            '糖果': 7005, '茶叶': 7006, '咖啡': 7007, '饮料': 7008,
            '果汁': 7009, '牛奶': 7010, '面包': 7011, '蛋糕': 7012,
            '水杯': 8001, '保温杯': 8002, '收纳盒': 8003, '衣架': 8004,
            '枕头': 8005, '被子': 8006, '床单': 8007, '毛巾': 8008,
            '牙刷': 8009, '牙膏': 8010, '洗发水': 8011, '沐浴露': 8012,
            '梳子': 8013, '镜子': 8014, '台灯': 8015, '闹钟': 8016,
            '雨伞': 8017, '风扇': 8018,
            '玩具': 9001, '奶瓶': 9002, '尿布': 9003, '婴儿车': 9004, '婴儿床': 9005,
        };
        
        for (const [key, value] of Object.entries(productSeeds)) {
            if (name.includes(key)) return value;
        }
        
        const categorySeeds = {
            '服装': 100, '鞋靴': 200, '箱包': 300, '美妆': 400,
            '食品': 500, '家居': 600, '数码': 700, '母婴': 800,
        };
        return categorySeeds[category] || 9999;
    };

    const templates = [
        { 
            id: 1, name: '爆款服装模板', category: '服装', usage: 128, 
            data: { name: '纯棉T恤', category: '服装', material: '纯棉', color: '白色', features: '透气、亲肤、百搭' }
        },
        { 
            id: 2, name: '数码产品模板', category: '数码', usage: 96, 
            data: { name: '无线耳机', category: '数码', material: '塑料', color: '黑色', features: '降噪、长续航、便携' }
        },
        { 
            id: 3, name: '美妆护肤模板', category: '美妆', usage: 85, 
            data: { name: '保湿精华', category: '美妆', material: '液体', color: '透明', features: '保湿、修复、温和' }
        },
        { 
            id: 4, name: '家居生活模板', category: '家居', usage: 72, 
            data: { name: '收纳盒', category: '家居', material: '塑料', color: '米色', features: '大容量、可叠加、防尘' }
        },
        { 
            id: 5, name: '健康零食模板', category: '食品', usage: 156, 
            data: { name: '坚果零食', category: '食品', material: '天然', color: '原色', features: '健康、美味、营养' }
        },
        { 
            id: 6, name: '舒适鞋靴模板', category: '鞋靴', usage: 89, 
            data: { name: '运动鞋', category: '鞋靴', material: '网布', color: '蓝色', features: '透气、软底、轻便' }
        },
    ].map(t => {
        // 使用 Base64 SVG 生成与模板类目匹配的彩色占位图
        const categoryImageIds = {
            '服装': '991678', // T恤
            '鞋靴': '1478442', // 运动鞋
            '箱包': '1549190', // 背包
            '美妆': '2536965', // 口红
            '食品': '312418', // 咖啡
            '家居': '157793', // 水杯
            '数码': '374777', // 耳机
            '母婴': '1549190', // 婴儿
        };
        const imageId = categoryImageIds[t.category] || '1092644';
        // 使用 Base64 SVG 生成彩色占位图（不依赖外部网络）
        const categoryColors = {
            '服装': '#ec4899', '鞋靴': '#8b5cf6', '箱包': '#f59e0b', '美妆': '#f472b6',
            '食品': '#10b981', '家居': '#06b6d4', '数码': '#3b82f6', '母婴': '#fbbf24',
        };
        const bgColor = categoryColors[t.category] || '#6b7280';
        const text = t.category.substring(0, 2);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="${bgColor}" width="400" height="400"/><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${text}</text></svg>`;
        const base64Svg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        return {
            ...t,
            image: base64Svg
        };
    });

    const handleUseTemplate = (template) => {
        if (setTemplateData) {
            setTemplateData(template.data);
        }
        setPage('workspace');
    };

    return (
        <div className="workspace-page">
            <div className="page-header">
                <h1><i className="fas fa-layer-group"></i> 模板库</h1>
                <p>保存和使用高质量的素材模板，点击即可应用到工作台</p>
            </div>
            <div className="features-grid">
                {templates.map(template => (
                    <div key={template.id} className="feature-card" style={{textAlign: 'left', padding: 0, overflow: 'hidden'}}>
                        <img src={template.image} alt={template.name} style={{width: '100%', height: 200, objectFit: 'cover'}} />
                        <div style={{padding: 24}}>
                            <h3>{template.name}</h3>
                            <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>类目：{template.category} · 使用次数：{template.usage}</p>
                            <p style={{marginBottom: 16, fontSize: 13, color: '#888'}}>
                                {template.data.name} · {template.data.material} · {template.data.features.substring(0, 15)}...
                            </p>
                            <button 
                                className="btn btn-primary" 
                                style={{width: 'auto', padding: '10px 24px'}}
                                onClick={() => handleUseTemplate(template)}
                            >
                                <i className="fas fa-plus"></i> 使用模板
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================== 批量生成页面 ====================
const BatchGeneratePage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);

    // 批量生成图片生成函数
    const generateBatchImage = (name, category) => {
        // 商品关键词映射（用于生成不同颜色的占位图）
        const imageIdMap = {
            // 数码产品
            '耳机': '374777', '手机': '1092644', '电脑': '18105', '笔记本': '18105',
            '手表': '190819', '键盘': '1772123', '相机': '1203819',
            // 服装
            '羽绒服': '991678', 'T恤': '991678', '衬衫': '297933',
            // 鞋靴
            '运动鞋': '1478442', '鞋子': '1478442',
            // 箱包
            '背包': '1549190',
            '运动背包': '1549190',
            '书包': '1549190',
            '包': '1549190',
            '公文包': '1152077',
            '手提包': '1152077',
            '单肩包': '1152077',
            '钱包': '1152077',
            // 美妆
            '面膜': '2536965', '护肤': '2536965',
            // 食品
            '零食': '1351238', '坚果': '1351238',
            // 家居
            '机器人': '157793', '自行车': '157793',
            // 母婴
            '积木': '1549190', '儿童': '1549190',
        };

        // 类目默认图片ID
        const categoryImageIds = {
            '数码': '374777', '服装': '991678', '鞋靴': '1478442', '箱包': '1549190',
            '美妆': '2536965', '食品': '1351238', '家居': '157793', '母婴': '1549190',
            '运动': '157793',
        };

        // 根据商品名称查找对应的图片ID
        let imageId = '';
        for (const [key, value] of Object.entries(imageIdMap)) {
            if (name && name.includes(key)) {
                imageId = value;
                break;
            }
        }

        // 如果没有匹配到具体商品，使用类目默认图片
        if (!imageId) {
            imageId = categoryImageIds[category] || '1092644';
        }

        // 使用 Base64 SVG 生成彩色占位图（不依赖外部网络）
        const categoryColors = {
            '数码': '#3b82f6', '服装': '#ec4899', '鞋靴': '#8b5cf6', '箱包': '#f59e0b',
            '美妆': '#f472b6', '食品': '#10b981', '家居': '#06b6d4', '母婴': '#fbbf24',
            '运动': '#ef4444', '配饰': '#8b5cf6',
        };
        const bgColor = categoryColors[category] || '#6b7280';
        const text = name ? name.substring(0, 2) : '商品';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="${bgColor}" width="400" height="400"/><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${text}</text></svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const startBatchGenerate = async () => {
        if (!file) {
            alert('请先上传Excel文件');
            return;
        }

        setGenerating(true);
        setProgress(0);
        setResults([]);
        setExpandedItem(null);

        // 模拟批量生成过程
        const totalItems = 10;
        const sampleData = [
            { name: '冬季保暖羽绒服', category: '服装', feature: '90%白鸭绒填充，轻薄保暖，防风防水' },
            { name: '无线蓝牙耳机', category: '数码', feature: '降噪技术，续航30小时，音质清晰' },
            { name: '天然护肤面膜', category: '美妆', feature: '玻尿酸精华，深层补水，温和不刺激' },
            { name: '智能运动手表', category: '数码', feature: '心率监测，GPS定位，50米防水' },
            { name: '纯棉休闲T恤', category: '服装', feature: '100%纯棉，透气吸汗，多色可选' },
            { name: '进口零食大礼包', category: '食品', feature: '精选全球网红零食，独立包装' },
            { name: '便携折叠自行车', category: '运动', feature: '铝合金车架，轻便折叠，通勤首选' },
            { name: '智能扫地机器人', category: '家居', feature: '激光导航，自动回充，APP远程控制' },
            { name: '真皮商务公文包', category: '箱包', feature: '头层牛皮，多层收纳，商务必备' },
            { name: '儿童益智积木', category: '母婴', feature: '环保材质，开发智力，安全无毒' },
        ];

        for (let i = 0; i < totalItems; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setProgress(Math.round(((i + 1) / totalItems) * 100));

            const data = sampleData[i];

            // 生成商品图片
            const productImage = generateBatchImage(data.name, data.category);

            setResults(prev => [...prev, {
                id: i + 1,
                name: data.name,
                category: data.category,
                status: 'completed',
                title: `【爆款推荐】${data.name} - ${data.feature.substring(0, 15)}...`,
                copy: `${data.name}，${data.feature}。现在购买享受限时优惠，错过再等一年！品质保证，售后无忧，立即下单抢购吧！`,
                keywords: ['品质保证', '限时优惠', '热销爆款', data.category],
                description: `这是一款优质的${data.name}，采用${data.feature}。无论是自用还是送礼都是绝佳选择。我们承诺7天无理由退换，让您购物无忧。`,
                sellingPoints: [
                    `✓ ${data.feature}`,
                    '✓ 品质保证，假一赔十',
                    '✓ 7天无理由退换',
                    '✓ 全国包邮，快速发货'
                ],
                image: productImage
            }]);
        }

        setGenerating(false);
    };

    return (
        <div className="poster-page">
            <div className="poster-header">
                <button className="btn btn-outline" onClick={() => setPage('home')}>
                    <i className="fas fa-arrow-left"></i> 返回首页
                </button>
                <h1><i className="fas fa-bolt"></i> 批量生成</h1>
                <p>支持Excel批量导入，一次生成上百个商品的素材</p>
            </div>

            <div className="poster-container" style={{gridTemplateColumns: '1fr'}}>
                <div className="poster-form">
                    <div className="form-group">
                        <label className="form-label">上传Excel文件</label>
                        <div className="file-upload-area" style={{
                            border: '2px dashed #d1d5db',
                            borderRadius: '12px',
                            padding: '40px',
                            textAlign: 'center',
                            background: '#f9fafb'
                        }}>
                            <input 
                                type="file" 
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                style={{display: 'none'}}
                                id="batch-file-input"
                            />
                            <label htmlFor="batch-file-input" style={{cursor: 'pointer'}}>
                                <i className="fas fa-cloud-upload-alt" style={{fontSize: '48px', color: '#4f46e5', marginBottom: '16px', display: 'block'}}></i>
                                <p style={{color: '#374151', marginBottom: '8px'}}>点击或拖拽上传Excel文件</p>
                                <p style={{color: '#9ca3af', fontSize: '14px'}}>支持 .xlsx, .xls, .csv 格式</p>
                            </label>
                        </div>
                        {file && (
                            <div style={{marginTop: '12px', padding: '12px', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <i className="fas fa-file-excel" style={{color: '#4f46e5'}}></i>
                                <span>{file.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">生成设置</label>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                            <div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                                <input type="checkbox" id="gen-title" defaultChecked style={{marginRight: '8px'}} />
                                <label htmlFor="gen-title">生成商品标题</label>
                            </div>
                            <div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                                <input type="checkbox" id="gen-copy" defaultChecked style={{marginRight: '8px'}} />
                                <label htmlFor="gen-copy">生成卖点文案</label>
                            </div>
                            <div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                                <input type="checkbox" id="gen-image" style={{marginRight: '8px'}} />
                                <label htmlFor="gen-image">生成商品主图</label>
                            </div>
                            <div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                                <input type="checkbox" id="gen-keywords" defaultChecked style={{marginRight: '8px'}} />
                                <label htmlFor="gen-keywords">生成关键词</label>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary btn-generate"
                        onClick={startBatchGenerate}
                        disabled={generating || !file}
                    >
                        {generating ? (
                            <>
                                <span className="loading-spinner"></span>
                                <span>生成中 {progress}%</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-play"></i>
                                <span>开始批量生成</span>
                            </>
                        )}
                    </button>

                    {generating && (
                        <div style={{marginTop: '20px'}}>
                            <div style={{height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                                <div style={{height: '100%', width: `${progress}%`, background: '#4f46e5', transition: 'width 0.3s'}}></div>
                            </div>
                            <p style={{textAlign: 'center', marginTop: '8px', color: '#6b7280'}}>正在生成第 {Math.ceil(progress / 10)} / 10 个商品...</p>
                        </div>
                    )}

                    {results.length > 0 && !generating && (
                        <div style={{marginTop: '24px'}}>
                            <h4 style={{marginBottom: '16px'}}>生成结果 ({results.length}个商品)</h4>
                            <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                                {results.map(item => (
                                    <div key={item.id} style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px', background: 'white'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                            <div>
                                                <strong style={{fontSize: '16px'}}>{item.name}</strong>
                                                <span style={{color: '#9ca3af', fontSize: '12px', marginLeft: '8px'}}>[{item.category}]</span>
                                            </div>
                                            <span style={{color: '#10b981', fontSize: '14px'}}><i className="fas fa-check-circle"></i> 完成</span>
                                        </div>
                                        
                                        {/* 简略信息 */}
                                        <div style={{marginBottom: '12px'}}>
                                            <p style={{color: '#374151', fontSize: '14px', marginBottom: '4px', fontWeight: '500'}}>标题：{item.title}</p>
                                            <p style={{color: '#6b7280', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>文案：{item.copy}</p>
                                        </div>

                                        {/* 展开/收起按钮 */}
                                        <button 
                                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#4f46e5',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <i className={`fas fa-chevron-${expandedItem === item.id ? 'up' : 'down'}`}></i>
                                            {expandedItem === item.id ? '收起详情' : '查看完整内容'}
                                        </button>

                                        {/* 展开后的详细内容 */}
                                        {expandedItem === item.id && (
                                            <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
                                                {/* 商品图片 */}
                                                {item.image && (
                                                    <div style={{marginBottom: '16px'}}>
                                                        <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-image"></i> 商品图片</h5>
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: '300px',
                                                                height: 'auto',
                                                                borderRadius: '8px',
                                                                display: 'block'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div style={{marginBottom: '16px'}}>
                                                    <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-heading"></i> 商品标题</h5>
                                                    <p style={{color: '#374151', fontSize: '14px', padding: '12px', background: '#f9fafb', borderRadius: '6px'}}>{item.title}</p>
                                                </div>
                                                
                                                <div style={{marginBottom: '16px'}}>
                                                    <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-comment-dots"></i> 卖点文案</h5>
                                                    <p style={{color: '#374151', fontSize: '14px', padding: '12px', background: '#f9fafb', borderRadius: '6px', lineHeight: '1.6'}}>{item.copy}</p>
                                                </div>

                                                <div style={{marginBottom: '16px'}}>
                                                    <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-align-left"></i> 详细描述</h5>
                                                    <p style={{color: '#374151', fontSize: '14px', padding: '12px', background: '#f9fafb', borderRadius: '6px', lineHeight: '1.6'}}>{item.description}</p>
                                                </div>

                                                <div style={{marginBottom: '16px'}}>
                                                    <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-list-check"></i> 卖点列表</h5>
                                                    <ul style={{color: '#374151', fontSize: '14px', padding: '12px', background: '#f9fafb', borderRadius: '6px', listStyle: 'none', paddingLeft: '12px'}}>
                                                        {item.sellingPoints.map((point, idx) => (
                                                            <li key={idx} style={{marginBottom: '4px'}}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h5 style={{color: '#4f46e5', marginBottom: '8px', fontSize: '14px'}}><i className="fas fa-tags"></i> 关键词</h5>
                                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                                        {item.keywords.map((keyword, idx) => (
                                                            <span key={idx} style={{padding: '4px 12px', background: '#eef2ff', color: '#4f46e5', borderRadius: '4px', fontSize: '12px'}}>{keyword}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                                                    <button 
                                                        className="btn btn-primary"
                                                        onClick={() => navigator.clipboard.writeText(`${item.title}\n\n${item.copy}\n\n${item.description}`)}
                                                        style={{flex: 1}}
                                                    >
                                                        <i className="fas fa-copy"></i> 复制全部文案
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline" style={{width: '100%', marginTop: '16px'}}>
                                <i className="fas fa-download"></i> 导出全部结果
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== AI智能润色页面 ====================
const AIPolishPage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [originalText, setOriginalText] = useState('');
    const [polishing, setPolishing] = useState(false);
    const [polishedResults, setPolishedResults] = useState([]);
    const [error, setError] = useState('');

    const polishStyles = [
        { id: 'attractive', label: '更吸引人', icon: 'fa-magic', description: '让标题更有冲击力，提高点击率' },
        { id: 'professional', label: '更专业', icon: 'fa-briefcase', description: '提升文案专业度，增强信任感' },
        { id: 'vivid', label: '更生动', icon: 'fa-palette', description: '增加画面感，让描述更形象' },
        { id: 'concise', label: '更简洁', icon: 'fa-compress', description: '精简表达，突出核心卖点' },
    ];

    const [selectedStyle, setSelectedStyle] = useState('attractive');

    const startPolish = async () => {
        if (!originalText.trim()) {
            setError('请输入需要润色的文案');
            return;
        }

        setPolishing(true);
        setError('');
        setPolishedResults([]);

        try {
            // 调用 DeepSeek API 进行润色
            const apiKey = getApiKey();
            const stylePrompts = {
                attractive: '让这段文案更吸引人、更有营销感，提高转化率',
                professional: '让这段文案更专业、更有权威性，增强信任感',
                vivid: '让这段文案更生动形象，增加画面感和感染力',
                concise: '精简这段文案，突出核心卖点，更简洁有力'
            };

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "你是一位资深的电商文案策划专家，擅长优化商品文案。"},
                        {"role": "user", "content": `请优化以下商品文案，${stylePrompts[selectedStyle]}。直接给出3个不同版本的优化结果，每个版本用序号标注：\n\n${originalText}`}
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0]?.message?.content;
                if (content) {
                    const versions = content.split(/\d+\.|版本\s*\d+/).filter(v => v.trim());
                    setPolishedResults(versions.slice(0, 3));
                }
            } else {
                // API失败时使用模拟数据
                const mockResults = [
                    `${originalText} - 优化版本1：突出品质与性价比`,
                    `${originalText} - 优化版本2：强调使用场景与体验`,
                    `${originalText} - 优化版本3：营造紧迫感与稀缺性`
                ];
                setPolishedResults(mockResults);
            }
        } catch (err) {
            console.error('润色失败:', err);
            setError('润色失败，请稍后重试');
        } finally {
            setPolishing(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert('已复制到剪贴板');
    };

    return (
        <div className="poster-page">
            <div className="poster-header">
                <button className="btn btn-outline" onClick={() => setPage('home')}>
                    <i className="fas fa-arrow-left"></i> 返回首页
                </button>
                <h1><i className="fas fa-brain"></i> AI智能润色</h1>
                <p>基于大模型的文案生成，标题更吸引人，卖点更有感染力</p>
            </div>

            <div className="poster-container">
                <div className="poster-form">
                    <div className="form-group">
                        <label className="form-label">原始文案</label>
                        <textarea 
                            className="form-textarea" 
                            placeholder="粘贴你需要优化的商品标题或文案..."
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                            rows={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">选择润色风格</label>
                        <div className="style-options">
                            {polishStyles.map(style => (
                                <div 
                                    key={style.id}
                                    className={`style-option ${selectedStyle === style.id ? 'active' : ''}`}
                                    onClick={() => setSelectedStyle(style.id)}
                                >
                                    <i className={`fas ${style.icon}`}></i>
                                    <div className="style-label">{style.label}</div>
                                    <div className="style-desc">{style.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="error-message" style={{marginBottom: '16px'}}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-generate"
                        onClick={startPolish}
                        disabled={polishing}
                    >
                        {polishing ? (
                            <>
                                <span className="loading-spinner"></span>
                                <span>AI润色中...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-magic"></i>
                                <span>开始润色</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="poster-preview">
                    <div className="preview-title">
                        <i className="fas fa-sparkles"></i> 润色结果
                    </div>
                    
                    {polishing ? (
                        <div className="generating-state">
                            <div className="loading-spinner large"></div>
                            <p>AI正在优化文案...</p>
                        </div>
                    ) : polishedResults.length > 0 ? (
                        <div className="generated-result">
                            {polishedResults.map((result, index) => (
                                <div key={index} className="copy-card" style={{marginBottom: '16px'}}>
                                    <div className="copy-card-label" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span>优化版本 {index + 1}</span>
                                        <button 
                                            className="btn btn-outline" 
                                            onClick={() => handleCopy(result)}
                                            style={{padding: '4px 12px', fontSize: '12px'}}
                                        >
                                            <i className="fas fa-copy"></i> 复制
                                        </button>
                                    </div>
                                    <div className="copy-card-content">{result}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-preview">
                            <i className="fas fa-pen-fancy"></i>
                            <p>输入文案并点击"开始润色"</p>
                            <span>AI将为你生成3个优化版本</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== AI海报生成页面 ====================
const PosterPage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [posterPrompt, setPosterPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('ecommerce');
    const [generating, setGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState('');

    // 海报风格选项
    const styleOptions = [
        { id: 'ecommerce', label: '电商风格', icon: 'fa-shopping-bag', description: '适合商品展示，突出产品特点' },
        { id: 'fresh', label: '清新风格', icon: 'fa-leaf', description: '简约清新，适合美妆、食品类目' },
        { id: 'promotion', label: '促销风格', icon: 'fa-tags', description: '醒目促销，适合活动、大促场景' },
        { id: 'luxury', label: '高端风格', icon: 'fa-gem', description: '奢华质感，适合奢侈品、高端商品' },
    ];

    // 模拟生成海报设计方案（当API不可用时使用）
    const generateMockPoster = () => {
        const styleNames = {
            ecommerce: '电商风格',
            fresh: '清新风格',
            promotion: '促销风格',
            luxury: '高端风格'
        };

        const mockDesigns = {
            ecommerce: `1. 海报标题：限时特惠 抢鲜购

2. 主文案：品质好物，限时低价，错过再等一年！

3. 副文案：全场包邮 · 7天无理由退换

4. 视觉设计建议：
   - 布局：商品居中展示，价格标签醒目放置
   - 元素：添加购物车图标、倒计时元素
   - 背景：简洁白色或浅灰色，突出商品

5. 配色方案：
   - 主色：橙色 (#FF6B35) - 吸引注意力
   - 辅助色：白色 (#FFFFFF) - 简洁干净
   - 强调色：深灰 (#333333) - 文字清晰`,

            fresh: `1. 海报标题：自然清新 美好时光

2. 主文案：源自自然，清新每一刻，让生活更美好

3. 副文案：天然成分 · 温和呵护

4. 视觉设计建议：
   - 布局：商品与自然元素结合，留白充足
   - 元素：添加植物、花朵、阳光等自然元素
   - 背景：渐变色或自然场景，营造清新感

5. 配色方案：
   - 主色：薄荷绿 (#98D8C8) - 清新自然
   - 辅助色：米白 (#F5F5DC) - 温暖舒适
   - 强调色：淡粉 (#FFB6C1) - 柔和点缀`,

            promotion: `1. 海报标题：大促狂欢 全场5折

2. 主文案：年度最大优惠，限时抢购，手慢无！

3. 副文案：满199减50 · 优惠券叠加

4. 视觉设计建议：
   - 布局：大字报风格，信息层级分明
   - 元素：爆炸贴、优惠券、红包等促销元素
   - 背景：鲜艳色彩，营造紧迫感

5. 配色方案：
   - 主色：红色 (#FF0000) - 醒目促销
   - 辅助色：黄色 (#FFD700) - 吸引眼球
   - 强调色：黑色 (#000000) - 对比强烈`,

            luxury: `1. 海报标题：尊享奢华 品质之选

2. 主文案：匠心工艺，非凡品质，彰显独特品味

3. 副文案：限量发售 · 专属定制

4. 视觉设计建议：
   - 布局：简约大气，大量留白，突出品质感
   - 元素：金属质感、光影效果、品牌logo
   - 背景：深色或纯色，营造高级感

5. 配色方案：
   - 主色：金色 (#D4AF37) - 奢华尊贵
   - 辅助色：黑色 (#000000) - 经典优雅
   - 强调色：深灰 (#4A4A4A) - 沉稳大气`
        };

        return {
            style: styleNames[selectedStyle],
            designPlan: mockDesigns[selectedStyle]
        };
    };

    // 生成海报设计方案和示例图
    // 使用Canvas生成真实海报
    const generateRealPoster = async (designData) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const width = 800;
            const height = 1000;
            canvas.width = width;
            canvas.height = height;

            // 根据风格设置配色
            const styleColors = {
                ecommerce: { bg: '#ffffff', primary: '#ff6b35', secondary: '#333333', accent: '#f0f0f0' },
                fresh: { bg: '#f0f9f4', primary: '#98d8c8', secondary: '#2d6a4f', accent: '#e8f5e9' },
                promotion: { bg: '#fff5f5', primary: '#ff0000', secondary: '#333333', accent: '#ffd700' },
                luxury: { bg: '#1a1a1a', primary: '#d4af37', secondary: '#ffffff', accent: '#333333' }
            };

            const colors = styleColors[selectedStyle];

            // 绘制背景
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            // 绘制装饰元素
            ctx.fillStyle = colors.accent;
            ctx.fillRect(0, 0, width, 300);

            // 绘制标题背景
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.moveTo(0, 250);
            ctx.quadraticCurveTo(width / 2, 320, width, 250);
            ctx.lineTo(width, 300);
            ctx.lineTo(0, 300);
            ctx.closePath();
            ctx.fill();

            // 绘制标题
            ctx.fillStyle = colors.secondary;
            ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            const title = designData.title || '限时特惠';
            ctx.fillText(title, width / 2, 180);

            // 绘制主文案
            ctx.font = '32px "Microsoft YaHei", sans-serif';
            ctx.fillStyle = colors.secondary;
            const mainText = designData.mainText || '品质好物，限时低价';
            // 处理文字换行
            const words = mainText.split('');
            let line = '';
            let y = 400;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 700 && i > 0) {
                    ctx.fillText(line, width / 2, y);
                    line = words[i];
                    y += 45;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, width / 2, y);

            // 绘制副文案
            ctx.font = '24px "Microsoft YaHei", sans-serif';
            ctx.fillStyle = '#666666';
            const subText = designData.subText || '全场包邮 · 7天无理由退换';
            ctx.fillText(subText, width / 2, y + 60);

            // 绘制商品图片区域（占位）
            ctx.fillStyle = colors.accent;
            ctx.fillRect(150, y + 100, 500, 300);
            ctx.fillStyle = '#999999';
            ctx.font = '20px "Microsoft YaHei", sans-serif';
            ctx.fillText('商品图片区域', width / 2, y + 250);

            // 绘制价格标签
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.ellipse(width / 2, y + 450, 100, 40, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
            ctx.fillText('立即购买', width / 2, y + 460);

            // 绘制底部信息
            ctx.fillStyle = colors.secondary;
            ctx.font = '18px "Microsoft YaHei", sans-serif';
            ctx.fillText('扫码了解更多详情', width / 2, height - 80);

            // 绘制二维码占位
            ctx.fillStyle = colors.accent;
            ctx.fillRect(width / 2 - 40, height - 70, 80, 80);

            // 转换为图片
            try {
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (err) {
                reject(err);
            }
        });
    };

    const generatePoster = async () => {
        if (!posterPrompt.trim()) {
            setError('请输入海报主题或商品描述');
            return;
        }

        setGenerating(true);
        setError('');
        setGeneratedImage(null);

        try {
            // 根据风格构建提示词
            const styleNames = {
                ecommerce: '电商风格',
                fresh: '清新风格',
                promotion: '促销风格',
                luxury: '高端风格'
            };

            const fullPrompt = `请为以下商品设计一个${styleNames[selectedStyle]}的营销海报方案：${posterPrompt}。
请提供（用JSON格式）：
{
  "title": "海报标题（10字以内）",
  "mainText": "主文案（30字以内）",
  "subText": "副文案（20字以内）"
}`;

            // 调用 DeepSeek API 生成海报文案
            const apiKey = getApiKey();
            let designData = {
                title: '限时特惠',
                mainText: '品质好物，限时低价，错过再等一年！',
                subText: '全场包邮 · 7天无理由退换'
            };
            
            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": "你是一位资深的电商海报设计师，请用JSON格式返回海报文案。"},
                            {"role": "user", "content": fullPrompt}
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices[0]?.message?.content;
                    // 尝试解析JSON
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        designData = JSON.parse(jsonMatch[0]);
                    }
                }
            } catch (apiErr) {
                console.log('API调用失败，使用默认文案:', apiErr);
            }
            
            // 使用Canvas生成海报
            const posterUrl = await generateRealPoster(designData);
            
            setGeneratedImage({
                url: posterUrl,
                designPlan: `海报设计方案：\n\n标题：${designData.title}\n主文案：${designData.mainText}\n副文案：${designData.subText}\n\n风格：${styleNames[selectedStyle]}`
            });

            // 保存到历史记录
            if (addToHistory) {
                addToHistory({
                    type: 'poster',
                    title: `${posterPrompt}海报生成`,
                    content: designData.mainText,
                    productInfo: { name: posterPrompt, category: '海报', image: posterUrl },
                });
            }
            
        } catch (err) {
            console.error('生成海报失败:', err);
            setError(`生成失败: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    // 下载图片
    const downloadImage = async () => {
        if (!generatedImage || !generatedImage.url) return;

        try {
            const response = await fetch(generatedImage.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `海报示例_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('下载失败:', err);
            setError('下载失败，请右键图片另存为');
        }
    };

    return (
        <div className="poster-page">
            <div className="poster-header">
                <button className="btn btn-outline" onClick={() => setPage('home')}>
                    <i className="fas fa-arrow-left"></i> 返回首页
                </button>
                <h1><i className="fas fa-magic"></i> AI海报生成器</h1>
                <p>输入商品描述，选择风格，一键生成专业营销海报</p>
            </div>

            <div className="poster-container">
                <div className="poster-form">
                    <div className="form-group">
                        <label className="form-label">海报主题 / 商品描述</label>
                        <textarea 
                            className="form-textarea" 
                            placeholder="例如：一款有机绿茶，清新自然，适合年轻人饮用"
                            value={posterPrompt}
                            onChange={(e) => setPosterPrompt(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">选择海报风格</label>
                        <div className="style-options">
                            {styleOptions.map(style => (
                                <div 
                                    key={style.id}
                                    className={`style-option ${selectedStyle === style.id ? 'active' : ''}`}
                                    onClick={() => setSelectedStyle(style.id)}
                                >
                                    <i className={`fas ${style.icon}`}></i>
                                    <div className="style-label">{style.label}</div>
                                    <div className="style-desc">{style.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-generate"
                        onClick={generatePoster}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <span className="loading-spinner"></span>
                                <span>生成中...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-wand-magic-sparkles"></i>
                                <span>生成海报</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="poster-preview">
                    <div className="preview-title">
                        <i className="fas fa-eye"></i> 预览区域
                    </div>
                    
                    {generating ? (
                        <div className="generating-state">
                            <div className="loading-spinner large"></div>
                            <p>AI正在创作海报方案，请稍候...</p>
                            <span className="generating-hint">预计需要 10-20 秒</span>
                        </div>
                    ) : generatedImage ? (
                        <div className="generated-result">
                            <div className="poster-image-container">
                                <img 
                                    src={generatedImage.url} 
                                    alt="海报示例" 
                                    className="poster-image" 
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/1024x1024/4f46e5/ffffff?text=海报示例图';
                                    }}
                                />
                            </div>
                            <div className="design-plan">
                                <h4><i className="fas fa-lightbulb"></i> AI设计方案</h4>
                                <pre className="design-content">{generatedImage.designPlan}</pre>
                            </div>
                            <div className="poster-actions">
                                <button className="btn btn-primary" onClick={downloadImage}>
                                    <i className="fas fa-download"></i> 下载示例图
                                </button>
                                <button className="btn btn-outline" onClick={() => setGeneratedImage(null)}>
                                    <i className="fas fa-redo"></i> 重新生成
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-preview">
                            <i className="fas fa-image"></i>
                            <p>海报将在这里显示</p>
                            <span>输入描述并点击生成按钮</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== 个人中心页面 ====================
const ProfilePage = ({ addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [activeMenu, setActiveMenu] = useState('overview');

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">U</div>
                <div className="profile-info">
                    <h2>用户昵称</h2>
                    <p>user@example.com · 高级会员</p>
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <div className="profile-stat-value">156</div>
                            <div className="profile-stat-label">生成素材</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">12</div>
                            <div className="profile-stat-label">保存模板</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">8</div>
                            <div className="profile-stat-label">批量任务</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-content">
                <div className="profile-menu">
                    <div className={`menu-item ${activeMenu === 'overview' ? 'active' : ''}`} onClick={() => setActiveMenu('overview')}>
                        <i className="fas fa-chart-pie"></i> 概览
                    </div>
                    <div className={`menu-item ${activeMenu === 'history' ? 'active' : ''}`} onClick={() => setActiveMenu('history')}>
                        <i className="fas fa-history"></i> 生成记录
                    </div>
                    <div className={`menu-item ${activeMenu === 'templates' ? 'active' : ''}`} onClick={() => setActiveMenu('templates')}>
                        <i className="fas fa-bookmark"></i> 我的模板
                    </div>
                    <div className={`menu-item ${activeMenu === 'settings' ? 'active' : ''}`} onClick={() => setActiveMenu('settings')}>
                        <i className="fas fa-cog"></i> 账号设置
                    </div>
                </div>
                <div className="panel">
                    {activeMenu === 'overview' && (
                        <div>
                            <div className="panel-title"><i className="fas fa-chart-line"></i> 使用统计</div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24}}>
                                <div className="copy-card">
                                    <div className="copy-card-label">本月生成素材</div>
                                    <div className="copy-card-content title" style={{fontSize: 32, color: '#4f46e5'}}>48</div>
                                </div>
                                <div className="copy-card">
                                    <div className="copy-card-label">节省的时间（小时）</div>
                                    <div className="copy-card-content title" style={{fontSize: 32, color: '#10b981'}}>12.5</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeMenu === 'history' && (
                        <div>
                            <div className="panel-title"><i className="fas fa-history"></i> 最近生成记录</div>
                            <div className="batch-list">
                                {['防水运动背包', '纯棉T恤', '真皮钱包'].map((name, i) => (
                                    <div key={i} className="batch-item">
                                        <div className="batch-item-index">{i + 1}</div>
                                        <div className="batch-item-info">
                                            <div className="batch-item-name">{name}</div>
                                            <div className="batch-item-meta">2024-01-{15-i} · 批量生成任务 #{i+1}</div>
                                        </div>
                                        <div className="batch-item-status success">已完成</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeMenu === 'templates' && (
                        <div>
                            <div className="panel-title"><i className="fas fa-bookmark"></i> 我的模板</div>
                            <div className="empty-state" style={{padding: 40}}>
                                <i className="fas fa-folder-open"></i>
                                <div className="empty-state-text">暂无保存的模板<br />在生成素材时可以保存为模板</div>
                            </div>
                        </div>
                    )}
                    {activeMenu === 'settings' && (
                        <div>
                            <div className="panel-title"><i className="fas fa-cog"></i> 账号设置</div>
                            <FormInput label="昵称" value="用户昵称" onChange={() => {}} />
                            <FormInput label="邮箱" value="user@example.com" onChange={() => {}} />
                            <button className="btn btn-primary" style={{width: 'auto', marginTop: 16}}>
                                <i className="fas fa-save"></i> 保存修改
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== 模板管理页面 ====================
const TemplatesManagePage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const [templates, setTemplates] = useState([
        { id: 1, name: '爆款商品模板', category: '服装', createdAt: '2024-01-15', usageCount: 23 },
        { id: 2, name: '促销海报模板', category: '美妆', createdAt: '2024-01-10', usageCount: 15 },
        { id: 3, name: '新品上架模板', category: '数码', createdAt: '2024-01-05', usageCount: 8 },
    ]);

    return (
        <div className="poster-page">
            <div className="poster-header">
                <button className="btn btn-outline" onClick={() => setPage('home')}>
                    <i className="fas fa-arrow-left"></i> 返回首页
                </button>
                <h1><i className="fas fa-bookmark"></i> 模板管理</h1>
                <p>保存满意的生成结果作为模板，下次上新直接套用</p>
            </div>

            <div className="poster-container" style={{gridTemplateColumns: '1fr'}}>
                <div className="poster-form">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                        <h3>我的模板 ({templates.length})</h3>
                        <button className="btn btn-primary">
                            <i className="fas fa-plus"></i> 新建模板
                        </button>
                    </div>

                    <div style={{display: 'grid', gap: '16px'}}>
                        {templates.map(template => (
                            <div key={template.id} style={{padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <h4 style={{marginBottom: '8px'}}>{template.name}</h4>
                                    <p style={{color: '#6b7280', fontSize: '14px'}}>
                                        <span style={{marginRight: '16px'}}><i className="fas fa-tag"></i> {template.category}</span>
                                        <span style={{marginRight: '16px'}}><i className="fas fa-calendar"></i> {template.createdAt}</span>
                                        <span><i className="fas fa-play"></i> 使用 {template.usageCount} 次</span>
                                    </p>
                                </div>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button className="btn btn-outline" style={{padding: '8px 16px'}}>
                                        <i className="fas fa-edit"></i> 编辑
                                    </button>
                                    <button className="btn btn-primary" style={{padding: '8px 16px'}}>
                                        <i className="fas fa-play"></i> 使用
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== 数据追踪页面 ====================
const AnalyticsPage = ({ setPage, addToHistory, refreshHistory, showToast, setIsLoading }) => {
    const stats = [
        { label: '生成素材总数', value: 128, icon: 'fa-image', color: '#4f46e5' },
        { label: '本月生成', value: 45, icon: 'fa-chart-line', color: '#10b981' },
        { label: '平均生成时间', value: '2.3s', icon: 'fa-clock', color: '#f59e0b' },
        { label: '收藏模板', value: 12, icon: 'fa-bookmark', color: '#ef4444' },
    ];

    const recentActivities = [
        { id: 1, action: '生成商品文案', item: '冬季羽绒服', time: '2分钟前', type: 'success' },
        { id: 2, action: '创建海报', item: '新年促销活动', time: '1小时前', type: 'success' },
        { id: 3, action: '保存模板', item: '爆款商品模板', time: '3小时前', type: 'info' },
        { id: 4, action: '批量生成', item: '10个商品', time: '昨天', type: 'success' },
        { id: 5, action: '润色文案', item: '运动鞋描述', time: '2天前', type: 'success' },
    ];

    return (
        <div className="poster-page">
            <div className="poster-header">
                <button className="btn btn-outline" onClick={() => setPage('home')}>
                    <i className="fas fa-arrow-left"></i> 返回首页
                </button>
                <h1><i className="fas fa-chart-line"></i> 数据追踪</h1>
                <p>记录每个素材的使用情况，优化高转化文案策略</p>
            </div>

            <div className="poster-container" style={{gridTemplateColumns: '1fr'}}>
                <div className="poster-form">
                    {/* 统计卡片 */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px'}}>
                        {stats.map((stat, index) => (
                            <div key={index} style={{padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center'}}>
                                <i className={`fas ${stat.icon}`} style={{fontSize: '32px', color: stat.color, marginBottom: '12px'}}></i>
                                <div style={{fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px'}}>{stat.value}</div>
                                <div style={{color: '#6b7280', fontSize: '14px'}}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* 最近活动 */}
                    <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px'}}>
                        <h3 style={{marginBottom: '20px'}}><i className="fas fa-history"></i> 最近活动</h3>
                        <div style={{display: 'grid', gap: '12px'}}>
                            {recentActivities.map(activity => (
                                <div key={activity.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                        <div style={{
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            background: activity.type === 'success' ? '#10b981' : '#4f46e5'
                                        }}></div>
                                        <div>
                                            <span style={{fontWeight: '500'}}>{activity.action}</span>
                                            <span style={{color: '#6b7280', margin: '0 8px'}}>·</span>
                                            <span style={{color: '#374151'}}>{activity.item}</span>
                                        </div>
                                    </div>
                                    <span style={{color: '#9ca3af', fontSize: '14px'}}>{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== 历史记录侧边栏组件 ====================
const HistorySidebar = ({ 
    isOpen, 
    onToggle, 
    onSelectItem, 
    currentItemId,
    refreshTrigger 
}) => {
    const [history, setHistory] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    // 加载历史记录
    useEffect(() => {
        if (typeof HistoryManager !== 'undefined') {
            let data = HistoryManager.getHistory();
            
            // 应用筛选
            if (filterType !== 'all') {
                data = HistoryManager.filterHistoryByType(filterType);
            }
            
            // 应用搜索
            if (searchKeyword.trim()) {
                data = HistoryManager.searchHistory(searchKeyword);
            }
            
            setHistory(data);
        }
    }, [refreshTrigger, searchKeyword, filterType]);
    
    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.deleteHistoryItem(id);
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const handleClearAll = () => {
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            if (typeof HistoryManager !== 'undefined') {
                HistoryManager.clearHistory();
                setHistory([]);
            }
        }
    };

    // 导出历史记录为JSON
    const handleExport = () => {
        if (typeof HistoryManager !== 'undefined') {
            const data = HistoryManager.getHistory();
            if (data.length === 0) {
                alert('没有可导出的历史记录');
                return;
            }
            const exportData = {
                version: '1.0',
                exportTime: new Date().toISOString(),
                data: data
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `douyin-copy-history-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // 导入历史记录
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                if (importData.data && Array.isArray(importData.data)) {
                    if (typeof HistoryManager !== 'undefined') {
                        // 合并导入的数据
                        const existingData = HistoryManager.getHistory();
                        const mergedData = [...importData.data, ...existingData];
                        // 去重（基于id）
                        const uniqueData = mergedData.filter((item, index, self) =>
                            index === self.findIndex((t) => t.id === item.id)
                        );
                        // 按时间排序
                        uniqueData.sort((a, b) => b.timestamp - a.timestamp);
                        localStorage.setItem('douyin_copy_history', JSON.stringify(uniqueData));
                        setHistory(uniqueData);
                        alert(`成功导入 ${importData.data.length} 条历史记录`);
                    }
                } else {
                    alert('文件格式不正确');
                }
            } catch (err) {
                alert('导入失败：' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // 重置input
    };
    
    const getTypeIcon = (type) => {
        switch (type) {
            case 'copy': return 'fa-file-alt';
            case 'tiktok': return 'fa-video';
            case 'poster': return 'fa-image';
            default: return 'fa-file';
        }
    };
    
    const getTypeLabel = (type) => {
        switch (type) {
            case 'copy': return '文案';
            case 'tiktok': return '抖音';
            case 'poster': return '海报';
            default: return '其他';
        }
    };
    
    const formatTime = (timestamp) => {
        if (typeof HistoryManager !== 'undefined') {
            return HistoryManager.formatTime(timestamp);
        }
        return timestamp;
    };
    
    return (
        <>
            {/* 切换按钮 */}
            <button 
                className={`history-toggle ${!isOpen ? 'collapsed' : ''}`}
                onClick={onToggle}
                title={isOpen ? '收起历史记录' : '展开历史记录'}
            >
                <i className={`fas fa-chevron-${isOpen ? 'right' : 'left'}`}></i>
                {history.length > 0 && !isOpen && (
                    <span className="history-badge">{history.length > 99 ? '99+' : history.length}</span>
                )}
            </button>
            
            {/* 侧边栏 */}
            <div className={`history-sidebar ${!isOpen ? 'collapsed' : ''}`}>
                <div className="history-header">
                    <span className="history-title">
                        <i className="fas fa-history"></i> 历史记录
                    </span>
                    <div className="history-actions">
                        <button className="history-btn" onClick={handleExport} title="导出历史">
                            <i className="fas fa-download"></i>
                        </button>
                        <label className="history-btn" title="导入历史" style={{cursor: 'pointer'}}>
                            <i className="fas fa-upload"></i>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{display: 'none'}}
                            />
                        </label>
                        <button className="history-btn" onClick={handleClearAll} title="清空历史">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                {/* 搜索框 */}
                <div className="history-search">
                    <input
                        type="text"
                        className="history-search-input"
                        placeholder="搜索历史记录..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </div>
                
                {/* 筛选按钮 */}
                <div className="history-filter">
                    {[
                        { key: 'all', label: '全部' },
                        { key: 'copy', label: '文案' },
                        { key: 'tiktok', label: '抖音' },
                        { key: 'poster', label: '海报' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`history-filter-btn ${filterType === key ? 'active' : ''}`}
                            onClick={() => setFilterType(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                
                {/* 历史列表 */}
                <div className="history-list">
                    {history.length === 0 ? (
                        <div className="history-empty">
                            <i className="fas fa-inbox"></i>
                            <p>暂无历史记录</p>
                            <p style={{fontSize: '12px', marginTop: '8px'}}>生成的文案将自动保存到这里</p>
                        </div>
                    ) : (
                        history.map(item => (
                            <div
                                key={item.id}
                                className={`history-item ${currentItemId === item.id ? 'active' : ''}`}
                                onClick={() => onSelectItem(item)}
                                style={{position: 'relative'}}
                            >
                                <div className="history-item-header">
                                    <span className={`history-item-type ${item.type}`}>
                                        <i className={`fas ${getTypeIcon(item.type)}`}></i>
                                        {getTypeLabel(item.type)}
                                    </span>
                                    <span className="history-item-time">{formatTime(item.timestamp)}</span>
                                </div>
                                <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '8px'}}>
                                    {/* 商品图片 - 使用state来控制显示/隐藏 */}
                                    <div style={{position: 'relative', width: '50px', height: '50px', flexShrink: 0}}>
                                        {item.productInfo?.image && (
                                            <img 
                                                src={item.productInfo.image} 
                                                alt={item.productInfo.name}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        {/* 占位符 - 当没有图片或图片加载失败时显示 */}
                                        <div 
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '8px',
                                                background: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                color: '#9ca3af'
                                            }}
                                        >
                                            <i className="fas fa-image"></i>
                                        </div>
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div className="history-item-title" style={{marginBottom: '4px'}}>{item.title}</div>
                                        <div className="history-item-preview" style={{fontSize: '12px'}}>
                                            {item.productInfo?.name || '无商品信息'}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="history-btn" 
                                    onClick={(e) => handleDelete(e, item.id)}
                                    style={{position: 'absolute', right: '8px', top: '8px'}}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

// ==================== 主应用 ====================
// ==================== 新手引导组件 ====================
const OnboardingGuide = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 检查是否是首次访问
        const hasSeenGuide = localStorage.getItem('douyin_copy_guide_seen');
        if (!hasSeenGuide) {
            setIsVisible(true);
        }
    }, []);

    const steps = [
        {
            title: '欢迎使用电商素材工作台',
            content: '这里可以帮助你快速生成抖音文案、商品海报和营销素材。',
            icon: 'fa-rocket',
            position: 'center'
        },
        {
            title: '工作台',
            content: '在「工作台」页面，输入商品信息即可一键生成专业文案。',
            icon: 'fa-pen-fancy',
            position: 'nav-workspace'
        },
        {
            title: 'AI海报生成',
            content: '使用「AI海报」功能，输入商品描述即可生成精美海报。',
            icon: 'fa-image',
            position: 'nav-poster'
        },
        {
            title: '批量导入',
            content: '支持Excel批量导入，一次性生成多个商品的文案。',
            icon: 'fa-file-excel',
            position: 'nav-batch'
        },
        {
            title: '历史记录',
            content: '所有生成的内容都会自动保存，随时查看和继续编辑。',
            icon: 'fa-history',
            position: 'sidebar'
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('douyin_copy_guide_seen', 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const currentStep = steps[step];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.3s ease'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: '36px',
                    color: 'white'
                }}>
                    <i className={`fas ${currentStep.icon}`}></i>
                </div>
                
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    color: '#1f2937'
                }}>
                    {currentStep.title}
                </h2>
                
                <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    {currentStep.content}
                </p>

                {/* 步骤指示器 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '32px'
                }}>
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: index === step ? '#4f46e5' : '#e5e7eb',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: '#6b7280',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            上一步
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        style={{
                            padding: '12px 32px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            flex: step === 0 ? 1 : 'none'
                        }}
                    >
                        {step === steps.length - 1 ? '开始使用' : '下一步'}
                    </button>
                </div>

                {step < steps.length - 1 && (
                    <button
                        onClick={handleSkip}
                        style={{
                            marginTop: '16px',
                            padding: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#9ca3af',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        跳过引导
                    </button>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [currentPage, setPage] = useState('home');
    const [templateData, setTemplateData] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(true);
    const [historyRefresh, setHistoryRefresh] = useState(0);
    const [currentHistoryId, setCurrentHistoryId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [historyDetailItem, setHistoryDetailItem] = useState(null);
    const [showGuide, setShowGuide] = useState(false);
    const { showToast, ToastComponent } = useToast();

    // 初始化 Mock 数据
    useEffect(() => {
        if (typeof MockData !== 'undefined') {
            MockData.initMockData();
        }
        // 检查是否需要显示引导
        const hasSeenGuide = localStorage.getItem('douyin_copy_guide_seen');
        if (!hasSeenGuide) {
            setShowGuide(true);
        }
    }, []);

    // 安全的页面跳转函数
    const safeSetPage = (page) => {
        const validPages = ['home', 'workspace', 'templates', 'profile', 'poster', 'batch', 'polish', 'templates-manage', 'analytics'];
        if (validPages.includes(page)) {
            setPage(page);
        } else {
            console.warn(`页面 "${page}" 不存在，跳转到首页`);
            setPage('home');
        }
    };

    // 刷新历史记录
    const refreshHistory = () => {
        setHistoryRefresh(prev => prev + 1);
    };

    // 选择历史记录项 - 显示详情弹窗
    const handleSelectHistoryItem = (item) => {
        console.log('点击历史记录项:', item);
        setCurrentHistoryId(item.id);
        setHistoryDetailItem(item);
    };

    // 关闭历史记录详情弹窗
    const closeHistoryDetail = () => {
        setHistoryDetailItem(null);
    };

    // 从历史记录继续编辑
    const continueFromHistory = (item) => {
        setHistoryDetailItem(null);
        // 根据类型跳转到相应页面
        switch (item.type) {
            case 'copy':
            case 'tiktok':
                // 将历史记录数据传递给工作台
                if (item.productInfo) {
                    setTemplateData({
                        name: item.productInfo.name,
                        category: item.productInfo.category,
                        material: item.productInfo.material,
                        color: item.productInfo.color,
                        features: item.productInfo.features,
                        image: item.productInfo.image,
                    });
                }
                setPage('workspace');
                break;
            case 'poster':
                setPage('poster');
                break;
            default:
                break;
        }
    };

    // 添加历史记录
    const addToHistory = (item) => {
        if (typeof HistoryManager !== 'undefined') {
            const newItem = HistoryManager.addHistoryItem(item);
            // 延迟刷新以确保 LocalStorage 已更新
            setTimeout(() => {
                refreshHistory();
            }, 100);
            setCurrentHistoryId(newItem.id);
            return newItem;
        }
        return null;
    };

    const renderPage = () => {
        // 传递历史记录相关函数给子页面
        const commonProps = {
            addToHistory,
            refreshHistory,
            showToast,
            setIsLoading,
        };

        switch (currentPage) {
            case 'home': return <HomePage setPage={safeSetPage} {...commonProps} />;
            case 'workspace': return <WorkspacePage templateData={templateData} clearTemplate={() => setTemplateData(null)} {...commonProps} />;
            case 'templates': return <TemplatesPage setPage={safeSetPage} setTemplateData={setTemplateData} {...commonProps} />;
            case 'profile': return <ProfilePage {...commonProps} />;
            case 'poster': return <PosterPage setPage={safeSetPage} {...commonProps} />;
            case 'batch': return <BatchGeneratePage setPage={safeSetPage} {...commonProps} />;
            case 'polish': return <AIPolishPage setPage={safeSetPage} {...commonProps} />;
            case 'templates-manage': return <TemplatesManagePage setPage={safeSetPage} {...commonProps} />;
            case 'analytics': return <AnalyticsPage setPage={safeSetPage} {...commonProps} />;
            default: return (
                <div style={{textAlign: 'center', padding: '100px 20px'}}>
                    <i className="fas fa-exclamation-circle" style={{fontSize: '64px', color: '#ef4444', marginBottom: '20px'}}></i>
                    <h2>页面不存在</h2>
                    <p style={{color: '#6b7280', marginBottom: '24px'}}>您访问的页面 "{currentPage}" 不存在或正在开发中</p>
                    <button className="btn btn-primary" onClick={() => setPage('home')}>
                        <i className="fas fa-home"></i> 返回首页
                    </button>
                </div>
            );
        }
    };

    return (
        <div>
            {/* 新手引导 */}
            {showGuide && <OnboardingGuide onComplete={() => setShowGuide(false)} />}
            
            <Navbar currentPage={currentPage} setPage={setPage} />
            
            {/* Toast 提示 */}
            <ToastComponent />
            
            {/* 全局 Loading */}
            {isLoading && <GlobalLoading />}
            
            {/* 历史记录侧边栏 */}
            <HistorySidebar
                isOpen={historyOpen}
                onToggle={() => setHistoryOpen(!historyOpen)}
                onSelectItem={handleSelectHistoryItem}
                currentItemId={currentHistoryId}
                refreshTrigger={historyRefresh}
            />
            
            {/* 主内容区域 */}
            <div className={`main-content main-content-with-sidebar ${!historyOpen ? 'collapsed' : ''}`}>
                {renderPage()}
            </div>

            {/* 历史记录详情弹窗 */}
            {historyDetailItem && (
                <div 
                    className="modal-overlay" 
                    onClick={closeHistoryDetail}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px'
                    }}
                >
                    <div 
                        className="history-detail-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                    >
                        {/* 弹窗头部 */}
                        <div style={{
                            padding: '24px 24px 16px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    background: historyDetailItem.type === 'copy' ? '#e0e7ff' : 
                                               historyDetailItem.type === 'tiktok' ? '#fce7f3' : '#d1fae5',
                                    color: historyDetailItem.type === 'copy' ? '#4f46e5' : 
                                          historyDetailItem.type === 'tiktok' ? '#ec4899' : '#10b981',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    <i className={`fas ${historyDetailItem.type === 'copy' ? 'fa-file-alt' : 
                                        historyDetailItem.type === 'tiktok' ? 'fa-video' : 'fa-image'}`}></i>
                                    {historyDetailItem.type === 'copy' ? '文案生成' : 
                                     historyDetailItem.type === 'tiktok' ? '抖音文案' : '海报生成'}
                                </span>
                                <h3 style={{margin: 0, fontSize: '20px', fontWeight: '600'}}>{historyDetailItem.title}</h3>
                            </div>
                            <button 
                                onClick={closeHistoryDetail}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '4px',
                                    borderRadius: '8px'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* 弹窗内容 */}
                        <div style={{padding: '24px'}}>
                            {/* 商品信息 */}
                            {historyDetailItem.productInfo && (
                                <div style={{
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{margin: '0 0 12px', fontSize: '14px', color: '#6b7280'}}>商品信息</h4>
                                    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                                        {historyDetailItem.productInfo.image ? (
                                            <img 
                                                src={historyDetailItem.productInfo.image} 
                                                alt={historyDetailItem.productInfo.name}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        {/* 图片加载失败时显示的占位符 */}
                                        <div 
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '8px',
                                                background: '#e5e7eb',
                                                display: historyDetailItem.productInfo.image ? 'none' : 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '32px',
                                                color: '#9ca3af'
                                            }}
                                        >
                                            <i className="fas fa-image"></i>
                                        </div>
                                        <div>
                                            <div style={{fontWeight: '600', fontSize: '16px', marginBottom: '4px'}}>
                                                {historyDetailItem.productInfo.name}
                                            </div>
                                            <div style={{fontSize: '14px', color: '#6b7280'}}>
                                                {historyDetailItem.productInfo.category}
                                                {historyDetailItem.productInfo.material && ` · ${historyDetailItem.productInfo.material}`}
                                                {historyDetailItem.productInfo.color && ` · ${historyDetailItem.productInfo.color}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 生成的内容 */}
                            {(historyDetailItem.copies || historyDetailItem.generated) && (
                                <div style={{marginBottom: '20px'}}>
                                    <h4 style={{margin: '0 0 12px', fontSize: '14px', color: '#6b7280'}}>生成结果</h4>
                                    
                                    {/* 标题 */}
                                    {(historyDetailItem.copies?.title || historyDetailItem.generated?.title) && (
                                        <div style={{
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>商品标题</div>
                                            <div style={{fontWeight: '500'}}>{historyDetailItem.copies?.title || historyDetailItem.generated?.title}</div>
                                        </div>
                                    )}
                                    
                                    {/* 卖点文案 */}
                                    {(historyDetailItem.copies?.sellingPoint || historyDetailItem.generated?.sellingPoint || historyDetailItem.copies?.content) && (
                                        <div style={{
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>卖点文案</div>
                                            <div>{historyDetailItem.copies?.sellingPoint || historyDetailItem.generated?.sellingPoint || historyDetailItem.copies?.content}</div>
                                        </div>
                                    )}
                                    
                                    {/* 关键词 */}
                                    {(historyDetailItem.copies?.keywords || historyDetailItem.generated?.keywords) && (historyDetailItem.copies?.keywords || historyDetailItem.generated?.keywords)?.length > 0 && (
                                        <div style={{
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            padding: '12px 16px'
                                        }}>
                                            <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '8px'}}>关键词</div>
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                                {(historyDetailItem.copies?.keywords || historyDetailItem.generated?.keywords || []).map((keyword, idx) => (
                                                    <span key={idx} style={{
                                                        background: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '16px',
                                                        fontSize: '13px',
                                                        border: '1px solid #e5e7eb'
                                                    }}>{keyword}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 内容预览 */}
                            {historyDetailItem.content && !historyDetailItem.copies && !historyDetailItem.generated && (
                                <div style={{
                                    background: '#f3f4f6',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6'
                                }}>
                                    {historyDetailItem.content}
                                </div>
                            )}

                            {/* 时间信息 */}
                            <div style={{
                                fontSize: '13px',
                                color: '#9ca3af',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}>
                                生成时间：{new Date(historyDetailItem.timestamp).toLocaleString('zh-CN')}
                            </div>

                            {/* 操作按钮 */}
                            <div style={{display: 'flex', gap: '12px'}}>
                                <button 
                                    className="btn btn-outline"
                                    style={{flex: 1}}
                                    onClick={closeHistoryDetail}
                                >
                                    关闭
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    style={{flex: 1}}
                                    onClick={() => continueFromHistory(historyDetailItem)}
                                >
                                    <i className="fas fa-edit"></i> 继续编辑
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
