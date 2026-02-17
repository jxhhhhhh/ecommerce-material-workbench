const { useState, useRef, useEffect } = React;

// ==================== 按类目定制的AI文案生成器 ====================
const categoryConfigs = {
    '服装': {
        trendKeywords: ['百搭', '显瘦', '显白', '时髦', '气质', 'OOTD', '穿搭'],
        titlePatterns: [
            (c, n, m, f) => `${c}${n}｜${m}面料 显瘦显白神器`,
            (c, n, m, f) => `被问爆的${c}${n}！${m}材质 上身绝绝子`,
            (c, n, m, f) => `${c}控必入✨ ${c}${n} ${m}质感太高级`,
            (c, n, m, f) => `显瘦10斤！${c}${n} ${m}面料 舒适又时髦`,
            (c, n, m, f) => `早春OOTD🌸 ${c}${n} ${m}材质 温柔感拉满`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这件${n}真的是衣橱必备！${m}面料亲肤透气，${c}设计显瘦又显高。${f ? f + '，' : ''}随便搭都好看，通勤约会都能穿。`,
            (n, c, m, f) => `挖到宝了！${m}材质的${n}，触感柔软舒适。${c}版型修饰身材，${f || '上身效果超赞'}，闺蜜都问我要链接～`,
            (n, c, m, f) => `质感绝了！严选${m}面料，${n}的${c}设计很有小心机。${f || '显瘦又百搭'}，洗了好几次都不变形，性价比超高！`,
        ],
    },
    '鞋靴': {
        trendKeywords: ['舒适', '增高', '百搭', '透气', '软底', '不累脚', '爆款'],
        titlePatterns: [
            (c, n, m, f) => `暴走不累！${c}${n} ${m}材质 软底舒适`,
            (c, n, m, f) => `增高5cm✨ ${c}${n} ${m}鞋面 透气不闷脚`,
            (c, n, m, f) => `${c}控必入｜${c}${n} ${m}材质 踩屎感满满`,
            (c, n, m, f) => `月销2000+的${c}${n}！${m}材质 好评如潮`,
            (c, n, m, f) => `通勤神器👟 ${c}${n} ${m}软底 一天不累`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这双${n}太舒服了！${m}鞋面透气不闷脚，软底设计走一天都不累。${f || '增高又显瘦'}，通勤逛街都能穿。`,
            (n, c, m, f) => `终于找到好穿的${c}了！${m}材质柔软贴合，${n}的版型很正。${f || '防滑耐磨'}，性价比真的高，闭眼入！`,
            (n, c, m, f) => `回购三次的${n}！${m}材质越穿越舒服，${c}设计时尚百搭。${f || '脚感超棒'}，搭配裙子裤子都好看～`,
        ],
    },
    '箱包': {
        trendKeywords: ['大容量', '百搭', '轻便', '耐用', '通勤', '出游', '质感'],
        titlePatterns: [
            (c, n, m, f) => `能装下全世界！${c}${n} ${m}材质 大容量`,
            (c, n, m, f) => `通勤必备✨ ${c}${n} ${m}质感 轻便耐用`,
            (c, n, m, f) => `出游神器｜${c}${n} ${m}材质 百搭能装`,
            (c, n, m, f) => `高级感${c}${n}！${m}材质 质感满分`,
            (c, n, m, f) => `学生党上班族都爱💼 ${c}${n} ${m}耐用`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这个${n}容量超大！${m}材质轻便又耐用，${c}设计简约大气。${f || '隔层合理'}，电脑书本都能装，通勤出游都合适。`,
            (n, c, m, f) => `质感超棒的${n}！${m}材质手感细腻，${c}版型挺括有型。${f || '五金精致'}，背出去很有面子，同事都问链接～`,
            (n, c, m, f) => `用了半年还像新的！${m}材质的${n}真的很耐用，${c}设计实用又好看。${f || '容量惊人'}，日常通勤完全够用！`,
        ],
    },
    '美妆': {
        trendKeywords: ['显白', '持妆', '保湿', '温和', '养肤', '素颜', '必备'],
        titlePatterns: [
            (c, n, m, f) => `黄皮亲妈！${c}${n} ${m}质地 显白持妆`,
            (c, n, m, f) => `伪素颜神器✨ ${c}${n} ${m}配方 自然好皮`,
            (c, n, m, f) => `干皮救星｜${c}${n} ${m}成分 保湿养肤`,
            (c, n, m, f) => `${c}控必入！${c}${n} ${m}质地 好评如潮`,
            (c, n, m, f) => `平价好用💄 ${c}${n} ${m}配方 学生党爱`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这款${n}真的绝了！${m}质地轻薄不闷痘，${c}效果自然又持久。${f || '显白不挑皮'}，素颜涂也超好看，日常通勤必备。`,
            (n, c, m, f) => `被种草后无限回购！${m}配方温和不刺激，${n}的${c}效果很明显。${f || '保湿不拔干'}，敏感肌也能用，性价比超高～`,
            (n, c, m, f) => `终于找到本命${c}了！${m}质地丝滑好推开，${n}持妆一整天不脱妆。${f || '养肤不暗沉'}，越夜越美丽，姐妹们快冲！`,
        ],
    },
    '食品': {
        trendKeywords: ['健康', '美味', '低脂', '营养', '解馋', '追剧', '办公室'],
        titlePatterns: [
            (c, n, m, f) => `好吃不胖！${c}${n} ${m}制作 健康美味`,
            (c, n, m, f) => `办公室解馋✨ ${c}${n} ${m}配方 停不下来`,
            (c, n, m, f) => `追剧必备｜${c}${n} ${m}工艺 越嚼越香`,
            (c, n, m, f) => `配料干净！${c}${n} ${m}原料 吃得放心`,
            (c, n, m, f) => `回购10次🍿 ${c}${n} ${m}制作 全家爱吃`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这个${n}太好吃了！${m}制作保留原味，${c}口感${f || '酥脆爽口'}。配料表干净，吃着放心，追剧办公来一包超满足。`,
            (n, c, m, f) => `挖到宝藏零食！${m}原料品质很好，${n}的${c}味道很正。${f || '低脂健康'}，解馋不怕胖，已经回购好几次了～`,
            (n, c, m, f) => `全家都爱吃的${n}！${m}工艺制作，${c}风味浓郁。${f || '营养丰富'}，老少皆宜，囤了一大箱慢慢吃！`,
        ],
    },
    '家居': {
        trendKeywords: ['实用', '高颜值', '收纳', '舒适', '品质', '温馨', '必备'],
        titlePatterns: [
            (c, n, m, f) => `提升幸福感！${c}${n} ${m}材质 高颜值`,
            (c, n, m, f) => `收纳神器✨ ${c}${n} ${m}制作 实用省空间`,
            (c, n, m, f) => `温馨小家｜${c}${n} ${m}质感 品质生活`,
            (c, n, m, f) => `懒人福音！${c}${n} ${m}材质 方便好用`,
            (c, n, m, f) => `ins风🏠 ${c}${n} ${m}制作 拍照超美`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这个${n}真的买对了！${m}材质质感很好，${c}设计实用又好看。${f || '收纳方便'}，放在家里瞬间提升颜值，朋友来家里都问链接。`,
            (n, c, m, f) => `家居好物分享！${m}制作的${n}，${c}功能很贴心。${f || '结实耐用'}，细节处理到位，用起来很顺手，性价比超高～`,
            (n, c, m, f) => `打造温馨小窝必备！${m}材质的${n}，${c}风格很百搭。${f || '环保无异味'}，安装简单，独居女孩也能轻松搞定！`,
        ],
    },
    '数码': {
        trendKeywords: ['实用', '高效', '便携', '耐用', '科技感', '办公', '必备'],
        titlePatterns: [
            (c, n, m, f) => `效率翻倍！${c}${n} ${m}材质 办公神器`,
            (c, n, m, f) => `便携好用✨ ${c}${n} ${m}制作 出差必备`,
            (c, n, m, f) => `科技感｜${c}${n} ${m}质感 颜值在线`,
            (c, n, m, f) => `耐用之选！${c}${n} ${m}材质 品质保证`,
            (c, n, m, f) => `桌面好物💻 ${c}${n} ${m}制作 提升格调`,
        ],
        sellingPoints: [
            (n, c, m, f) => `这个${n}办公用太合适了！${m}材质质感高级，${c}设计人性化。${f || '功能齐全'}，用了一段时间效率提升不少，同事都问哪里买的。`,
            (n, c, m, f) => `数码控必入好物！${m}制作的${n}，${c}性能很稳定。${f || '便携易携带'}，出差旅行都带着，质量可靠不踩雷～`,
            (n, c, m, f) => `桌面颜值担当！${m}材质的${n}，${c}外观简约大气。${f || '散热良好'}，细节做工精致，放在桌上很有科技感！`,
        ],
    },
    '母婴': {
        trendKeywords: ['安全', '温和', '舒适', '实用', '宝妈', '宝宝', '必备'],
        titlePatterns: [
            (c, n, m, f) => `宝妈必囤！${c}${n} ${m}材质 安全温和`,
            (c, n, m, f) => `宝宝超爱✨ ${c}${n} ${m}制作 舒适好用`,
            (c, n, m, f) => `安心之选｜${c}${n} ${m}配方 无刺激`,
            (c, n, m, f) => `育儿神器！${c}${n} ${m}材质 省心省力`,
            (c, n, m, f) => `口碑爆款👶 ${c}${n} ${m}制作 好评如潮`,
        ],
        sellingPoints: [
            (n, c, m, f) => `给宝宝用的${n}很放心！${m}材质安全无刺激，${c}设计很贴心。${f || '柔软舒适'}，宝宝用着开心，妈妈更安心。`,
            (n, c, m, f) => `二胎妈妈强推！${m}制作的${n}，${c}品质有保障。${f || '易清洗好打理'}，用了几个月还很新，性价比超高～`,
            (n, c, m, f) => `待产包必备好物！${m}材质的${n}，${c}功能很实用。${f || '细节设计周到'}，新手妈妈也能轻松上手，值得入手！`,
        ],
    },
};

