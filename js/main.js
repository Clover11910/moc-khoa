// ===== INITIALIZE AOS =====
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
});

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Loading website content...');
    
    // Đợi Supabase sẵn sàng
    await waitForSupabase();
    
    // Load tất cả nội dung song song
    await Promise.all([
        loadHeroContent(),
        loadProducts(),        // Bao gồm cả Pricing Table và Product Select
        loadGallery(),
        loadTestimonials(),
        loadFaqs(),
        loadContactInfo()      // Bao gồm cả Order Contact
    ]);
    
    console.log('✅ All content loaded successfully!');
    
    // Khởi tạo các tính năng tương tác
    initNavigation();
    initScrollEffects();
    initOrderForm();
});

// ===== WAIT FOR SUPABASE =====
function waitForSupabase() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.supabase && typeof window.supabase.from === 'function') {
                console.log('✅ Supabase ready');
                resolve();
            } else {
                console.log('⏳ Waiting for Supabase...');
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// ===== HELPER FUNCTIONS =====
function formatPrice(price) {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
}

// ===== LOAD HERO CONTENT =====
async function loadHeroContent() {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'hero')
            .single();
        
        if (error) throw error;
        
        const hero = data.value;
        
        // Cập nhật các phần tử
        const elements = {
            heroBadge: hero.badge,
            heroDescription: hero.description,
            heroImage: hero.image,
            statOrders: hero.stats?.orders,
            statCustomers: hero.stats?.customers,
            statRating: hero.stats?.rating
        };
        
        // Badge
        const badge = document.getElementById('heroBadge');
        if (badge) badge.textContent = hero.badge || '';
        
        // Title
        const title = document.getElementById('heroTitle');
        if (title) {
            title.innerHTML = `${hero.title || 'Móc Khóa In Theo Mẫu'}<br><span class="gradient-text">${hero.subtitle || 'Chất Lượng Cao - Giá Xưởng'}</span>`;
        }
        
        // Description
        const desc = document.getElementById('heroDescription');
        if (desc) desc.innerHTML = hero.description || '';
        
        // Image
        const img = document.getElementById('heroImage');
        if (img && hero.image) img.src = hero.image;
        
        // Stats
        const statOrders = document.getElementById('statOrders');
        if (statOrders) statOrders.textContent = hero.stats?.orders || '5000+';
        
        const statCustomers = document.getElementById('statCustomers');
        if (statCustomers) statCustomers.textContent = hero.stats?.customers || '500+';
        
        const statRating = document.getElementById('statRating');
        if (statRating) statRating.textContent = hero.stats?.rating || '4.9⭐';
        
        console.log('✅ Hero loaded');
    } catch (error) {
        console.error('❌ Error loading hero:', error);
    }
}

// ===== LOAD PRODUCTS (+ PRICING TABLE + SELECT) =====
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const hasProducts = products && products.length > 0;
        
        // === 1. Products Grid ===
        const grid = document.getElementById('productsGrid');
        if (grid) {
            if (!hasProducts) {
                grid.innerHTML = '<p class="empty-message">Chưa có sản phẩm nào.</p>';
            } else {
                grid.innerHTML = products.map((product, index) => `
                    <div class="product-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="product-image">
                            <img src="${product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                                 alt="${product.name}"
                                 onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                            ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'hot' ? 'Bán chạy' : 'Mới'}</span>` : ''}
                        </div>
                        <div class="product-content">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-desc">${product.description || ''}</p>
                            <div class="product-price">
                                <span class="price-current">${formatPrice(product.price_100)}</span>
                                <span class="price-unit">/ cái (từ 100 cái)</span>
                            </div>
                            <a href="#order" class="btn btn-primary btn-block">Đặt hàng</a>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // === 2. Pricing Table ===
        const pricingBody = document.getElementById('pricingTableBody');
        if (pricingBody) {
            if (!hasProducts) {
                pricingBody.innerHTML = '<tr><td colspan="5" class="empty-message">Chưa có bảng giá.</td></tr>';
            } else {
                pricingBody.innerHTML = products.map(product => `
                    <tr>
                        <td><strong>${product.name}</strong></td>
                        <td>${formatPrice(product.price_50)}</td>
                        <td>${formatPrice(product.price_100)}</td>
                        <td>${formatPrice(product.price_300)}</td>
                        <td class="best-price">${formatPrice(product.price_500)}</td>
                    </tr>
                `).join('');
            }
        }
        
        // === 3. Product Select (Order Form) ===
        const select = document.getElementById('productType');
        if (select) {
            let options = '<option value="">-- Chọn loại móc khóa --</option>';
            if (hasProducts) {
                products.forEach(p => {
                    options += `<option value="${p.slug}">${p.name}</option>`;
                });
            }
            options += '<option value="khac">Khác (ghi rõ ở ghi chú)</option>';
            select.innerHTML = options;
        }
        
        console.log('✅ Products loaded:', products?.length || 0);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        
        // Fallback cho select nếu lỗi
        const select = document.getElementById('productType');
        if (select) {
            select.innerHTML = `
                <option value="">-- Chọn loại --</option>
                <option value="mica">Móc khóa Mica</option>
                <option value="kim-loai">Móc khóa Kim loại</option>
                <option value="nhua-deo">Móc khóa Nhựa dẻo</option>
                <option value="go">Móc khóa Gỗ</option>
                <option value="khac">Khác</option>
            `;
        }
    }
}

