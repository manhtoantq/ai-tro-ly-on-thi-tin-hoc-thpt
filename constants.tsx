export const SYSTEM_PROMPT_GENERATION = `Bạn là chuyên gia soạn nội dung luyện tập Tin học phổ thông theo chương trình GDPT 2018 (Định hướng ICT - Tin học ứng dụng). 
Nhiệm vụ: Tạo tài liệu ôn tập gồm Lý thuyết và Đề luyện tập dựa trên danh sách bài học được chọn.

QUY TẮC XƯNG HÔ VÀ TRÌNH BÀY:
1. Xưng hô: Dùng từ "bạn" để gọi người học. KHÔNG dùng "thầy/cô" hay "em".
2. Code/Cú pháp SQL & Python: BẮT BUỘC viết code trong block (ví dụ \`\`\`sql hoặc \`\`\`python). 
   - Với CSDL, hãy cung cấp các ví dụ thực tế đầy đủ về:
     + \`CREATE TABLE\` (Khai báo các kiểu dữ liệu \`INT\`, \`VARCHAR\`, \`DATE\`,...).
     + Thiết lập \`PRIMARY KEY\` ngay khi tạo bảng và thêm sau bằng \`ALTER TABLE\`.
     + Thiết lập \`FOREIGN KEY\` để tạo liên kết giữa các bảng (Bảng Tham chiếu).
     + \`ALTER TABLE\` để \`ADD\` cột, \`MODIFY\` kiểu dữ liệu, hoặc \`DROP\` cột.
     + \`UPDATE\` dữ liệu kết hợp điều kiện \`WHERE\`.
     + \`INSERT INTO\` và \`SELECT\` (truy vấn cơ bản đến nâng cao với \`JOIN\`).
   - Mỗi câu lệnh một dòng, thụt lề chuẩn, có chú thích ngắn gọn phía trên hoặc bên cạnh câu lệnh.

CẤU TRÚC ĐỀ LUYỆN TẬP (BẮT BUỘC):
1. Phần I: 24 câu MCQ (Câu 1-24). Phân bố: 6 Nhận biết, 6 Thông hiểu, 6 Vận dụng thấp, 6 Vận dụng cao.
2. Phần II: 4 câu Đúng/Sai (Câu 25-28). Phần 'Bối cảnh' từ 4 đến 7 dòng, sát thực tế (ví dụ: Quản lý thư viện, bán hàng, điểm học sinh).
3. Phần III: 3 câu tự luận (Câu 29-31). Tập trung vào việc viết câu lệnh SQL hoặc phác thảo sơ đồ liên kết bảng.

QUY TẮC NỘI DUNG & ĐỊNH DẠNG JSON:
Trả về JSON hợp lệ với cấu trúc sau:
{
  "theory": "Nội dung lý thuyết chuyên nghiệp. 
   - Sử dụng '### ' cho các tiêu đề mục lớn.
   - Sử dụng '+ ' cho Luận điểm chính.
   - Sử dụng '- ' cho chi tiết/giải thích/ví dụ code SQL/Python.
   - TUYỆT ĐỐI KHÔNG dùng đánh số (1, 2,...) hay bullet point chấm tròn.
   - Các thuật ngữ quan trọng đặt trong cặp dấu \` (ví dụ \`FOREIGN KEY\`) để hệ thống tự in đậm nghiêng.",
  "questions": {
    "part1": [
       { "id": 1, "type": "multiple_choice", "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A", "explanation": "..." }
    ],
    "part2": [
       { "id": 25, "type": "true_false", "context": "...", "question": "...", "subQuestions": [{ "id": "a", "text": "...", "correctAnswer": true, "explanation": "..." }] }
    ],
    "part3": [
       { "id": 29, "type": "essay", "question": "...", "explanation": "..." }
    ]
  }
}`;

export const SYSTEM_PROMPT_EVALUATION = `Bạn là "Trợ lý ôn thi TN THPT môn Tin học". Phân tích kết quả và dùng '+', '-' để nhận xét. Dùng \`...\` cho thuật ngữ.`;

