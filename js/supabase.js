// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://jjyyfeiewnfgoonlamud.supabase.co';  // Thay bằng URL của bạn
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeXlmZWlld25mZ29vbmxhbXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjIwNzIsImV4cCI6MjA4NDYzODA3Mn0.-7pwDYaXffJlHZCTr6-YLNXWoli4eeg0vkmNDt4-5TM'; // Thay bằng key của bạn

// Khởi tạo Supabase client - ĐÂY LÀ DÒNG QUAN TRỌNG
const { createClient } = supabase;  // Lấy hàm createClient từ thư viện
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export ra biến global để các file khác dùng được
window.supabase = supabaseClient;

// ===== DATABASE FUNCTIONS =====

// Gửi đơn hàng mới
async function submitOrder(orderData) {
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error: error.message };
    }
}

// Lấy danh sách đơn hàng
async function getOrders() {
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: error.message };
    }
}

// Cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, status) {
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating order:', error);
        return { success: false, error: error.message };
    }
}

// Upload file
async function uploadDesignFile(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `designs/${fileName}`;
        
        const { data, error } = await supabaseClient.storage
            .from('uploads')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabaseClient.storage
            .from('uploads')
            .getPublicUrl(filePath);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
window.db = {
    submitOrder,
    getOrders,
    updateOrderStatus,
    uploadDesignFile
};

console.log('✅ Supabase initialized successfully!');
