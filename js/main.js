// ===== LOAD DYNAMIC CONTENT =====
async function loadSiteContent() {
    try {
        // Load site config
        const { data: configs } = await supabase.from('site_config').select('*');
        
        configs?.forEach(config => {
            if (config.key === 'hero') applyHeroContent(config.value);
            if (config.key === 'contact') applyContactContent(config.value);
            if (config.key === 'brand') applyBrandContent(config.value);
        });
        
        // Load products
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        if (products) renderProducts(products);
        
        // Load gallery
        const { data: gallery } = await supabase
            .from('gallery')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        if (gallery) renderGallery(gallery);
        
        // Load testimonials
        const { data: testimonials } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        if (testimonials) renderTestimonials(testimonials);
        
        // Load FAQs
        const { data: faqs } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        if (faqs) renderFaqs(faqs);
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function applyHeroContent(hero) {
    const badge = document.querySelector('.hero-badge');
    const title = document.querySelector('.hero-title');
    const desc = document.querySelector('.hero-description');
    const img = document.querySelector('.hero-image img');
    
    if (badge) badge.textContent = hero.badge;
    if (title) title.innerHTML = `${hero.title}<br><span class="gradient-text">${hero.subtitle}</span>`;
    if (desc) desc.innerHTML = hero.description;
    if (img) img.src = hero.image;
    
    // Stats
    const stats = document.querySelectorAll('.stat-number');
    if (stats[0]) stats[0].textContent = hero.stats?.orders || '5000+';
    if (stats[1]) stats[1].textContent = hero.stats?.customers || '500+';
    if (stats[2]) stats[2].textContent = hero.stats?.rating || '4.9⭐';
}

function applyContactContent(contact) {
    // Update phone links
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.href = `tel:${contact.phone}`;
        if (el.textContent.includes('0')) el.textContent = contact.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    });
    
    // Update Zalo links
    document.querySelectorAll('a[href*="zalo.me"]').forEach(el => {
        el.href = `https://zalo.me/${contact.zalo}`;
    });
    
    // Update footer contact info
    const footerContact = document.querySelector('.contact-info');
    if (footerContact) {
        footerContact.innerHTML = `
            <li><i class="fas fa-map-marker-alt"></i> ${contact.address}</li>
            <li><i class="fas fa-phone"></i> ${contact.phone}</li>
            <li><i class="fas fa-envelope"></i> ${contact.email}</li>
            <li><i class="fas fa-clock"></i> ${contact.working_hours}</li>
        `;
    }
}

function applyBrandContent(brand) {
    document.querySelectorAll('.logo span').forEach(el => {
        el.innerHTML = brand.name.replace(/([A-Z][a-z]+)([A-Z])/, '$1<strong>$2') + '</strong>';
    });
}

function renderProducts(products) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(p => `
        <div class="product-card" data-aos="fade-up">
            <div class="product-image">
                <img src="${p.image_url}" alt="${p.name}">
                ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'hot' ? 'Bán chạy' : 'Mới'}</span>` : ''}
            </div>
            <div class="product-content">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description || ''}</p>
                <div class="product-price">
                    <span class="price-current">${formatVND(p.price_100)}</span>
                    <span class="price-unit">/ cái (từ 100 cái)</span>
                </div>
                <a href="#order" class="btn btn-primary btn-block">Đặt hàng</a>
            </div>
        </div>
    `).join('');
}

function renderGallery(gallery) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = gallery.map(g => `
        <div class="gallery-item" data-aos="zoom-in">
            <img src="${g.image_url}" alt="${g.title}">
            <div class="gallery-overlay">
                <span>${g.title}</span>
            </div>
        </div>
    `).join('');
}

function renderTestimonials(testimonials) {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid) return;
    
    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-card" data-aos="fade-up">
            <div class="testimonial-rating">
                ${'<i class="fas fa-star"></i>'.repeat(t.rating)}
                ${t.rating < 5 ? '<i class="fas fa-star-half-alt"></i>'.repeat(5 - t.rating) : ''}
            </div>
            <p class="testimonial-text">"${t.content}"</p>
            <div class="testimonial-author">
                <img src="${t.avatar_url || 'https://i.pravatar.cc/100'}" alt="${t.customer_name}">
                <div>
                    <strong>${t.customer_name}</strong>
                    <span>${t.customer_title || ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFaqs(faqs) {
    const list = document.querySelector('.faq-list');
    if (!list) return;
    
    list.innerHTML = faqs.map(f => `
        <div class="faq-item">
            <button class="faq-question">
                <span>${f.question}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
                <p>${f.answer}</p>
            </div>
        </div>
    `).join('');
    
    // Re-attach FAQ click handlers
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const isActive = faqItem.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
            if (!isActive) faqItem.classList.add('active');
        });
    });
}

function formatVND(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Load content when DOM ready
document.addEventListener('DOMContentLoaded', loadSiteContent);
