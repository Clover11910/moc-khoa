// ===== ADMIN CONTENT MANAGEMENT =====

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`)?.classList.add('active');
    
    // Load data for the tab
    if (tab === 'products') loadProducts();
    if (tab === 'gallery') loadGallery();
    if (tab === 'testimonials') loadTestimonials();
    if (tab === 'faqs') loadFaqs();
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ===== LOAD INITIAL DATA =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadGeneralSettings();
    await loadProducts();
});

// ===== GENERAL SETTINGS =====
async function loadGeneralSettings() {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('*');
        
        if (error) throw error;
        
        data.forEach(config => {
            if (config.key === 'hero') {
                const hero = config.value;
                document.getElementById('hero_badge').value = hero.badge || '';
                document.getElementById('hero_title').value = hero.title || '';
                document.getElementById('hero_subtitle').value = hero.subtitle || '';
                document.getElementById('hero_description').value = hero.description || '';
                document.getElementById('hero_image').value = hero.image || '';
                document.getElementById('hero_stat_orders').value = hero.stats?.orders || '';
                document.getElementById('hero_stat_customers').value = hero.stats?.customers || '';
                document.getElementById('hero_stat_rating').value = hero.stats?.rating || '';
                
                if (hero.image) {
                    document.getElementById('hero_image_preview').innerHTML = 
                        `<img src="${hero.image}" alt="Preview">`;
                }
            }
            
            if (config.key === 'contact') {
                const contact = config.value;
                document.getElementById('contact_phone').value = contact.phone || '';
                document.getElementById('contact_zalo').value = contact.zalo || '';
                document.getElementById('contact_email').value = contact.email || '';
                document.getElementById('contact_address').value = contact.address || '';
                document.getElementById('contact_working_hours').value = contact.working_hours || '';
                document.getElementById('contact_facebook').value = contact.facebook || '';
                document.getElementById('contact_instagram').value = contact.instagram || '';
                document.getElementById('contact_tiktok').value = contact.tiktok || '';
                document.getElementById('contact_youtube').value = contact.youtube || '';
            }
            
            if (config.key === 'brand') {
                const brand = config.value;
                document.getElementById('brand_name').value = brand.name || '';
                document.getElementById('brand_slogan').value = brand.slogan || '';
                document.getElementById('brand_logo').value = brand.logo_url || '';
            }
        });
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Không thể tải cài đặt!', 'error');
    }
}

async function saveGeneralSettings() {
    try {
        // Save Hero
        const heroData = {
            badge: document.getElementById('hero_badge').value,
            title: document.getElementById('hero_title').value,
            subtitle: document.getElementById('hero_subtitle').value,
            description: document.getElementById('hero_description').value,
            image: document.getElementById('hero_image').value,
            stats: {
                orders: document.getElementById('hero_stat_orders').value,
                customers: document.getElementById('hero_stat_customers').value,
                rating: document.getElementById('hero_stat_rating').value
            }
        };
        
        await supabase
            .from('site_config')
            .upsert({ key: 'hero', value: heroData, updated_at: new Date().toISOString() }, 
                    { onConflict: 'key' });
        
        // Save Contact
        const contactData = {
            phone: document.getElementById('contact_phone').value,
            zalo: document.getElementById('contact_zalo').value,
            email: document.getElementById('contact_email').value,
            address: document.getElementById('contact_address').value,
            working_hours: document.getElementById('contact_working_hours').value,
            facebook: document.getElementById('contact_facebook').value,
            instagram: document.getElementById('contact_instagram').value,
            tiktok: document.getElementById('contact_tiktok').value,
            youtube: document.getElementById('contact_youtube').value
        };
        
        await supabase
            .from('site_config')
            .upsert({ key: 'contact', value: contactData, updated_at: new Date().toISOString() },
                    { onConflict: 'key' });
        
        // Save Brand
        const brandData = {
            name: document.getElementById('brand_name').value,
            slogan: document.getElementById('brand_slogan').value,
            logo_url: document.getElementById('brand_logo').value
        };
        
        await supabase
            .from('site_config')
            .upsert({ key: 'brand', value: brandData, updated_at: new Date().toISOString() },
                    { onConflict: 'key' });
        
        showToast('Đã lưu cài đặt chung!');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Lỗi khi lưu!', 'error');
    }
}

// ===== PRODUCTS =====
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const tbody = document.getElementById('products-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#64748b;">Chưa có sản phẩm nào</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(product => `
            <tr>
                <td><img src="${product.image_url || 'https://via.placeholder.com/60'}" alt="${product.name}"></td>
                <td><strong>${product.name}</strong><br><small style="color:#64748b;">${product.description || ''}</small></td>
                <td>${formatPrice(product.price_100)}</td>
                <td>${product.badge ? `<span class="badge badge-${product.badge}">${product.badge === 'hot' ? 'Bán chạy' : 'Mới'}</span>` : '-'}</td>
                <td><span class="badge badge-${product.is_active ? 'active' : 'inactive'}">${product.is_active ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function openProductModal(product = null) {
    document.getElementById('product-modal-title').textContent = product ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
    document.getElementById('product_id').value = product?.id || '';
    document.getElementById('product_name').value = product?.name || '';
    document.getElementById('product_description').value = product?.description || '';
    document.getElementById('product_image').value = product?.image_url || '';
    document.getElementById('product_price_50').value = product?.price_50 || '';
    document.getElementById('product_price_100').value = product?.price_100 || '';
    document.getElementById('product_price_300').value = product?.price_300 || '';
    document.getElementById('product_price_500').value = product?.price_500 || '';
    document.getElementById('product_badge').value = product?.badge || '';
    document.getElementById('product_sort').value = product?.sort_order || 0;
    
    openModal('product-modal');
}

async function editProduct(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) openProductModal(data);
}

