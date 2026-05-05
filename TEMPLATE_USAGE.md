# VMS Multi-Tenant Template

Repository ini adalah kerangka kerja (template) *multi-tenant* yang dikembangkan dari arsitektur VMS-ASP. Dengan *multi-tenancy*, Anda dapat menjalankan beberapa instansi aplikasi (seperti berbagai perusahaan atau organisasi yang berbeda) dalam satu server dan satu database, namun datanya tetap terisolasi secara aman.

## Fitur Utama

- **Isolasi Data Berbasis Tenant**: Setiap entitas utama (`User`, `Visit`, `WorkPermit`, dsb.) memiliki kolom `tenant_id`. Data hanya dapat diakses oleh user yang berada di dalam tenant yang sama.
- **Peran (Roles) Adaptif**:
  - `SUPERADMIN`: Admin sistem utama yang dapat mengelola (membuat, mengubah) tenant dan melihat seluruh data lintas tenant.
  - `ADMIN`: Admin level tenant yang hanya dapat melihat dan mengelola data di tenant (perusahaannya) sendiri.
  - `SECURITY`, `STAFF`, `USER`: Peran standar yang terikat pada tenant masing-masing.
- **Dynamic Tenant Selection**: Guest/Visitor dapat memilih tenant tujuan mereka saat melakukan registrasi, atau bisnis baru dapat mendaftarkan diri secara mandiri sebagai tenant baru.
- **Desain UI/UX Modern**: Mewarisi antarmuka VMS yang telah disempurnakan (Tailwind CSS, animasi halus, responsive).

---

## Cara Menggunakan Template Ini untuk Aplikasi Lain

Template ini sangat fleksibel dan dapat digunakan sebagai dasar untuk membangun aplikasi B2B SaaS lainnya seperti **E-Commerce**, **E-Learning**, atau **HRIS**. Berikut panduannya:

### 1. Menambahkan Model Baru

Jika Anda ingin membuat aplikasi **HRIS**, Anda mungkin memerlukan model `Employee`.
Semua model yang terkait dengan data bisnis *harus* memiliki referensi ke tabel `Tenants`.

Contoh di `backend/src/models/Employee.js`:
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' } },
  employee_code: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING }
});

module.exports = Employee;
```

Pastikan Anda mendaftarkan relasinya di `backend/src/models/index.js`:
```javascript
const Employee = require('./Employee');

Tenant.hasMany(Employee, { foreignKey: 'tenant_id' });
Employee.belongsTo(Tenant, { foreignKey: 'tenant_id' });
```

### 2. Mengamankan API (Tenant Scoping)

Di dalam Controller Anda, pastikan setiap *query* (pencarian, pembuatan, pembaruan, penghapusan) disaring berdasarkan `tenant_id` dari user yang sedang *login*.

Contoh di `EmployeeController.js`:
```javascript
exports.getAllEmployees = async (req, res) => {
    // Ambil semua pegawai hanya dari perusahaan (tenant) si admin
    const whereClause = {};
    if (req.user.role !== 'SUPERADMIN') {
        whereClause.tenant_id = req.user.tenant_id;
    }

    const employees = await Employee.findAll({ where: whereClause });
    res.json(employees);
};
```

### 3. Mengubah Registrasi

Jika aplikasi Anda bersifat B2B murni dan Anda tidak ingin pengunjung publik dapat mendaftarkan tenant baru (seperti di form pendaftaran VMS), Anda dapat mengubah `frontend/src/pages/Register.jsx` agar hanya menampilkan input "Tenant ID" atau "Kode Akses", dan menghapus bagian pembuatan `new_tenant_name`. 

Sebaliknya, jika ini aplikasi SaaS publik, alur pendaftaran di `Register.jsx` yang sudah kami siapkan sangat cocok untuk "Pendaftaran Bisnis Baru".

---

## Referensi Implementasi

Di dalam folder `examples/`, Anda dapat menemukan skema database untuk tiga jenis aplikasi berbeda yang bisa dibangun di atas template ini:

1. `examples/ecommerce.js` - Mengelola Produk, Pesanan, dan Pelanggan berdasarkan Tenant (Toko).
2. `examples/elearning.js` - Mengelola Kursus, Murid, dan Pengajar berdasarkan Tenant (Sekolah/Lembaga).
3. `examples/hris.js` - Mengelola Pegawai, Absensi, dan Penggajian berdasarkan Tenant (Perusahaan).

## Script Migrasi (Bagi Pengguna VMS Existing)

Jika Anda sudah menggunakan versi lama dari VMS-ASP dan ingin beralih ke arsitektur *multi-tenant* ini tanpa kehilangan data:

1. Sesuaikan string koneksi database di `.env`.
2. Jalankan perintah migrasi:
   ```bash
   node backend/migrate_multitenant.js
   ```
3. Skrip ini akan secara otomatis:
   - Membuat tabel `tenants`.
   - Mendaftarkan perusahaan Anda saat ini sebagai "Default Tenant" (VMS Utama).
   - Menautkan seluruh user, kunjungan, dan data lainnya ke tenant utama tersebut.
   - Mengangkat salah satu ADMIN menjadi SUPERADMIN.

---
*Dikembangkan oleh Tim ASP*
