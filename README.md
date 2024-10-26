Command for build to .exe:
mkdir -p ./build && node buildScript.js && cp ./package.json ./build && cp ./.env ./build && cp ./README.md ./build

Requirment App:
1. Nodejs v 14.20.0

Cara Pertama kali Menjalankan .exe:
1. Rubah dan sesuaikan file .env (koneksi database juga port backend)
2. jalankan command menggunakan CMD "npm install"
3. Jalankan Backend.exe
4. Hit/request ke ENDPOINT GET: {{local}}/api/v1/sync-table (menggunakan postman), token ada diadalam file .env
5. Jalankan No.3 dan No.4 sebanyak 2 kali lagi.
6. Ready to use