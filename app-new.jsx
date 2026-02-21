
// 从React对象解构hooks（浏览器Babel环境需要）
const { useState, useEffect, useCallback, useMemo } = React;

// ==================== 导航栏组件 ====================
const Navbar = ({ currentPage, setPage }) => {
    const navItems = [
        { id: 'home', label: '首页', icon: 'fa-home' },
        { id: 'products', label: '商品管理', icon: 'fa-box' },
        { id: 'workspace', label: '素材生成', icon: 'fa-magic' },
        { id: 'templates', label: '模板库', icon: 'fa-bookmark' },
        { id: 'analytics', label: '数据中心', icon: 'fa-chart-line' }
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
                    <i className="fas fa-magic"></i>
                    电商素材工作台
                </a>
                <div className="navbar-nav">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setPage(item.id); }}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            {item.label}
                        </a>
                    ))}
                </div>
                <div className="navbar-user">
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>v2.0 动态版</span>
                </div>
            </div>
        </nav>
    );
};

// ==================== 首页组件 ====================
const HomePage = ({ setPage }) => {
    const [stats, setStats] = useState({ totalGenerations: 0, todayGenerations: 0, totalProducts: 0, savedTemplates: 0 });
    const [activities, setActivities] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        setStats(UserStatsStore.getDynamicStats());
        setActivities(ActivityStore.getRecent(5));
        setRecentProducts(ProductStore.getAll().slice(-3).reverse());
    }, []);

    const getActivityIcon = (type) => {
        const icons = {
            create_product: 'fa-plus-circle',
            update_product: 'fa-edit',
            delete_product: 'fa-trash',
            generate_copy: 'fa-magic',
            save_template: 'fa-bookmark',
            delete_template: 'fa-trash-alt',
            clear_history: 'fa-eraser'
        };
        return icons[type] || 'fa-circle';
    };

    const getActivityColor = (type) => {
        const colors = {
            create_product: '#10b981',
            update_product: '#3b82f6',
            delete_product: '#ef4444',
            generate_copy: '#8b5cf6',
            save_template: '#f59e0b',
            delete_template: '#ef4444',
            clear_history: '#6b7280'
        };
        return colors[type] || '#6b7280';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return '刚刚';
        if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
        return `${Math.floor(diff / 86400)}天前`;
    };

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
                        <a href="#" className="btn btn-white" onClick={(e) => { e.preventDefault(); setPage('products'); }}>
                            <i className="fas fa-box"></i> 管理商品
                        </a>
                        <a href="#" className="btn btn-outline" onClick={(e) => { e.preventDefault(); setPage('workspace'); }}>
                            <i className="fas fa-magic"></i> 开始生成
                        </a>
                    </div>
                </div>
            </section>

            <section className="stats" style={{ padding: '40px 24px', background: 'white' }}>
                <div className="stats-grid">
                    <div>
                        <div className="stat-number">{stats.totalGenerations}</div>
                        <div className="stat-label">累计生成素材</div>
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#10b981' }}>{stats.todayGenerations}</div>
                        <div className="stat-label">今日生成</div>
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#3b82f6' }}>{stats.totalProducts}</div>
                        <div className="stat-label">管理商品数</div>
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#f59e0b' }}>{stats.savedTemplates}</div>
                        <div className="stat-label">收藏模板</div>
                    </div>
                </div>
            </section>

            <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-clock" style={{ color: '#4f46e5' }}></i>
                            最近活动
                        </h3>
                        {activities.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>暂无活动记录</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {activities.map(activity => (
                                    <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                                        <i className={`fas ${getActivityIcon(activity.type)}`} style={{ color: getActivityColor(activity.type), fontSize: '16px' }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', color: '#1f2937' }}>{activity.description}</div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{formatTime(activity.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-box" style={{ color: '#4f46e5' }}></i>
                            最近添加的商品
                        </h3>
                        {recentProducts.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>暂无商品，快去添加吧</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentProducts.map(product => (
                                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-image" style={{ color: '#4f46e5' }}></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{product.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.category} · {product.material}</div>
                                        </div>
                                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setPage('workspace')}>
                                            生成文案
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }} onClick={() => setPage('products')}>
                            <i className="fas fa-plus"></i> 添加更多商品
                        </button>
                    </div>
                </div>
            </section>

            <section id="features" className="features" style={{ background: '#f8fafc' }}>
                <div className="section-header">
                    <h2>核心功能</h2>
                    <p>专为电商运营设计的智能创作工具，让素材生产不再是瓶颈</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card" onClick={() => setPage('products')} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon" style={{ background: '#dbeafe' }}><i className="fas fa-box" style={{ color: '#3b82f6' }}></i></div>
                        <h3>商品管理</h3>
                        <p>统一管理所有商品信息，支持增删改查，为文案生成提供数据基础</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('workspace')} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon"><i className="fas fa-magic"></i></div>
                        <h3>AI文案生成</h3>
                        <p>基于商品信息智能生成抖音风格文案，支持多种风格和模板</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('templates')} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon" style={{ background: '#fef3c7' }}><i className="fas fa-bookmark" style={{ color: '#f59e0b' }}></i></div>
                        <h3>模板库</h3>
                        <p>保存满意的生成结果作为模板，下次直接套用，提升效率</p>
                    </div>
                    <div className="feature-card" onClick={() => setPage('analytics')} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon" style={{ background: '#d1fae5' }}><i className="fas fa-chart-line" style={{ color: '#10b981' }}></i></div>
                        <h3>数据中心</h3>
                        <p>实时统计生成数据、商品分布、使用趋势，助力运营决策</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

// ==================== 商品管理页面 ====================
const ProductsPage = ({ setPage, showToast }) => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: '服装', material: '', color: '', features: '' });
    const categories = ['服装', '鞋靴', '箱包', '美妆', '食品', '家居', '数码', '母婴'];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setProducts(ProductStore.getAll());
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('请输入商品名称', 'error');
            return;
        }
        if (editingProduct) {
            ProductStore.update(editingProduct.id, formData);
            showToast('商品更新成功', 'success');
        } else {
            ProductStore.add(formData);
            showToast('商品添加成功', 'success');
        }
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: '', category: '服装', material: '', color: '', features: '' });
        loadProducts();
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            material: product.material || '',
            color: product.color || '',
            features: product.features || ''
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('确定要删除这个商品吗？')) {
            ProductStore.delete(id);
            showToast('商品删除成功', 'success');
            loadProducts();
        }
    };

    const handleGenerate = (product) => {
        sessionStorage.setItem('selectedProduct', JSON.stringify(product));
        setPage('workspace');
    };

    const openModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: '服装', material: '', color: '', features: '' });
        setShowModal(true);
    };

    return (
        <div className="poster-page">
            <div className="poster-header">
                <h1><i className="fas fa-box"></i> 商品管理</h1>
                <p>管理你的商品库，为文案生成提供数据支持</p>
            </div>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        共 <strong style={{ color: '#1f2937' }}>{products.length}</strong> 个商品
                    </div>
                    <button className="btn btn-primary" onClick={openModal}>
                        <i className="fas fa-plus"></i> 添加商品
                    </button>
                </div>
                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
                        <i className="fas fa-box-open" style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }}></i>
                        <h3 style={{ marginBottom: '8px' }}>暂无商品</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>添加商品后即可开始生成文案</p>
                        <button className="btn btn-primary" onClick={openModal}>
                            <i className="fas fa-plus"></i> 添加第一个商品
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {products.map(product => (
                            <div key={product.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className="fas fa-image" style={{ color: '#4f46e5', fontSize: '24px' }}></i>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '4px', fontSize: '12px' }}>{product.category}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.6' }}>
                                    {product.material && <div><i className="fas fa-layer-group" style={{ width: '16px' }}></i> {product.material}</div>}
                                    {product.color && <div><i className="fas fa-palette" style={{ width: '16px' }}></i> {product.color}</div>}
                                    {product.features && <div><i className="fas fa-star" style={{ width: '16px' }}></i> {product.features}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleGenerate(product)}>
                                        <i className="fas fa-magic"></i> 生成文案
                                    </button>
                                    <button className="btn btn-outline" onClick={() => handleEdit(product)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn btn-outline" style={{ color: '#ef4444' }} onClick={() => handleDelete(product.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingProduct ? '编辑商品' : '添加商品'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">商品名称 <span className="required">*</span></label>
                                <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="请输入商品名称" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">商品类目 <span className="required">*</span></label>
                                <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">材质</label>
                                <input className="form-input" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} placeholder="如：棉麻、真皮、硅胶等" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">颜色</label>
                                <input className="form-input" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="如：黑色、米白色等" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">商品卖点</label>
                                <input className="form-input" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="多个卖点用逗号分隔，如：显瘦,透气,百搭" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>取消</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingProduct ? '保存' : '添加'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
