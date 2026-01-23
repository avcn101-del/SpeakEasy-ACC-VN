
import { AACSymbol, WordType } from '../types';

// Helper to quickly create symbols
const createSymbol = (id: string, label: string, emoji: string, type: WordType): AACSymbol => {
    let color = 'bg-white border-slate-300'; // Default Noun
    switch (type) {
        case WordType.PRONOUN: color = 'bg-yellow-200 border-yellow-400'; break;
        case WordType.VERB: color = 'bg-green-200 border-green-400'; break;
        case WordType.ADJECTIVE: color = 'bg-blue-200 border-blue-400'; break;
        case WordType.QUESTION: color = 'bg-purple-200 border-purple-400'; break;
        case WordType.SOCIAL: color = 'bg-pink-100 border-pink-300'; break;
    }
    return { id, label, emoji, color, type };
};

export const FRINGE_VOCAB: AACSymbol[] = [
    // --- FOOD (Đồ ăn - Expanded) ---
    createSymbol('f_rice', 'Cơm', '🍚', WordType.NOUN),
    createSymbol('f_pho', 'Phở', '🍜', WordType.NOUN),
    createSymbol('f_bread', 'Bánh mì', '🥖', WordType.NOUN),
    createSymbol('f_noodle', 'Mì', '🍝', WordType.NOUN),
    createSymbol('f_pizza', 'Pizza', '🍕', WordType.NOUN),
    createSymbol('f_burger', 'Humburger', '🍔', WordType.NOUN),
    createSymbol('f_fries', 'Khoai tây chiên', '🍟', WordType.NOUN),
    createSymbol('f_soup', 'Súp / Canh', '🥣', WordType.NOUN),
    createSymbol('f_meat', 'Thịt', '🥩', WordType.NOUN),
    createSymbol('f_fish_food', 'Cá', '🐟', WordType.NOUN),
    createSymbol('f_vegetable', 'Rau', '🥦', WordType.NOUN),
    
    // --- SNACKS & DESSERT ---
    createSymbol('f_cookie', 'Bánh quy', '🍪', WordType.NOUN),
    createSymbol('f_cake', 'Bánh kem', '🍰', WordType.NOUN),
    createSymbol('f_chocolate', 'Sô cô la', '🍫', WordType.NOUN),
    createSymbol('f_candy', 'Kẹo', '🍬', WordType.NOUN),
    createSymbol('f_icecream', 'Kem', '🍦', WordType.NOUN),
    createSymbol('f_yogurt', 'Sữa chua', '🥣', WordType.NOUN),
    createSymbol('f_pudding', 'Bánh flan', '🍮', WordType.NOUN),
    createSymbol('f_chips', 'Bim bim', '🥔', WordType.NOUN),

    // --- DRINKS ---
    createSymbol('f_milk', 'Sữa', '🥛', WordType.NOUN),
    createSymbol('f_water', 'Nước', '🥤', WordType.NOUN),
    createSymbol('f_juice', 'Nước trái cây', '🧃', WordType.NOUN),
    createSymbol('f_soda', 'Nước ngọt', '🥤', WordType.NOUN),
    createSymbol('f_smoothie', 'Sinh tố', '🍓', WordType.NOUN),

    // --- FRUITS ---
    createSymbol('f_apple', 'Táo', '🍎', WordType.NOUN),
    createSymbol('f_banana', 'Chuối', '🍌', WordType.NOUN),
    createSymbol('f_orange', 'Cam', '🍊', WordType.NOUN),
    createSymbol('f_grape', 'Nho', '🍇', WordType.NOUN),
    createSymbol('f_strawberry', 'Dâu', '🍓', WordType.NOUN),
    createSymbol('f_watermelon', 'Dưa hấu', '🍉', WordType.NOUN),
    createSymbol('f_mango', 'Xoài', '🥭', WordType.NOUN),

    // --- TOYS & PLAY (Đồ chơi - Expanded) ---
    createSymbol('t_ipad', 'iPad', '📱', WordType.NOUN),
    createSymbol('t_phone', 'Điện thoại', '📞', WordType.NOUN),
    createSymbol('t_youtube', 'YouTube', '▶️', WordType.NOUN),
    createSymbol('t_ball', 'Bóng', '⚽', WordType.NOUN),
    createSymbol('t_car', 'Ô tô', '🚗', WordType.NOUN),
    createSymbol('t_train', 'Tàu hỏa', '🚂', WordType.NOUN),
    createSymbol('t_plane', 'Máy bay', '✈️', WordType.NOUN),
    createSymbol('t_doll', 'Búp bê', '🧸', WordType.NOUN),
    createSymbol('t_dinosaur', 'Khủng long', '🦖', WordType.NOUN),
    createSymbol('t_robot', 'Robot', '🤖', WordType.NOUN),
    createSymbol('t_book', 'Sách', '📖', WordType.NOUN),
    createSymbol('t_crayon', 'Bút màu', '🖍️', WordType.NOUN),
    createSymbol('t_paper', 'Giấy', '📄', WordType.NOUN),
    createSymbol('t_lego', 'Xếp hình', '🧱', WordType.NOUN),
    createSymbol('t_puzzle', 'Ghép hình', '🧩', WordType.NOUN),
    createSymbol('t_bubble', 'Bong bóng', '🫧', WordType.NOUN),
    createSymbol('t_balloon', 'Bóng bay', '🎈', WordType.NOUN),
    createSymbol('t_slide', 'Cầu trượt', '🛝', WordType.NOUN),
    createSymbol('t_swing', 'Xích đu', '🎠', WordType.NOUN),

    // --- CLOTHING (Quần áo) ---
    createSymbol('c_shirt', 'Áo', '👕', WordType.NOUN),
    createSymbol('c_pants', 'Quần', '👖', WordType.NOUN),
    createSymbol('c_dress', 'Váy', '👗', WordType.NOUN),
    createSymbol('c_shoes', 'Giày', '👟', WordType.NOUN),
    createSymbol('c_socks', 'Tất', '🧦', WordType.NOUN),
    createSymbol('c_hat', 'Mũ', '🧢', WordType.NOUN),
    createSymbol('c_jacket', 'Áo khoác', '🧥', WordType.NOUN),
    createSymbol('c_backpack', 'Ba lô', '🎒', WordType.NOUN),
    createSymbol('c_glasses', 'Kính', '👓', WordType.NOUN),
    createSymbol('c_diaper', 'Bỉm', '🩲', WordType.NOUN),

    // --- BODY PARTS (Cơ thể - Important for "Hurt") ---
    createSymbol('b_head', 'Đầu', '💆', WordType.NOUN),
    createSymbol('b_tummy', 'Bụng', '🤰', WordType.NOUN),
    createSymbol('b_hand', 'Tay', '✋', WordType.NOUN),
    createSymbol('b_leg', 'Chân', '🦵', WordType.NOUN),
    createSymbol('b_eye', 'Mắt', '👁️', WordType.NOUN),
    createSymbol('b_mouth', 'Miệng', '👄', WordType.NOUN),
    createSymbol('b_ear', 'Tai', '👂', WordType.NOUN),
    createSymbol('b_nose', 'Mũi', '👃', WordType.NOUN),
    createSymbol('b_teeth', 'Răng', '🦷', WordType.NOUN),

    // --- PLACES (Địa điểm) ---
    createSymbol('p_home', 'Nhà', '🏠', WordType.NOUN),
    createSymbol('p_school', 'Trường', '🏫', WordType.NOUN),
    createSymbol('p_park', 'Công viên', '🌳', WordType.NOUN),
    createSymbol('p_store', 'Siêu thị', '🏪', WordType.NOUN),
    createSymbol('p_hospital', 'Bệnh viện', '🏥', WordType.NOUN),
    createSymbol('p_zoo', 'Sở thú', '🦁', WordType.NOUN),
    createSymbol('p_beach', 'Biển', '🏖️', WordType.NOUN),
    createSymbol('p_pool', 'Hồ bơi', '🏊', WordType.NOUN),
    createSymbol('p_bathroom', 'Nhà tắm', '🛁', WordType.NOUN),
    createSymbol('p_bedroom', 'Phòng ngủ', '🛏️', WordType.NOUN),
    createSymbol('p_kitchen', 'Bếp', '🍳', WordType.NOUN),
    createSymbol('p_livingroom', 'Phòng khách', '🛋️', WordType.NOUN),

    // --- PEOPLE (Người) ---
    createSymbol('pp_teacher', 'Cô giáo', '👩‍🏫', WordType.NOUN),
    createSymbol('pp_doctor', 'Bác sĩ', '👨‍⚕️', WordType.NOUN),
    createSymbol('pp_friend', 'Bạn', '👫', WordType.NOUN),
    createSymbol('pp_baby', 'Em bé', '👶', WordType.NOUN),

    // --- COLORS (Màu sắc) ---
    createSymbol('col_red', 'Đỏ', '🔴', WordType.ADJECTIVE),
    createSymbol('col_blue', 'Xanh dương', '🔵', WordType.ADJECTIVE),
    createSymbol('col_green', 'Xanh lá', '🟢', WordType.ADJECTIVE),
    createSymbol('col_yellow', 'Vàng', '🟡', WordType.ADJECTIVE),
    createSymbol('col_black', 'Đen', '⚫', WordType.ADJECTIVE),
    createSymbol('col_white', 'Trắng', '⚪', WordType.ADJECTIVE),
    createSymbol('col_pink', 'Hồng', '🎀', WordType.ADJECTIVE),
    createSymbol('col_rainbow', 'Nhiều màu', '🌈', WordType.ADJECTIVE),

    // --- NUMBERS (Số) ---
    createSymbol('num_1', '1', '1️⃣', WordType.ADJECTIVE),
    createSymbol('num_2', '2', '2️⃣', WordType.ADJECTIVE),
    createSymbol('num_3', '3', '3️⃣', WordType.ADJECTIVE),
    createSymbol('num_4', '4', '4️⃣', WordType.ADJECTIVE),
    createSymbol('num_5', '5', '5️⃣', WordType.ADJECTIVE),
    createSymbol('num_10', '10', '🔟', WordType.ADJECTIVE),
    createSymbol('num_many', 'Nhiều', '🔢', WordType.ADJECTIVE),

    // --- TIME & WEATHER (Thời gian & Thời tiết) ---
    createSymbol('tm_now', 'Bây giờ', '👇', WordType.ADJECTIVE),
    createSymbol('tm_later', 'Lát nữa', '🕒', WordType.ADJECTIVE),
    createSymbol('tm_morning', 'Buổi sáng', '🌅', WordType.NOUN),
    createSymbol('tm_night', 'Buổi tối', '🌙', WordType.NOUN),
    createSymbol('w_sun', 'Nắng', '☀️', WordType.NOUN),
    createSymbol('w_rain', 'Mưa', '🌧️', WordType.NOUN),
    createSymbol('w_hot', 'Nóng', '🥵', WordType.ADJECTIVE),
    createSymbol('w_cold', 'Lạnh', '🥶', WordType.ADJECTIVE),

    // --- ACTIONS (Động từ bổ sung) ---
    createSymbol('v_open', 'Mở', '👐', WordType.VERB),
    createSymbol('v_close', 'Đóng', '📪', WordType.VERB),
    createSymbol('v_run', 'Chạy', '🏃', WordType.VERB),
    createSymbol('v_walk', 'Đi bộ', '🚶', WordType.VERB),
    createSymbol('v_sit', 'Ngồi', '🪑', WordType.VERB),
    createSymbol('v_stand', 'Đứng', '🧍', WordType.VERB),
    createSymbol('v_draw', 'Vẽ', '🎨', WordType.VERB),
    createSymbol('v_sing', 'Hát', '🎤', WordType.VERB),
    createSymbol('v_dance', 'Nhảy', '💃', WordType.VERB),
    createSymbol('v_swim', 'Bơi', '🏊', WordType.VERB),
    createSymbol('v_wash_hand', 'Rửa tay', '🧼', WordType.VERB),
    createSymbol('v_wash_face', 'Rửa mặt', '🧖', WordType.VERB),
    createSymbol('v_brush_teeth', 'Đánh răng', '🪥', WordType.VERB),
    createSymbol('v_hug', 'Ôm', '🫂', WordType.VERB),
    createSymbol('v_kiss', 'Hôn', '💋', WordType.VERB),
    createSymbol('v_cut', 'Cắt', '✂️', WordType.VERB),
    createSymbol('v_give', 'Đưa đây', '🤲', WordType.VERB),
    createSymbol('v_look', 'Nhìn', '👀', WordType.VERB),
    createSymbol('v_wait', 'Chờ', '⏳', WordType.VERB),

    // --- FEELINGS & ATTRIBUTES (Tính từ) ---
    createSymbol('adj_happy', 'Vui', '😄', WordType.ADJECTIVE),
    createSymbol('adj_sad', 'Buồn', '😢', WordType.ADJECTIVE),
    createSymbol('adj_angry', 'Tức giận', '😡', WordType.ADJECTIVE),
    createSymbol('adj_scared', 'Sợ', '😱', WordType.ADJECTIVE),
    createSymbol('adj_tired', 'Mệt', '😫', WordType.ADJECTIVE),
    createSymbol('adj_sick', 'Ốm', '🤒', WordType.ADJECTIVE),
    createSymbol('adj_good', 'Ngon / Tốt', '😋', WordType.ADJECTIVE),
    createSymbol('adj_bad', 'Dở / Hư', '🤢', WordType.ADJECTIVE),
    createSymbol('adj_big', 'To', '🐘', WordType.ADJECTIVE),
    createSymbol('adj_small', 'Nhỏ', '🐜', WordType.ADJECTIVE),
    createSymbol('adj_dirty', 'Bẩn', '💩', WordType.ADJECTIVE),
    createSymbol('adj_clean', 'Sạch', '✨', WordType.ADJECTIVE),
    createSymbol('adj_wet', 'Ướt', '💦', WordType.ADJECTIVE),
    createSymbol('adj_dry', 'Khô', '🌵', WordType.ADJECTIVE),
    createSymbol('adj_fast', 'Nhanh', '🏎️', WordType.ADJECTIVE),
    createSymbol('adj_slow', 'Chậm', '🐢', WordType.ADJECTIVE),
    createSymbol('adj_loud', 'Ồn ào', '📢', WordType.ADJECTIVE),
    createSymbol('adj_quiet', 'Yên lặng', '🤫', WordType.ADJECTIVE),
    
    // --- ANIMALS (Động vật) ---
    createSymbol('an_dog', 'Chó', '🐶', WordType.NOUN),
    createSymbol('an_cat', 'Mèo', '🐱', WordType.NOUN),
    createSymbol('an_bird', 'Chim', '🐦', WordType.NOUN),
    createSymbol('an_fish', 'Cá', '🐟', WordType.NOUN),
    createSymbol('an_cow', 'Bò', '🐄', WordType.NOUN),
    createSymbol('an_chicken', 'Gà', '🐓', WordType.NOUN),
    createSymbol('an_duck', 'Vịt', '🦆', WordType.NOUN),
    createSymbol('an_pig', 'Heo', '🐷', WordType.NOUN),
    createSymbol('an_tiger', 'Hổ', '🐯', WordType.NOUN),
    createSymbol('an_elephant', 'Voi', '🐘', WordType.NOUN),
    createSymbol('an_butterfly', 'Bướm', '🦋', WordType.NOUN)
];

// Helper for the AI Service to format this list
export const getVocabListForAI = () => {
    return FRINGE_VOCAB.map(v => `${v.id}:${v.label}`).join(', ');
};

export const getSymbolById = (id: string): AACSymbol | undefined => {
    return FRINGE_VOCAB.find(v => v.id === id);
};
