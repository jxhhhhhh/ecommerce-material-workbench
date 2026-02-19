const { useState, useRef, useEffect } = React;

// ==================== 按类目定制的AI文案生成器 ====================
const categoryConfigs = {
    '服装': {
        trendKeywords: ['百搭', '显瘦', '显白', '时髦', '气质', 'OOTD', '穿搭'],
        titlePatterns: [
            (color, name, material, feature) => `${color}${name}｜${material}面料 ${feature || '显瘦显白'}神器`,
            (color, name, material, feature) => `被问爆的${color}${name}！${material}材质 ${feature || '上身绝绝子'}`,
            (color, name, material, feature) => `服装控必入✨ ${color}${name} ${material}质感太高级`,
            (color, name, material, feature) => `显瘦10斤！${color}${name} ${material}面料 ${feature || '舒适又时髦'}`,
            (color, name, material, feature) => `早春OOTD🌸 ${color}${name} ${material}材质 ${feature || '温柔感拉满'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这件${name}真的是衣橱必备！${material}面料亲肤透气，版型设计显瘦又显高。${feature ? feature + '，' : ''}随便搭都好看，通勤约会都能穿。`,
            (name, category, material, feature) => `挖到宝了！${material}材质的${name}，触感柔软舒适。版型修饰身材，${feature || '上身效果超赞'}，闺蜜都问我要链接～`,
            (name, category, material, feature) => `质感绝了！严选${material}面料，${name}的设计很有小心机。${feature || '显瘦又百搭'}，洗了好几次都不变形，性价比超高！`,
        ],
    },
    '鞋靴': {
        trendKeywords: ['舒适', '增高', '百搭', '透气', '软底', '不累脚', '爆款'],
        titlePatterns: [
            (color, name, material, feature) => `暴走不累！${color}${name} ${material}材质 ${feature || '软底舒适'}`,
            (color, name, material, feature) => `增高5cm✨ ${color}${name} ${material}鞋面 ${feature || '透气不闷脚'}`,
            (color, name, material, feature) => `鞋靴控必入｜${color}${name} ${material}材质 ${feature || '踩屎感满满'}`,
            (color, name, material, feature) => `月销2000+的${color}${name}！${material}材质 ${feature || '好评如潮'}`,
            (color, name, material, feature) => `通勤神器👟 ${color}${name} ${material}软底 ${feature || '一天不累'}`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这双${name}太舒服了！${material}鞋面透气不闷脚，软底设计走一天都不累。${feature || '增高又显瘦'}，通勤逛街都能穿。`,
            (name, category, material, feature) => `终于找到好穿的鞋了！${material}材质柔软贴合，${name}的版型很正。${feature || '防滑耐磨'}，性价比真的高，闭眼入！`,
            (name, category, material, feature) => `回购三次的${name}！${material}材质越穿越舒服，设计时尚百搭。${feature || '脚感超棒'}，搭配裙子裤子都好看～`,
        ],
    },
    '箱包': {
        trendKeywords: ['大容量', '百搭', '轻便', '耐用', '通勤', '出游', '质感'],
        titlePatterns: [
            (color, name, material, feature) => `能装下全世界！${color}${name} ${material}材质 ${feature || '大容量'}`,
            (color, name, material, feature) => `通勤必备✨ ${color}${name} ${material}质感 ${feature || '轻便耐用'}`,
            (color, name, material, feature) => `出游神器｜${color}${name} ${material}材质 ${feature || '百搭能装'}`,
            (color, name, material, feature) => `高级感${color}${name}！${material}材质 ${feature || '质感满分'}`,
            (color, name, material, feature) => `学生党上班族都爱💼 ${color}${name} ${material}耐用`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}容量超大！${material}材质轻便又耐用，设计简约大气。${feature || '隔层合理'}，电脑书本都能装，通勤出游都合适。`,
            (name, category, material, feature) => `质感超棒的${name}！${material}材质手感细腻，版型挺括有型。${feature || '五金精致'}，背出去很有面子，同事都问链接～`,
            (name, category, material, feature) => `用了半年还像新的！${material}材质的${name}真的很耐用，设计实用又好看。${feature || '容量惊人'}，日常通勤完全够用！`,
        ],
    },
    '美妆': {
        trendKeywords: ['显白', '持妆', '保湿', '温和', '养肤', '素颜', '必备'],
        titlePatterns: [
            (color, name, material, feature) => `黄皮亲妈！${color}${name} ${material}质地 ${feature || '显白持妆'}`,
            (color, name, material, feature) => `伪素颜神器✨ ${color}${name} ${material}配方 ${feature || '自然好皮'}`,
            (color, name, material, feature) => `干皮救星｜${color}${name} ${material}成分 ${feature || '保湿养肤'}`,
            (color, name, material, feature) => `美妆控必入！${color}${name} ${material}质地 ${feature || '好评如潮'}`,
            (color, name, material, feature) => `平价好用💄 ${color}${name} ${material}配方 学生党爱`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这款${name}真的绝了！${material}质地轻薄不闷痘，效果自然又持久。${feature || '显白不挑皮'}，素颜涂也超好看，日常通勤必备。`,
            (name, category, material, feature) => `被种草后无限回购！${material}配方温和不刺激，${name}的效果很明显。${feature || '保湿不拔干'}，敏感肌也能用，性价比超高～`,
            (name, category, material, feature) => `终于找到本命美妆了！${material}质地丝滑好推开，${name}持妆一整天不脱妆。${feature || '养肤不暗沉'}，越夜越美丽，姐妹们快冲！`,
        ],
    },
    '食品': {
        trendKeywords: ['健康', '美味', '低脂', '营养', '解馋', '追剧', '办公室'],
        titlePatterns: [
            (color, name, material, feature) => `好吃不胖！${name} ${material}制作 ${feature || '健康美味'}`,
            (color, name, material, feature) => `办公室解馋✨ ${name} ${material}配方 ${feature || '停不下来'}`,
            (color, name, material, feature) => `追剧必备｜${name} ${material}工艺 ${feature || '越嚼越香'}`,
            (color, name, material, feature) => `配料干净！${name} ${material}原料 ${feature || '吃得放心'}`,
            (color, name, material, feature) => `回购10次🍿 ${name} ${material}制作 全家爱吃`,
        ],
        sellingPoints: [
            (name, category, material, feature) => `这个${name}太好吃了！${material}制作保留原味，口感${feature || '酥脆爽口'}。配料表干净，吃着放心，追剧办公来一包超满足。`,
            (name, category, material, feature) => `挖到宝藏零食！${material}原料品质很好，${name}的味道很正。${feature || '低脂健康'}，解馋不怕胖，已经回购好几次了～`,
            (name, category, material, feature) => `全家都爱吃的${name}！${material}工艺制作，风味浓郁。${feature || '营养丰富'}，老少皆宜，囤了一大箱慢慢吃！`,
        ],
    },
    '家居': {
        trendKeywords: ['实用', '高颜值', '收纳', '舒适', '品质', '温馨', '必备'],
        titlePatterns: [
            (color, name, material, feature) => `提升幸福感！${color}${name} ${material}材质 ${feature || '高颜值'}`,
            (color, name, material, feature) => `收纳神器✨ ${color}${name} ${material}制作 ${feature || '实用省空间'}`,
            (color, name, material, feature) => `温馨小家｜${color}${name} ${material}质感 ${feature || '品质生活'}`,
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

const generateCopy = (productInfo) => {
    // 参数兜底处理
    let { name, category, material, color, features } = productInfo || {};
    
    name = sanitizeParam(name, '优质商品');
    category = sanitizeParam(category, '服装');
    material = sanitizeParam(material, '优质');
    color = sanitizeParam(color, '');
    features = sanitizeParam(features, '');
    
    const featureList = features ? features.split(/[,，、]/).filter(f => f.trim()) : [];
    const mainFeature = featureList[0] || '';

    // 颜色美化
    const colorBeautify = {
        '深空灰': '高级灰', '象牙白': '纯净白', '墨黑': '经典黑',
        '藏蓝': '深海蓝', '酒红': '复古红', '驼色': '大地色',
        '樱花粉': '温柔粉', '薄荷绿': '清新绿', '焦糖色': '温暖棕',
    };
    const beautifiedColor = colorBeautify[color] || color || '';

    // 获取类目配置，如果没有则使用默认
    const config = categoryConfigs[category] || categoryConfigs['服装'];

    // 安全获取随机模板
    const getRandomPattern = (patterns) => {
        if (!patterns || patterns.length === 0) {
            return () => `${name}｜${material}材质 品质优选`;
        }
        return patterns[Math.floor(Math.random() * patterns.length)];
    };

    // 生成标题
    const titlePattern = getRandomPattern(config.titlePatterns);
    const title = titlePattern(beautifiedColor, name, material, mainFeature);

    // 生成卖点文案
    const sellingPointPattern = getRandomPattern(config.sellingPoints);
    const sellingPoint = sellingPointPattern(name, category, material, mainFeature);

    // 生成关键词 - 过滤空值并去重
    const baseKeywords = [category, material].filter(k => k && k.trim());
    if (color && color.trim()) baseKeywords.push(color);
    if (mainFeature && mainFeature.trim()) baseKeywords.push(mainFeature);
    
    const trendKeywords = config.trendKeywords || ['品质', '优选'];
    const shuffled = [...trendKeywords].sort(() => 0.5 - Math.random());
    const selectedTrend = shuffled.slice(0, 3);
    
    // 合并并去重，同时过滤与基础关键词重复的趋势词
    const keywords = [...baseKeywords];
    selectedTrend.forEach(trend => {
        if (!keywords.includes(trend)) {
            keywords.push(trend);
        }
    });

    return { title, sellingPoint, keywords: [...new Set(keywords)].filter(k => k && k.trim()) };
};

const generateSellingTag = (category, material, features) => {
    // 参数兜底
    category = sanitizeParam(category, '通用');
    material = sanitizeParam(material, '优质');
    features = sanitizeParam(features, '');
    
    const featureList = features ? features.split(/[,，、]/).filter(f => f.trim()) : [];

    // 按类目定制标签
    const categoryTags = {
        '服装': ['显瘦版型', '舒适亲肤', '时尚百搭', '品质优选'],
        '鞋靴': ['软底舒适', '透气不闷', '防滑耐磨', '增高显瘦'],
        '箱包': ['大容量', '轻便耐用', '质感五金', '多层收纳'],
        '美妆': ['显白持妆', '温和养肤', '平价好用', '口碑爆款'],
        '食品': ['健康美味', '配料干净', '解馋必备', '全家爱吃'],
        '家居': ['高颜值', '实用省空间', '品质生活', '温馨家居'],
        '数码': ['办公神器', '便携耐用', '科技感', '效率提升'],
        '母婴': ['安全温和', '宝妈推荐', '宝宝喜爱', '省心省力'],
    };

    const tags = categoryTags[category] || ['品质优选', '限时特惠', '好评如潮'];
    
    // 修复特征标签拼接逻辑
    let featureTag = null;
    if (featureList[0]) {
        const feature = featureList[0];
        // 根据类目选择合适的后缀
        if (category === '食品') {
            featureTag = feature; // 食品类不添加后缀，避免语义重复
        } else if (category === '服装' || category === '鞋靴') {
            featureTag = feature + '版型';
        } else if (category === '美妆') {
            featureTag = feature + '效果';
        } else {
            featureTag = feature + '设计';
        }
    }

    const allTags = featureTag ? [featureTag, ...tags] : tags;
    
    // 安全获取随机标签
    if (!allTags || allTags.length === 0) {
        return '品质优选';
    }
    return allTags[Math.floor(Math.random() * allTags.length)];
};

// ==================== 导航栏组件 ====================
const Navbar = ({ currentPage, setPage }) => {
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
            </div>
        </nav>
    );
};

// ==================== 首页组件 ====================
const HomePage = ({ setPage }) => {
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

    // 根据商品信息生成对应的图片URL
    const generateProductImage = () => {
        const { name, category } = formData;
        
        // 商品类型到图片种子的映射 - 每个商品类型对应一个固定的种子
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
        
        // 找到匹配的商品类型
        let seed = 9999; // 默认种子
        for (const [key, value] of Object.entries(productSeeds)) {
            if (name.includes(key)) {
                seed = value;
                break;
            }
        }
        
        // 如果没有匹配到具体商品，使用类目种子
        if (seed === 9999) {
            const categorySeeds = {
                '服装': 100, '鞋靴': 200, '箱包': 300, '美妆': 400,
                '食品': 500, '家居': 600, '数码': 700, '母婴': 800,
            };
            seed = categorySeeds[category] || 9999;
        }
        
        return `https://picsum.photos/seed/${seed}/800/800`;
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
                                <div className="batch-item-image"><img src={`https://picsum.photos/seed/${getProductSeed(item.name, item.category)}/100/100`} alt={item.name} /></div>
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

const PreviewPanel = ({ result, emptyText }) => {
    const [showTikTokModal, setShowTikTokModal] = useState(false);
    const [coreSellingPoint, setCoreSellingPoint] = useState('');
    const [tiktokCopies, setTikTokCopies] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);

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
            const apiKey = 'sk-d363904b9cfa4a2b932a8d1821c68722'; // 用户的API Key
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
                            <img src={productInfo.image} alt={productInfo.name} />
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

const WorkspacePage = ({ templateData, clearTemplate }) => {
    const [activeTab, setActiveTab] = useState('single');
    const [loading, setLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState(null);
    const [batchItems, setBatchItems] = useState([]);
    const [selectedBatchItemId, setSelectedBatchItemId] = useState(null);

    // AI图片生成函数 - 使用分类相关的占位图
    const generateAIImage = (productInfo) => {
        const { category } = productInfo;
        
        // 使用 picsum 的确定性图片，按类目分配不同的图片范围
        const categorySeeds = {
            '服装': 100,
            '鞋靴': 200,
            '箱包': 300,
            '美妆': 400,
            '食品': 500,
            '家居': 600,
            '数码': 700,
            '母婴': 800,
        };
        
        const baseSeed = categorySeeds[category] || 100;
        const randomOffset = Math.floor(Math.random() * 20);
        return `https://picsum.photos/seed/${baseSeed + randomOffset}/800/800`;
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
        
        setPreviewResult({ productInfo: { ...productInfo, image: finalImage, isUserUpload }, copy, sellingTag });
        setLoading(false);
    };

    const handleBatchGenerate = async (items) => {
        setLoading(true);
        const updatedItems = items.map(item => {
            const copy = generateCopy(item);
            const sellingTag = generateSellingTag(item.category, item.material, item.features);
            // 为每个商品生成AI图片
            const aiImage = generateAIImage(item);
            return { ...item, status: 'success', generated: { copy, sellingTag, image: aiImage } };
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
        setLoading(false);
    };

    const handleSelectBatchItem = (itemId) => {
        const item = batchItems.find(i => i.id === itemId);
        if (item && item.generated) {
            setSelectedBatchItemId(itemId);
            setPreviewResult({
                productInfo: { ...item, image: null },
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
const TemplatesPage = ({ setPage, setTemplateData }) => {
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
    ].map(t => ({ ...t, image: `https://picsum.photos/seed/${getProductSeed(t.data.name, t.data.category)}/400/400` }));

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
const BatchGeneratePage = ({ setPage }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);

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
                ]
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
const AIPolishPage = ({ setPage }) => {
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
            const apiKey = 'sk-d363904b9cfa4a2b932a8d1821c68722';
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
const PosterPage = ({ setPage }) => {
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
            const stylePrompts = {
                ecommerce: '电商商品展示海报，专业摄影风格，白色背景，突出产品',
                fresh: '清新自然风格海报，柔和光线，简约背景，ins风',
                promotion: '促销海报，醒目大字，鲜艳色彩，限时优惠氛围',
                luxury: '高端奢华海报，黑色或金色背景，精致质感，高级感'
            };

            const styleNames = {
                ecommerce: '电商风格',
                fresh: '清新风格',
                promotion: '促销风格',
                luxury: '高端风格'
            };

            const fullPrompt = `请为以下商品设计一个${styleNames[selectedStyle]}的营销海报方案：${posterPrompt}。
要求：${stylePrompts[selectedStyle]}。
请提供：
1. 海报标题（10字以内，吸引人）
2. 主文案（30字以内，突出卖点）
3. 副文案（20字以内，补充说明）
4. 视觉设计建议（颜色、布局、元素等）
5. 配色方案（主色、辅助色）`;

            // 调用 DeepSeek API 生成海报设计方案
            const apiKey = 'sk-d363904b9cfa4a2b932a8d1821c68722'; // 用户提供的API Key
            let designContent;
            
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
                            {"role": "system", "content": "你是一位资深的电商海报设计师，擅长设计吸引人的商品营销海报。"},
                            {"role": "user", "content": fullPrompt}
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    designContent = data.choices[0]?.message?.content;
                    console.log('API调用成功，生成个性化设计方案');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('API错误:', response.status, errorData);
                    throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || ''}`);
                }
            } catch (apiErr) {
                console.log('API调用失败，使用模拟数据:', apiErr);
                // API失败时使用模拟数据
                const mockData = generateMockPoster();
                designContent = `【${mockData.style} - 演示模式】\n\n商品：${posterPrompt}\n\n${mockData.designPlan}\n\n---\n注：API调用失败，以上为演示方案。错误信息：${apiErr.message}`;
            }
            
            // 使用占位图作为示例（实际项目中可以接入图像生成API）
            // 根据风格选择不同的占位图 - 使用更可靠的图片源
            const placeholderImages = {
                ecommerce: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1024&h=1024&fit=crop',
                fresh: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop',
                promotion: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1024&h=1024&fit=crop',
                luxury: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1024&h=1024&fit=crop'
            };
            
            setGeneratedImage({
                url: placeholderImages[selectedStyle],
                designPlan: designContent
            });
            
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
const ProfilePage = () => {
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
const TemplatesManagePage = ({ setPage }) => {
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
const AnalyticsPage = ({ setPage }) => {
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

// ==================== 主应用 ====================
const App = () => {
    const [currentPage, setPage] = useState('home');
    const [templateData, setTemplateData] = useState(null);

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

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage setPage={safeSetPage} />;
            case 'workspace': return <WorkspacePage templateData={templateData} clearTemplate={() => setTemplateData(null)} />;
            case 'templates': return <TemplatesPage setPage={safeSetPage} setTemplateData={setTemplateData} />;
            case 'profile': return <ProfilePage />;
            case 'poster': return <PosterPage setPage={safeSetPage} />;
            case 'batch': return <BatchGeneratePage setPage={safeSetPage} />;
            case 'polish': return <AIPolishPage setPage={safeSetPage} />;
            case 'templates-manage': return <TemplatesManagePage setPage={safeSetPage} />;
            case 'analytics': return <AnalyticsPage setPage={safeSetPage} />;
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
            <Navbar currentPage={currentPage} setPage={setPage} />
            <div className="main-content">
                {renderPage()}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
