# 🌍 Bhumi Raksha: Skies of Tomorrow

> Game edukasi interaktif berbasis web bertema **SDGs Goal 13 — Climate Action**.

Bhumi Raksha adalah endless runner di mana pemain mengendalikan pesawat ramah lingkungan, menghindari obstacle polusi, dan menjawab pertanyaan edukatif seputar isu lingkungan untuk menghancurkan obstacle khusus.

---

## 📁 Struktur Proyek

```
Bhumi-Raksha/
├── index.html                    ← Entry point utama
├── src/
│   ├── main.js                   ← Inisialisasi Phaser & konfigurasi game
│   ├── scenes/
│   │   ├── MenuScene.js          ← Menu utama & pilih level
│   │   ├── GameScene.js          ← Logic utama: pesawat, obstacle, kontrol
│   │   ├── QuestionScene.js      ← Popup pertanyaan & sistem jawaban
│   │   └── ScoreScene.js         ← Tampilan skor akhir & retry
│   └── utils/
│       └── QuestionManager.js    ← Load & randomize soal dari JSON
├── data/
│   └── questions.json            ← Database 40 pertanyaan & jawaban
├── assets/
│   ├── images/                   ← Sprite pesawat, obstacle, background
│   ├── audio/                    ← BGM & SFX
│   ├── css/
│   │   └── style.css             ← Styling HUD & landing page
│   └── video/                    ← Video intro
├── docs/
│   └── CONCEPT.md                ← Dokumen konsep proyek lengkap
├── .github/
│   └── workflows/
│       └── deploy.yml            ← Auto-deploy ke InfinityFree via FTP
└── README.md
```

## 🎮 Tech Stack

| Teknologi | Fungsi |
|---|---|
| JavaScript (ES6+) | Bahasa pemrograman utama |
| Phaser.js 3 | Game engine (rendering, input, tween) |
| HTML5 Canvas | Rendering game di browser |
| CSS3 | Styling UI & landing page |
| JSON | Penyimpanan data soal & level |
| GitHub Actions | CI/CD auto-deploy ke hosting |

## 🚀 Menjalankan Secara Lokal

Buka `index.html` di browser, atau jalankan local server:

```bash
# Python 3
python -m http.server 8000
# Lalu buka http://localhost:8000

# Atau dengan Node.js (npx)
npx serve .
```

> ⚠️ File harus dijalankan melalui server (bukan `file://`) karena menggunakan ES Modules dan `fetch()`.

---

## 🌐 Deployment ke InfinityFree via GitHub

### Langkah 1: Buat Akun InfinityFree

1. Buka [infinityfree.com](https://www.infinityfree.com/) dan daftar akun gratis
2. Klik **"Create Account"** untuk buat akun hosting baru
3. Pilih subdomain (misal: `bhumiraksha.infinityfreeapp.com`) atau gunakan domain sendiri
4. Catat informasi FTP yang muncul:
   - **FTP Server**: `ftpupload.net`
   - **FTP Username**: `epiz_XXXXXXXX` (contoh)
   - **FTP Password**: password yang kamu buat

### Langkah 2: Setup Repository GitHub

1. Buat repository di GitHub (misal: `Bhumi-Raksha`)
2. Push seluruh kode project ke branch `main`:

```bash
git init
git add .
git commit -m "Initial commit: Bhumi Raksha game"
git branch -M main
git remote add origin https://github.com/USERNAME/Bhumi-Raksha.git
git push -u origin main
```

### Langkah 3: Tambahkan FTP Secrets di GitHub

1. Buka repository di GitHub
2. Pergi ke **Settings** → **Secrets and variables** → **Actions**
3. Klik **"New repository secret"** dan tambahkan 3 secrets:

| Secret Name | Value |
|---|---|
| `FTP_SERVER` | `ftpupload.net` |
| `FTP_USERNAME` | Username FTP dari InfinityFree (contoh: `epiz_12345678`) |
| `FTP_PASSWORD` | Password FTP dari InfinityFree |

### Langkah 4: Deploy Otomatis!

Setelah secrets ditambahkan, setiap kali kamu `git push` ke branch `main`, GitHub Actions akan **otomatis upload** semua file ke InfinityFree.

Cek status deploy di tab **Actions** di repository GitHub.

### Langkah 5: Akses Game

Buka browser dan akses URL subdomain InfinityFree kamu, contoh:
```
https://bhumiraksha.infinityfreeapp.com
```

---

## 🎯 Fitur Game

- ✈️ **Endless Runner** — Pesawat terbang otomatis, obstacle datang dari kanan
- ❓ **Pertanyaan Edukasi** — 40 soal seputar SDGs Goal 13 & isu lingkungan
- 🎮 **3 Level Kesulitan** — Mudah (15s), Sedang (10s), Sulit (7s) per soal
- 💚 **Sistem Tembak** — Jawab benar = tembak laser, hancurkan obstacle
- ❤️ **3 Nyawa** — Game over jika habis terkena obstacle
- 📱 **Mobile-Friendly** — Touch screen support
- 🔄 **Auto-Deploy** — Push ke GitHub = live di InfinityFree

---

## 👥 Tim Pengembang — Project Green Ascent

| Nama | Peran | NIM |
|---|---|---|
| Abhirama Balaphradana Vishnu R | UI Developer | 2338018077 |
| M Rizqi Akbar Hidayat | Game Logic | 2300018409 |
| Afif Hadriansyah | Konten & Aset | 2300018400 |

**Program Studi S1 Informatika** — Fakultas Teknologi Industri  
**Universitas Ahmad Dahlan** — 2026

---

*Bersama kita jaga bumi 🌍 — SDGs Goal 13: Climate Action*