export const CURRICULUM = [
  {
    id: "A",
    title: "Máy tính và xã hội tri thức",
    icon: "fa-server",
    grades: [
      { grade: "Lớp 10", lessons: ["Dữ liệu, thông tin và xử lý thông tin", "Lưu trữ, trao đổi và bảo mật thông tin", "Sự ưu việt của máy tính và thành tựu Tin học", "Thực hành sử dụng thiết bị số", "Tin học trong phát triển kinh tế – xã hội"] },
      { grade: "Lớp 11", lessons: ["Bên trong máy tính", "Khám phá thế giới thiết bị số thông minh", "Khái quát về hệ điều hành", "Hệ điều hành cho thiết bị di động", "Phần mềm ứng dụng và dịch vụ phần mềm"] },
      { grade: "Lớp 12", lessons: ["Giới thiệu về trí tuệ nhân tạo (AI)", "Thành tựu và ứng dụng của AI", "Quan niệm về AI và tương lai", "Cảnh báo về sự lạm dụng AI"] }
    ]
  },
  {
    id: "B",
    title: "Mạng máy tính và Internet",
    icon: "fa-network-wired",
    grades: [
      { grade: "Lớp 10", lessons: ["Mạng máy tính với cuộc sống", "Điện toán đám mây và Internet vạn vật (IoT)", "Thực hành ứng dụng mạng máy tính"] },
      { grade: "Lớp 12", lessons: ["Cơ sở về mạng máy tính", "Các thiết bị mạng thông dụng", "Các giao thức mạng (TCP/IP, HTTP, FTP)", "Thực hành thiết lập mạng LAN", "Cấu hình thiết bị mạng không dây (Wi-Fi router)"] }
    ]
  },
  {
    id: "C",
    title: "Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin",
    icon: "fa-search",
    grades: [
      { grade: "Lớp 11", lessons: ["Lưu trữ trực tuyến", "Thực hành máy tìm kiếm và mạng xã hội", "Công cụ tìm kiếm nâng cao", "Khai thác thông tin trên Internet"] }
    ]
  },
  {
    id: "D",
    title: "Đạo đức, pháp luật và văn hóa trong môi trường số",
    icon: "fa-gavel",
    grades: [
      { grade: "Lớp 10", lessons: ["Tuân thủ pháp luật trong môi trường số", "Bản quyền và trích dẫn thông tin"] },
      { grade: "Lớp 11", lessons: ["Phòng tránh lừa đảo và ứng xử văn hóa trên mạng", "An toàn thông tin cá nhân"] },
      { grade: "Lớp 12", lessons: ["Giữ gìn tính nhân văn trong thế giới ảo", "Sở hữu trí tuệ và quyền tác giả trong kỷ nguyên số"] }
    ]
  },
  {
    id: "E",
    title: "Ứng dụng tin học (Định hướng ICT)",
    icon: "fa-file-invoice",
    grades: [
      { grade: "Lớp 10", lessons: ["Soạn thảo văn bản nâng cao (Mail Merge, Index)", "Thiết kế bài trình chiếu chuyên nghiệp", "Hàm điều kiện (IF) và hàm tìm kiếm (VLOOKUP, HLOOKUP)", "Phân tích và trực quan hóa dữ liệu trên bảng tính"] },
      { grade: "Lớp 11", lessons: ["Thiết kế đồ họa vector với Inkscape", "Vẽ hình khối và tạo biểu trưng (Logo)", "Chỉnh sửa ảnh chuyên sâu với GIMP", "Làm việc với các lớp (Layer) và mặt nạ (Mask)", "Tạo hiệu ứng cho ảnh kỹ thuật số"] },
      { grade: "Lớp 12", lessons: ["Làm phim hoạt hình và video cơ bản", "Biên tập video chuyên nghiệp (Timeline, Cut, Merge)", "Sử dụng hiệu ứng và chuyển cảnh (Transition/Effects)", "Chèn âm thanh và phụ đề cho video", "Xuất bản và chia sẻ video trên các nền tảng"] }
    ]
  },
  {
    id: "F",
    title: "Giải quyết vấn đề với sự trợ giúp của máy tính",
    icon: "fa-code",
    grades: [
      { grade: "Lớp 10", lessons: ["Lập trình Python: Biến và kiểu dữ liệu", "Câu lệnh rẽ nhánh (if-else)", "Câu lệnh lặp (for, while)", "Kiểu dữ liệu danh sách (List)", "Chương trình con và thư viện (Functions/Modules)"] },
      { grade: "Lớp 11", lessons: ["Hệ QTCSDL và SQL: Tạo bảng (CREATE TABLE)", "SQL: Khóa chính (PRIMARY KEY) và Khóa ngoài (FOREIGN KEY)", "SQL: Chỉnh sửa cấu trúc bảng (ALTER TABLE)", "SQL: Cập nhật dữ liệu (UPDATE) và Xóa (DELETE)", "SQL: Truy vấn (SELECT), Sắp xếp (ORDER BY) và Liên kết (JOIN)"] },
      { grade: "Lớp 12", lessons: ["Ngôn ngữ HTML: Cấu trúc trang Web", "Định dạng văn bản, danh sách và bảng biểu trên Web", "Tạo biểu mẫu (Form) và siêu liên kết", "Định dạng trang Web với CSS", "Mô hình hộp (Box model) và bố cục CSS (Flexbox/Grid)"] }
    ]
  },
  {
    id: "G",
    title: "Hướng nghiệp với Tin học",
    icon: "fa-user-tie",
    grades: [
      { grade: "Lớp 10", lessons: ["Nhóm nghề thiết kế và lập trình phần mềm"] },
      { grade: "Lớp 11", lessons: ["Nghề quản trị cơ sở dữ liệu và phân tích dữ liệu"] },
      { grade: "Lớp 12", lessons: ["Nhóm nghề dịch vụ và quản trị CNTT", "Kỹ sư mạng và an ninh mạng", "Xu hướng nghề nghiệp trong kỷ nguyên AI"] }
    ]
  }
];