async function saveProduct() {
    const id = document.getElementById('product_id').value;
    const name = document.getElementById('product_name').value;
    
    if (!name) {
        showToast('Vui lòng nhập tên sản phẩm!', 'error');
        return;
    }
    
    const productData = {
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: document.getElementById('product_description').value,
        image_url: document.getElementById('product_image').value,
        price_50: parseInt(document.getElementById('product_price_50').value) || 0,
        price_100: parseInt(document.getElementById('product_price_100').value) || 0,
        price_300: parseInt(document.getElementById('product_price_300').value) || 0,
        price_500: parseInt(document.getElementById('product_price_500').value) || 0,
        badge: document.getElementById('product_badge').value || null,
        sort_order: parseInt(document.getElementById('product_sort').value) || 0,
        updated_at: new Date().toISOString()
    };
    
    try {
        if (id) {
            await supabase.from('products').update(productData).eq('id', id);
        } else {
            await supabase.from('products').insert([productData]);
        }
        
        showToast('Đã lưu sản phẩm!');
        closeModal('product-modal');
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Lỗi khi lưu!', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
        await supabase.from('products').delete().eq('id', id);
        showToast('Đã xóa sản phẩm!');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Lỗi khi xóa!', 'error');
    }
}

// ===== GALLERY =====
async function loadGallery() {
    try {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const tbody = document.getElementById('gallery-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#64748b;">Chưa có ảnh nào</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td><img src="${item.image_url}" alt="${item.title}"></td>
                <td>${item.title}</td>
                <td><span class="badge badge-${item.is_active ? 'active' : 'inactive'}">${item.is_active ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editGallery(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteGallery(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function openGalleryModal(item = null) {
    document.getElementById('gallery-modal-title').textContent = item ? 'Sửa ảnh' : 'Thêm ảnh';
    document.getElementById('gallery_id').value = item?.id || '';
    document.getElementById('gallery_title').value = item?.title || '';
    document.getElementById('gallery_image').value = item?.image_url || '';
    document.getElementById('gallery_sort').value = item?.sort_order || 0;
    
    openModal('gallery-modal');
}

async function editGallery(id) {
    const { data } = await supabase.from('gallery').select('*').eq('id', id).single();
    if (data) openGalleryModal(data);
}

async function saveGallery() {
    const id = document.getElementById('gallery_id').value;
    const title = document.getElementById('gallery_title').value;
    const image = document.getElementById('gallery_image').value;
    
    if (!title || !image) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const galleryData = {
        title: title,
        image_url: image,
        sort_order: parseInt(document.getElementById('gallery_sort').value) || 0
    };
    
    try {
        if (id) {
            await supabase.from('gallery').update(galleryData).eq('id', id);
        } else {
            await supabase.from('gallery').insert([galleryData]);
        }
        
        showToast('Đã lưu!');
        closeModal('gallery-modal');
        loadGallery();
    } catch (error) {
        console.error('Error saving gallery:', error);
        showToast('Lỗi khi lưu!', 'error');
    }
}

async function deleteGallery(id) {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    
    try {
        await supabase.from('gallery').delete().eq('id', id);
        showToast('Đã xóa!');
        loadGallery();
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi!', 'error');
    }
}

// ===== TESTIMONIALS =====
async function loadTestimonials() {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const tbody = document.getElementById('testimonials-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#64748b;">Chưa có đánh giá nào</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td><img src="${item.avatar_url || 'https://i.pravatar.cc/60'}" alt="${item.customer_name}" style="border-radius:50%;"></td>
                <td><strong>${item.customer_name}</strong><br><small style="color:#64748b;">${item.customer_title || ''}</small></td>
                <td style="max-width:300px;">${item.content.substring(0, 100)}...</td>
                <td>${'⭐'.repeat(item.rating)}</td>
                <td><span class="badge badge-${item.is_active ? 'active' : 'inactive'}">${item.is_active ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editTestimonial(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteTestimonial(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

function openTestimonialModal(item = null) {
    document.getElementById('testimonial-modal-title').textContent = item ? 'Sửa đánh giá' : 'Thêm đánh giá';
    document.getElementById('testimonial_id').value = item?.id || '';
    document.getElementById('testimonial_name').value = item?.customer_name || '';
    document.getElementById('testimonial_title').value = item?.customer_title || '';
    document.getElementById('testimonial_avatar').value = item?.avatar_url || '';
    document.getElementById('testimonial_content').value = item?.content || '';
    document.getElementById('testimonial_rating').value = item?.rating || 5;
    document.getElementById('testimonial_sort').value = item?.sort_order || 0;
    
    openModal('testimonial-modal');
}

async function editTestimonial(id) {
    const { data } = await supabase.from('testimonials').select('*').eq('id', id).single();
    if (data) openTestimonialModal(data);
}

async function saveTestimonial() {
    const id = document.getElementById('testimonial_id').value;
    const name = document.getElementById('testimonial_name').value;
    const content = document.getElementById('testimonial_content').value;
    
    if (!name || !content) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const testimonialData = {
        customer_name: name,
        customer_title: document.getElementById('testimonial_title').value,
        avatar_url: document.getElementById('testimonial_avatar').value,
        content: content,
        rating: parseInt(document.getElementById('testimonial_rating').value),
        sort_order: parseInt(document.getElementById('testimonial_sort').value) || 0
    };
    
    try {
        if (id) {
            await supabase.from('testimonials').update(testimonialData).eq('id', id);
        } else {
            await supabase.from('testimonials').insert([testimonialData]);
        }
        
        showToast('Đã lưu!');
        closeModal('testimonial-modal');
        loadTestimonials();
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi!', 'error');
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
        await supabase.from('testimonials').delete().eq('id', id);
        showToast('Đã xóa!');
        loadTestimonials();
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi!', 'error');
    }
}

// ===== FAQS =====
async function loadFaqs() {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const tbody = document.getElementById('faqs-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#64748b;">Chưa có FAQ nào</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.question}</strong></td>
                <td style="max-width:400px;">${item.answer.substring(0, 150)}...</td>
                <td><span class="badge badge-${item.is_active ? 'active' : 'inactive'}">${item.is_active ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editFaq(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteFaq(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

function openFaqModal(item = null) {
    document.getElementById('faq-modal-title').textContent = item ? 'Sửa FAQ' : 'Thêm FAQ';
    document.getElementById('faq_id').value = item?.id || '';
    document.getElementById('faq_question').value = item?.question || '';
    document.getElementById('faq_answer').value = item?.answer || '';
    document.getElementById('faq_sort').value = item?.sort_order || 0;
    
    openModal('faq-modal');
}

async function editFaq(id) {
    const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
    if (data) openFaqModal(data);
}

async function saveFaq() {
    const id = document.getElementById('faq_id').value;
    const question = document.getElementById('faq_question').value;
    const answer = document.getElementById('faq_answer').value;
    
    if (!question || !answer) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const faqData = {
        question: question,
        answer: answer,
        sort_order: parseInt(document.getElementById('faq_sort').value) || 0
    };
    
    try {
        if (id) {
            await supabase.from('faqs').update(faqData).eq('id', id);
        } else {
            await supabase.from('faqs').insert([faqData]);
        }
        
        showToast('Đã lưu!');
        closeModal('faq-modal');
        loadFaqs();
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi!', 'error');
    }
}

async function deleteFaq(id) {
    if (!confirm('Bạn có chắc muốn xóa FAQ này?')) return;
    
    try {
        await supabase.from('faqs').delete().eq('id', id);
        showToast('Đã xóa!');
        loadFaqs();
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi!', 'error');
    }
}

// ===== HELPER FUNCTIONS =====
function formatPrice(price) {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Save all changes
async function saveAllChanges() {
    await saveGeneralSettings();
    showToast('Đã lưu tất cả thay đổi!');
}

// Preview image when URL changes
document.getElementById('hero_image')?.addEventListener('input', (e) => {
    const url = e.target.value;
    const preview = document.getElementById('hero_image_preview');
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.style.display='none'">`;
    } else {
        preview.innerHTML = '';
    }
});
