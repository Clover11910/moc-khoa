// ===== INITIALIZE AOS =====
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
});

// ===== MOBILE NAVIGATION =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.querySelector('i').classList.add('fa-bars');
        navToggle.querySelector('i').classList.remove('fa-times');
    });
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }
});

// ===== SCROLL TO TOP BUTTON =====
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===== FILE UPLOAD PREVIEW =====
const fileInput = document.getElementById('designFile');
const filePreview = document.getElementById('filePreview');

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            
            if (file.size > 10 * 1024 * 1024) {
                alert('File quá lớn! Vui lòng chọn file dưới 10MB.');
                fileInput.value = '';
                return;
            }
            
            let previewHTML = '';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewHTML = `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px;">
                            <img src="${e.target.result}" style="max-width: 80px; max-height: 80px; border-radius: 4px;">
                            <div>
                                <strong>${file.name}</strong>
                                <br><small style="color: #64748b;">${fileSize} MB</small>
                            </div>
                            <button type="button" onclick="clearFile()" style="margin-left: auto; background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    filePreview.innerHTML = previewHTML;
                };
                reader.readAsDataURL(file);
            } else {
                previewHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px;">
                        <i class="fas fa-file" style="font-size: 2rem; color: #6366f1;"></i>
                        <div>
                            <strong>${file.name}</strong>
                            <br><small style="color: #64748b;">${fileSize} MB</small>
                        </div>
                        <button type="button" onclick="clearFile()" style="margin-left: auto; background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                filePreview.innerHTML = previewHTML;
            }
        }
    });
}

function clearFile() {
    document.getElementById('designFile').value = '';
    document.getElementById('filePreview').innerHTML = '';
}

// ===== ORDER FORM SUBMISSION =====
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');

if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button & show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        
        try {
            // Get form data
            const formData = {
                customer_name: document.getElementById('customerName').value,
                customer_phone: document.getElementById('customerPhone').value,
                customer_email: document.getElementById('customerEmail').value || null,
                product_type: document.getElementById('productType').value,
                quantity: document.getElementById('quantity').value,
                size: document.getElementById('size').value || null,
                notes: document.getElementById('notes').value || null,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            // Upload file if exists
            const fileInput = document.getElementById('designFile');
            if (fileInput.files.length > 0) {
                const uploadResult = await window.db.uploadDesignFile(fileInput.files[0]);
                if (uploadResult.success) {
                    formData.design_file_url = uploadResult.url;
                }
            }
            
            // Submit to Supabase
            const result = await window.db.submitOrder(formData);
            
            if (result.success) {
                // Show success modal
                document.getElementById('successModal').classList.add('show');
                
                // Reset form
                orderForm.reset();
                filePreview.innerHTML = '';
                
                // Send notification (optional - you can add Telegram/Email notification here)
                // await sendNotification(formData);
            } else {
                alert('Có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ trực tiếp qua Zalo.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra! Vui lòng thử lại.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi yêu cầu báo giá';
        }
    });
}

// ===== CLOSE MODAL =====
function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Close modal when clicking outside
document.getElementById('successModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeModal();
    }
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== PHONE NUMBER VALIDATION =====
const phoneInput = document.getElementById('customerPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Limit to 11 digits
        if (e.target.value.length > 11) {
            e.target.value = e.target.value.slice(0, 11);
        }
    });
}

// ===== LAZY LOAD IMAGES =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

console.log('🚀 Website loaded successfully!');