const generateCopy = (productInfo) => {
    const { name, category, material, color, features } = productInfo;
    const featureList = features ? features.split(/[,，、]/).filter(f => f.trim()) : [];
    const mainFeature = featureList[0] || '';

    // 颜色美化
    const colorBeautify = {
        '深空灰': '高级灰', '象牙白': '纯净白', '墨黑': '经典黑',
        '藏蓝': '深海蓝', '酒红': '复古红', '驼色': '大地色',
        '樱花粉': '温柔粉', '薄荷绿': '清新绿', '焦糖色': '温暖棕',
    };
    const beautifiedColor = colorBeautify[color] || color;

    // 获取类目配置，如果没有则使用默认
    const config = categoryConfigs[category] || categoryConfigs['服装'];

    // 生成标题
    const titlePattern = config.titlePatterns[Math.floor(Math.random() * config.titlePatterns.length)];
    const title = titlePattern(beautifiedColor, name, material, mainFeature);

    // 生成卖点文案
    const sellingPointPattern = config.sellingPoints[Math.floor(Math.random() * config.sellingPoints.length)];
    const sellingPoint = sellingPointPattern(name, category, material, mainFeature);

    // 生成关键词
    const baseKeywords = [category, material];
    if (color) baseKeywords.push(color);
    if (mainFeature) baseKeywords.push(mainFeature);
    const trendKeywords = config.trendKeywords;
    const shuffled = [...trendKeywords].sort(() => 0.5 - Math.random());
    const selectedTrend = shuffled.slice(0, 3);
    const keywords = [...baseKeywords, ...selectedTrend];

    return { title, sellingPoint, keywords: [...new Set(keywords)] };
};

