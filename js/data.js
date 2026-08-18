/* Dữ liệu truyện cho website Toonix.
   Đây là dữ liệu mẫu (demo) — ảnh bìa là thật, còn số lượt xem/đánh giá/mô tả
   là nội dung minh hoạ, bạn có thể thay bằng dữ liệu thật sau này. */

const STORIES = [
  { id: 1, title: "Một Đêm Không Bóng", cover: "assets/covers/h1.png",
    genres: ["Giả Tưởng", "Hành Động", "Bí Ẩn"],
    description: "Một hiệp sĩ mang lời thề câm lặng bước vào đêm dài nhất đời mình, nơi ánh sáng và bóng tối không còn ranh giới." },
  { id: 2, title: "One Piece", cover: "assets/covers/h2.png",
    genres: ["Phiêu Lưu", "Hành Động", "Hài Hước"],
    description: "Hành trình của những hải tặc mũ rơm trên con đường trở thành Vua Hải Tặc, băng qua đại dương đầy bí ẩn." },
  { id: 3, title: "Fairy Tail", cover: "assets/covers/h3.jpg",
    genres: ["Giả Tưởng", "Phiêu Lưu", "Hành Động"],
    description: "Hội pháp sư náo nhiệt nhất vương quốc Fiore và những cuộc phiêu lưu đầy phép thuật, tình bạn." },
  { id: 4, title: "Frieren", cover: "assets/covers/h4.jpg",
    genres: ["Giả Tưởng", "Cảm Động", "Phiêu Lưu"],
    description: "Lời tiễn biệt của pháp sư bất tử — câu chuyện chậm rãi về những người ở lại sau chuyến phiêu lưu." },
  { id: 5, title: "Hoá Thân Thành Mèo", cover: "assets/covers/h5.jpg",
    genres: ["Siêu Nhiên", "Hài Hước", "Đời Thường"],
    description: "Một biến cố bất ngờ khiến chàng trai mang trong mình sức mạnh kỳ lạ liên quan đến loài mèo." },
  { id: 6, title: "Học Viện Anh Hùng", cover: "assets/covers/h6.png",
    genres: ["Hành Động", "Học Đường", "Siêu Năng Lực"],
    description: "Ngôi trường đào tạo những anh hùng tương lai, nơi ước mơ và sức mạnh cùng nhau trưởng thành." },
  { id: 7, title: "Iruma", cover: "assets/covers/h7.png",
    genres: ["Học Đường", "Giả Tưởng", "Hài Hước"],
    description: "Cậu bé loài người vô tình lạc vào thế giới quỷ dữ và phải học cách sống sót bằng cả trí thông minh lẫn may mắn." },
  { id: 8, title: "Gakuen Babysitters", cover: "assets/covers/h8.png",
    genres: ["Học Đường", "Đời Thường", "Cảm Động"],
    description: "Câu chuyện ấm áp về những cậu học trò tập làm bảo mẫu tại một học viện đặc biệt." },
  { id: 9, title: "Ma Thuật Và Cơ Bắp", cover: "assets/covers/h9.png",
    genres: ["Học Đường", "Giả Tưởng", "Hài Hước"],
    description: "Ở học viện phép thuật, có một học sinh chọn cách chiến đấu... bằng nắm đấm thay vì đũa phép." },
  { id: 10, title: "Cuộc Chiến Các Vị Thần", cover: "assets/covers/h10.png",
    genres: ["Hành Động", "Giả Tưởng", "Máu Chiến"],
    description: "Khi các vị thần đối đầu, cả thế giới trở thành chiến trường cho một cuộc chiến định đoạt vận mệnh." },
  { id: 11, title: "Tiền Đạo Số 1", cover: "assets/covers/h11.png",
    genres: ["Thể Thao", "Học Đường"],
    description: "Giấc mơ sân cỏ của một tiền đạo trẻ khát khao khẳng định vị trí số một trên hàng công." },
  { id: 12, title: "Naruto", cover: "assets/covers/h12.png",
    genres: ["Hành Động", "Phiêu Lưu", "Võ Thuật"],
    description: "Hành trình của cậu bé ninja mang trong mình con quỷ chín đuôi, nuôi mộng trở thành Hokage." },
  { id: 13, title: "Hãy Hành Động Như 1 Boss Đi Ngài Mr. Devourer", cover: "assets/covers/h13.png",
    genres: ["Giả Tưởng", "Hành Động", "Hài Hước"],
    description: "Bị nhầm thành trùm cuối, nhân vật chính buộc phải diễn cho tròn vai boss giữa vòng vây hiểm nguy." },
  { id: 14, title: "Hiệp Sĩ Hoa Băng", cover: "assets/covers/h14.png",
    genres: ["Giả Tưởng", "Hành Động", "Ngôn Tình"],
    description: "Nữ hiệp sĩ mang thanh kiếm băng giá bước vào cuộc chiến bảo vệ vương quốc giữa mùa đông bất tận." },
  { id: 15, title: "Bong Bóng Của Sóng Biển", cover: "assets/covers/h15.png",
    genres: ["Ngôn Tình", "Cổ Trang", "Cảm Động"],
    description: "Câu chuyện tình yêu mong manh như bọt sóng giữa bầu trời đêm và đại dương xa xăm." },
  { id: 16, title: "Công Chúa Bị Bỏ Rơi", cover: "assets/covers/h16.png",
    genres: ["Ngôn Tình", "Cổ Trang"],
    description: "Bị hoàng tộc ruồng bỏ, nàng công chúa phải tự mình tìm lại vị trí xứng đáng của mình." },
  { id: 17, title: "Lần Nữa Toả Sáng", cover: "assets/covers/h17.png",
    genres: ["Đời Thường", "Cảm Động", "Ngôn Tình"],
    description: "Sau vấp ngã, hành trình đứng dậy và toả sáng một lần nữa của một cô gái không chịu bỏ cuộc." },
  { id: 18, title: "Tôi Không Phải Là Cinderella", cover: "assets/covers/h18.png",
    genres: ["Ngôn Tình", "Cổ Trang", "Hài Hước"],
    description: "Không hoàng tử, không phép màu — cô gái này tự viết lại câu chuyện cổ tích theo cách của riêng mình." },
  { id: 19, title: "Thể Thao Cực Hạn", cover: "assets/covers/h19.png",
    genres: ["Thể Thao", "Hành Động"],
    description: "Những cuộc đua tốc độ nghẹt thở, nơi giới hạn của cơ thể liên tục bị thử thách." },
  { id: 20, title: "Bảo Mẫu Xác Ướp", cover: "assets/covers/h20.png",
    genres: ["Hài Hước", "Học Đường", "Siêu Nhiên"],
    description: "Nhóm bạn học vô tình trở thành bảo mẫu bất đắc dĩ cho những sinh vật ướp xác tí hon phá phách." },
  { id: 21, title: "Cuộc Sống Một Mình Của Kotaro", cover: "assets/covers/h21.png",
    genres: ["Đời Thường", "Hài Hước", "Cảm Động"],
    description: "Cậu bé mẫu giáo sống một mình với phong thái già dặn khiến cả khu chung cư phải chú ý." },
];

/* Sinh thêm dữ liệu phụ (trạng thái, số chương, lượt xem, đánh giá, tác giả)
   một cách nhất quán theo id, để không cần khai báo tay từng trường. */
const STATUS_LIST = ["Đang Tiến Hành", "Hoàn Thành"];
STORIES.forEach((s) => {
  const seed = s.id * 937;
  s.status = STATUS_LIST[s.id % 2];
  s.chapterCount = 8 + (seed % 42);
  s.views = 1200 + (seed * 13) % 158000;
  s.rating = (4 + ((seed % 10) / 10)).toFixed(1);
  s.author = "Đang cập nhật";
  s.updatedDaysAgo = seed % 14;
  s.chapters = Array.from({ length: s.chapterCount }, (_, i) => {
    const chapNo = s.chapterCount - i; // mới nhất lên đầu
    return {
      number: chapNo,
      title: `Chương ${chapNo}`,
      daysAgo: i + (s.id % 3),
    };
  });
});

const ALL_GENRES = [...new Set(STORIES.flatMap((s) => s.genres))].sort();

function getStoryById(id) {
  return STORIES.find((s) => s.id === Number(id));
}
