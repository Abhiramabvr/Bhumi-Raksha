# KONSEP PROJECT UAS — Bhumi Raksha: Skies of Tomorrow

**Teknologi Multimedia**

“Website Games Multimedia Interaktif”

Disusun Oleh: PROJECT GREEN ASCENT

- Abhirama Balaphradana Vishnu R – 2338018077
- M Rizqi Akbar Hidayat – 2300018409
- Afif Hadriansyah - 2300018400

PROGRAM STUDI S1 INFORMATIKA
FAKULTAS TEKNOLOGI INDUSTRI
UNIVERSITAS AHMAD DAHLAN
2026

## BHUMI RAKSHA
Skies of Tomorrow
Game Edukasi Interaktif Berbasis Web
Bertema SDGs Goal 13: Climate Action

**Mata Kuliah:** Teknologi Multimedia

**Program Studi:** Informatika

**Anggota Tim:** 3 Orang

**Platform:** Web Browser (JavaScript)

**Game Engine:** Phaser.js 3

---

# Dokumen Konsep Proyek

## BAB 1 — PENDAHULUAN

### 1.1 Latar Belakang

Perubahan iklim merupakan salah satu tantangan terbesar yang dihadapi umat manusia saat ini. Isu ini menjadi perhatian global yang tertuang dalam Sustainable Development Goals (SDGs) khususnya Goal 13: Climate Action, yang menekankan pentingnya tindakan segera dalam menghadapi perubahan iklim dan dampaknya.

Di lingkungan kampus, khususnya pada kegiatan Program Pengenalan Kampus (P2K/Ospek), diperlukan media pengenalan yang menarik dan interaktif agar mahasiswa baru dapat memahami isu lingkungan secara menyenangkan. Media pembelajaran konvensional seperti slide presentasi dan ceramah seringkali kurang efektif dalam menarik perhatian peserta muda.

Oleh karena itu, tim kami merancang Bhumi Raksha: Skies of Tomorrow, sebuah game edukasi berbasis web yang menggabungkan mekanik permainan seru dengan konten edukatif seputar SDGs Goal 13, efek rumah kaca, pemanasan global, dan isu lingkungan lainnya. Game ini dirancang agar dapat dimainkan langsung di browser tanpa instalasi apapun, sehingga mudah didemonstrasikan saat P2K maupun dikumpulkan sebagai tugas kuliah.

### 1.2 Tujuan Proyek

- Membuat aplikasi multimedia interaktif berbasis web dalam bentuk game edukasi
- Menyampaikan materi SDGs Goal 13 (Climate Action) secara menarik dan gamifikasi
- Menghasilkan produk yang dapat digunakan sebagai media edukasi pada kegiatan P2K/Ospek
- Melatih kemampuan tim dalam pengembangan game web menggunakan JavaScript dan Phaser.js

### 1.3 Manfaat Proyek

- Bagi mahasiswa baru: mendapat pengenalan isu lingkungan dengan cara yang menyenangkan
- Bagi kampus: tersedia media edukasi lingkungan yang modern dan interaktif untuk P2K
- Bagi tim pengembang: pengalaman nyata dalam game development berbasis web

## BAB 2 — KONSEP GAME

### 2.1 Deskripsi Umum

Bhumi Raksha: Skies of Tomorrow adalah game bergenre endless runner berbasis web di mana pemain mengendalikan pesawat ramah lingkungan yang terbang melintasi langit bumi. Pemain harus menghindari obstacle biasa dengan menggerakkan pesawat secara manual, namun untuk obstacle khusus (yang melambangkan ancaman lingkungan), pemain wajib menjawab pertanyaan seputar lingkungan dan SDGs. Jika jawaban benar, pesawat menembakkan laser/peluru untuk menghancurkan obstacle tersebut.

### 2.2 Core Gameplay Loop

Alur permainan secara umum mengikuti tahapan berikut:

1. Terbang — Pesawat terbang otomatis; obstacle datang dari arah kanan layar.
2. Obstacle Biasa — Pemain menghindar dengan menggerakkan pesawat naik atau turun.
3. Obstacle Khusus — Soal pertanyaan seputar lingkungan/SDGs ditampilkan kepada pemain.
4a. Jawaban Benar — Pesawat menembakkan peluru, obstacle hancur, skor bertambah +100.
4b. Jawaban Salah — Pesawat tidak dapat menembak; pemain harus menghindar manual atau kehilangan 1 nyawa.

### 2.3 Mekanik Detail

Kontrol Pesawat:

- Tombol ↑ / W: Pesawat naik
- Tombol ↓ / S: Pesawat turun
- Lepas tombol: Pesawat hover (diam)
- Tidak ada gravitasi
- Tap layar atas: Pesawat naik (mobile)
- Tap layar bawah: Pesawat turun (mobile)

Sistem Nyawa dan Skor:

- Pemain memiliki 3 nyawa (ditampilkan sebagai ikon hati di HUD)
- Skor bertambah +100 setiap jawaban benar
- Bonus skor +50 jika menjawab dalam waktu kurang dari 5 detik
- Nyawa berkurang -1 jika terkena obstacle
- Game over ketika nyawa habis, ditampilkan layar skor akhir

Sistem Pertanyaan:

- Pertanyaan muncul ketika obstacle khusus memasuki area layar
- Setiap pertanyaan memiliki 4 pilihan jawaban (A, B, C, D)
- Timer per pertanyaan: 10 detik
- Jika waktu habis sebelum menjawab, dihitung sebagai jawaban salah
- Semua pertanyaan tersimpan dalam file `data/questions.json` yang mudah diedit

## BAB 3 — KONTEN EDUKASI

### 3.1 Tema: SDGs Goal 13 — Climate Action