const generateSellingTag = (category, material, features) => {
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
    const featureTag = featureList[0] ? featureList[0] + (category === '食品' ? '美味' : '设计') : null;

    const allTags = featureTag ? [featureTag, ...tags] : tags;
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
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-bolt"></i></div>
                        <h3>批量生成</h3>
                        <p>支持Excel批量导入，一次生成上百个商品的素材，告别重复劳动</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-brain"></i></div>
                        <h3>AI智能润色</h3>
                        <p>基于大模型的文案生成，标题更吸引人，卖点更有感染力</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-image"></i></div>
                        <h3>主图合成</h3>
                        <p>自动将卖点标签叠加到商品图上，生成可直接上架的主图</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-bookmark"></i></div>
                        <h3>模板管理</h3>
                        <p>保存满意的生成结果作为模板，下次上新直接套用</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
                        <h3>数据追踪</h3>
                        <p>记录每个素材的使用情况，优化高转化文案策略</p>
                    </div>
                    <div className="feature-card">
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
    if (!result) {
        return (
            <div className="empty-state">
                <i className="fas fa-palette"></i>
                <div className="empty-state-text" dangerouslySetInnerHTML={{__html: emptyText}} />
            </div>
        );
    }

    const { productInfo, copy, sellingTag } = result;

    return (
        <div>
            <div className="preview-section">
                <div className="preview-section-title">主图预览</div>
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
            </div>
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

// ==================== 主应用 ====================
const App = () => {
    const [currentPage, setPage] = useState('home');
    const [templateData, setTemplateData] = useState(null);

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage setPage={setPage} />;
            case 'workspace': return <WorkspacePage templateData={templateData} clearTemplate={() => setTemplateData(null)} />;
            case 'templates': return <TemplatesPage setPage={setPage} setTemplateData={setTemplateData} />;
            case 'profile': return <ProfilePage />;
            default: return <HomePage setPage={setPage} />;
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