// ===== LOAD GALLERY =====
async function loadGallery() {
    try {
        const { data: gallery, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        
        if (!gallery || gallery.length === 0) {
            grid.innerHTML = '<p class="empty-message">Chưa có hình ảnh nào.</p>';
            return;
        }
        
        grid.innerHTML = gallery.map((item, index) => `
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${index * 50}">
                <img src="${item.image_url}" alt="${item.title}" 
                     onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <div class="gallery-overlay">
                    <span>${item.title}</span>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Gallery loaded:', gallery.length);
    } catch (error) {
        console.error('❌ Error loading gallery:', error);
    }
}

// ===== LOAD TESTIMONIALS =====
async function loadTestimonials() {
    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;
        
        if (!testimonials || testimonials.length === 0) {
            grid.innerHTML = '<p class="empty-message">Chưa có đánh giá nào.</p>';
            return;
        }
        
        grid.innerHTML = testimonials.map((item, index) => `
            <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="testimonial-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.min(item.rating || 5, 5))}
                </div>
                <p class="testimonial-text">"${item.content}"</p>
                <div class="testimonial-author">
                    <img src="${item.avatar_url || `https://i.pravatar.cc/100?img=${index + 1}`}" 
                         alt="${item.customer_name}"
                         onerror="this.src='https://i.pravatar.cc/100'">
                    <div>
                        <strong>${item.customer_name}</strong>
                        <span>${item.customer_title || ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Testimonials loaded:', testimonials.length);
    } catch (error) {
        console.error('❌ Error loading testimonials:', error);
    }
}

// ===== LOAD FAQS =====
async function loadFaqs() {
    try {
        const { data: faqs, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const list = document.getElementById('faqList');
        if (!list) return;
        
        if (!faqs || faqs.length === 0) {
            list.innerHTML = '<p class="empty-message">Chưa có câu hỏi nào.</p>';
            return;
        }
        
        list.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <button class="faq-question">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
        
        // Gắn event listeners
        initFaqAccordion();
        
        console.log('✅ FAQs loaded:', faqs.length);
    } catch (error) {
        console.error('❌ Error loading FAQs:', error);
    }
}

// ===== LOAD CONTACT INFO =====
async function loadContactInfo() {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'contact')
            .single();
        
        if (error) throw error;
        
        const contact = data.value;
        
        // === Cập nhật tất cả link điện thoại ===
        document.querySelectorAll('a[href^="tel:"]').forEach(el => {
            if (contact.phone) el.href = `tel:${contact.phone}`;
        });
        
        // === Cập nhật tất cả link Zalo ===
        document.querySelectorAll('a[href*="zalo.me"]').forEach(el => {
            if (contact.zalo) el.href = `https://zalo.me/${contact.zalo}`;
        });
        
        // === Order Form Contact Buttons ===
        const phoneBtn = document.getElementById('contactPhone');
        if (phoneBtn && contact.phone) {
            phoneBtn.href = `tel:${contact.phone}`;
            phoneBtn.innerHTML = `<i class="fas fa-phone"></i> ${formatPhoneNumber(contact.phone)}`;
        }
        
        const zaloBtn = document.getElementById('contactZalo');
        if (zaloBtn && contact.zalo) {
            zaloBtn.href = `https://zalo.me/${contact.zalo}`;
        }
        
        // === Floating Buttons ===
        const floatPhone = document.querySelector('.float-btn.phone');
        if (floatPhone && contact.phone) {
            floatPhone.href = `tel:${contact.phone}`;
            floatPhone.title = `Gọi ${formatPhoneNumber(contact.phone)}`;
        }
        
        const floatZalo = document.querySelector('.float-btn.zalo');
        if (floatZalo && contact.zalo) {
            floatZalo.href = `https://zalo.me/${contact.zalo}`;
        }
        
        // === Footer Contact Info ===
        const footerContact = document.querySelector('.contact-info');
        if (footerContact) {
            footerContact.innerHTML = `
                <li><i class="fas fa-map-marker-alt"></i> ${contact.address || 'Chưa cập nhật'}</li>
                <li><i class="fas fa-phone"></i> <a href="tel:${contact.phone}">${formatPhoneNumber(contact.phone) || 'Chưa cập nhật'}</a></li>
                <li><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email || 'Chưa cập nhật'}</a></li>
                <li><i class="fas fa-clock"></i> ${contact.working_hours || 'Chưa cập nhật'}</li>
            `;
        }
        
        // === Social Links ===
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            let html = '';
            if (contact.facebook) html += `<a href="${contact.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook-f"></i></a>`;
            if (contact.instagram) html += `<a href="${contact.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>`;
            if (contact.tiktok) html += `<a href="${contact.tiktok}" target="_blank" title="TikTok"><i class="fab fa-tiktok"></i></a>`;
            if (contact.youtube) html += `<a href="${contact.youtube}" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>`;
            if (html) socialLinks.innerHTML = html;
        }
        
        console.log('✅ Contact info loaded');
    } catch (error) {
        console.error('❌ Error loading contact:', error);
    }
}

// ===== FAQ ACCORDION =====
function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Đóng tất cả
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Mở cái được click (nếu chưa active)
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ===== NAVIGATION =====
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Đóng menu khi click link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        // Header shadow
        if (header) {
            header.style.boxShadow = window.scrollY > 50 
                ? '0 4px 20px rgba(0,0,0,0.1)' 
                : '0 1px 3px rgba(0,0,0,0.1)';
        }
        
        // Scroll to top button
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('show', window.scrollY > 500);
        }
    });
    
    // Scroll to top click
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ===== ORDER FORM =====
function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    const fileInput = document.getElementById('designFile');
    const filePreview = document.getElementById('filePreview');
    
    // === File Preview ===
    if (fileInput && filePreview) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            
            // Check file size
            if (file.size > 10 * 1024 * 1024) {
                alert('File quá lớn! Vui lòng chọn file dưới 10MB.');
                fileInput.value = '';
                return;
            }
            
            // Show preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    filePreview.innerHTML = `
                        <div class="file-preview-item">
                            <img src="${e.target.result}" alt="Preview">
                            <div class="file-info">
                                <strong>${file.name}</strong>
                                <small>${fileSize} MB</small>
                            </div>
                            <button type="button" class="file-remove" onclick="clearFile()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                filePreview.innerHTML = `
                    <div class="file-preview-item">
                        <i class="fas fa-file file-icon"></i>
                        <div class="file-info">
                            <strong>${file.name}</strong>
                            <small>${fileSize} MB</small>
                        </div>
                        <button type="button" class="file-remove" onclick="clearFile()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }
        });
    }
    
    // === Form Submit ===
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!submitBtn) return;
            
            // Disable button
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
            
            try {
                // Collect form data
                const formData = {
                    customer_name: document.getElementById('customerName')?.value || '',
                    customer_phone: document.getElementById('customerPhone')?.value || '',
                    customer_email: document.getElementById('customerEmail')?.value || null,
                    product_type: document.getElementById('productType')?.value || '',
                    quantity: document.getElementById('quantity')?.value || '',
                    size: document.getElementById('size')?.value || null,
                    notes: document.getElementById('notes')?.value || null,
                    status: 'pending',
                    created_at: new Date().toISOString()
                };
                
                // Upload file if exists
                if (fileInput && fileInput.files.length > 0) {
                    const uploadResult = await window.db.uploadDesignFile(fileInput.files[0]);
                    if (uploadResult.success) {
                        formData.design_file_url = uploadResult.url;
                    }
                }
                
                // Submit to Supabase
                const result = await window.db.submitOrder(formData);
                
                if (result.success) {
                    // Show success modal
                    const modal = document.getElementById('successModal');
                    if (modal) modal.classList.add('show');
                    
                    // Reset form
                    orderForm.reset();
                    if (filePreview) filePreview.innerHTML = '';
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
            } catch (error) {
                console.error('Order submit error:', error);
                alert('Có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ qua Zalo.');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // === Phone Validation ===
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
        });
    }
}

// ===== GLOBAL FUNCTIONS =====
function clearFile() {
    const fileInput = document.getElementById('designFile');
    const filePreview = document.getElementById('filePreview');
    if (fileInput) fileInput.value = '';
    if (filePreview) filePreview.innerHTML = '';
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
        closeModal();
    }
});

console.log('📦 Main.js loaded successfully!');