Seluruh konten pertanyaan dalam Bhumi Raksha: Skies of Tomorrow berfokus pada SDGs Goal 13 yang bertujuan mengambil tindakan segera untuk memerangi perubahan iklim dan dampaknya. Tema ini dipilih karena relevan dengan kondisi bumi saat ini dan sesuai dengan nilai-nilai kampus hijau (Green Campus).

### 3.2 Kategori Pertanyaan

| Kategori | Jumlah Soal | Contoh Topik |
|---|---:|---|
| Efek Rumah Kaca | 10 soal | Gas penyebab, proses, dampak |
| Pemanasan Global | 10 soal | Kenaikan suhu, es mencair, banjir rob |
| SDGs Goal 13 | 10 soal | Target, indikator, aksi nyata |
| Energi Terbarukan | 5 soal | Solar, angin, hidro, geothermal |
| Polusi & Limbah | 5 soal | Polusi udara, sampah plastik, daur ulang |

**Total:** 40 soal

### 3.3 Contoh Pertanyaan

Contoh beberapa pertanyaan termasuk topik gas rumah kaca, efek rumah kaca, perubahan iklim, energi geothermal, dan kenaikan permukaan laut.

## BAB 4 — SPESIFIKASI TEKNIS

### 4.1 Tech Stack

- JavaScript (ES6+) — Bahasa pemrograman utama
- Phaser.js 3 (v3.60+) — Game engine (fisika, animasi, input)
- HTML5 Canvas — Rendering game di browser
- CSS3 / HTML5 — Styling UI di luar game (menu, wrapper)
- JSON — Penyimpanan data soal & level
- Paint Tool SAI — Desain aset grafis & karakter pesawat

### 4.2 Struktur Folder Proyek

- `index.html` — Entry point aplikasi web
- `src/main.js` — Inisialisasi Phaser & konfigurasi game
- `src/scenes/MenuScene.js` — Tampilan menu utama & pilih level
- `src/scenes/GameScene.js` — Logic utama: pesawat, obstacle, kontrol
- `src/scenes/QuestionScene.js` — Popup pertanyaan & sistem jawaban
- `src/scenes/ScoreScene.js` — Tampilan skor akhir & retry
- `src/utils/QuestionManager.js` — Load & randomize soal dari JSON
- `data/questions.json` — Database semua pertanyaan & jawaban
- `assets/images/` — Sprite pesawat, obstacle, background
- `assets/audio/` — BGM, SFX benar/salah, efek tembak

### 4.3 Fitur Unggulan

- Berjalan di browser tanpa instalasi — cukup buka file `index.html`
- Desain pesawat original karya tim (dibuat di Paint Tool SAI)
- Sistem soal modular berbasis JSON — mudah ditambah dan diedit
- Mendukung input keyboard dan touch screen (mobile-friendly)
- Animasi tembak peluru ketika menjawab dengan benar
- HUD informatif: nyawa, skor, timer soal ditampilkan real-time
- Tiga level kesulitan: Mudah (15 detik/soal), Sedang (10 detik), Sulit (7 detik)

## BAB 5 — TIM DAN RENCANA PENGERJAAN

### 5.1 Pembagian Tugas Tim

- Abhi — UI Developer: `index.html`, `MenuScene.js`, `ScoreScene.js`, CSS wrapper, desain aset (SAI)
- Rizqi — Game Logic: `GameScene.js`, `QuestionScene.js`, fisika pesawat, sistem tembak, obstacle
- Afif — Konten & Aset: `questions.json` (40 soal), riset materi SDGs, SFX/BGM, testing

### 5.2 Timeline Pengerjaan (4 Minggu)

- Minggu 1: Setup & Prototipe — Pesawat muncul di layar, bergerak naik/turun, background scroll
- Minggu 2: Core Mechanic — Obstacle spawn, sistem tembak, popup soal berfungsi, scoring berjalan
- Minggu 3: Konten & Polish — 40 soal selesai, menu & score screen, SFX/BGM, 3 level
- Minggu 4: Finishing — Bug fix, balancing, dokumentasi, persiapan presentasi P2K

## BAB 6 — PENUTUP

### 6.1 Kesimpulan

Bhumi Raksha: Skies of Tomorrow merupakan proyek aplikasi multimedia interaktif yang menggabungkan hiburan dan edukasi dalam satu platform. Dengan menggunakan JavaScript dan Phaser.js sebagai fondasi teknis, game ini dapat diakses langsung melalui browser tanpa instalasi tambahan, menjadikannya solusi yang praktis dan fleksibel.

Konten pertanyaan yang berfokus pada SDGs Goal 13 dan isu lingkungan menjadikan Bhumi Raksha: Skies of Tomorrow bukan sekadar game biasa, melainkan media edukasi yang bermakna. Desain pesawat dan aset grafis yang dibuat secara original oleh tim juga menjadi nilai tambah yang menunjukkan kreativitas dan orisinalitas proyek.

### 6.2 Target Luaran

- Aplikasi game web yang berjalan di semua browser modern
- Bank soal sebanyak minimal 40 pertanyaan seputar SDGs Goal 13
- Dokumentasi proyek lengkap (dokumen konsep, README, komentar kode)
- Demo langsung pada kegiatan P2K/Ospek kampus

### 6.3 Potensi Pengembangan Lanjutan

- Leaderboard online menggunakan Firebase untuk kompetisi antar mahasiswa
- Penambahan tema soal lain (SDGs lainnya, materi perkuliahan)
- Versi mobile menggunakan Capacitor.js agar bisa diinstall di HP
- Mode multiplayer untuk dimainkan bersama secara real-time

> Catatan: 10 item yang sudah dikerjakan tidak perlu dibuat ulang.
