let globalData = null;

document.addEventListener('DOMContentLoaded', () => {
    // Memuat data JSON dari direktori data
    fetch('data/data_penduduk.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal memuat file JSON');
            }
            return response.json();
        })
        .then(data => {
            globalData = data;
            renderSummary(data);
            renderDusun(data.dusun);
        })
        .catch(error => console.error('Error:', error));

    // Logika Pencarian Real-time
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const container = document.getElementById('searchResultContainer');
        const list = document.getElementById('searchResultList');

        if (keyword === '') {
            container.classList.add('hidden');
            list.innerHTML = '';
            return;
        }

        const results = cariPenduduk(keyword);
        container.classList.remove('hidden');
        
        if (results.length === 0) {
            list.innerHTML = '<div class="p-4 text-gray-500 text-center">Warga atau nomor rumah tidak ditemukan.</div>';
            return;
        }

        let html = '';
        results.forEach(res => {
            html += `
                <div class="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                        <span class="font-bold text-blue-600">${res.nama}</span>
                        <p class="text-sm text-gray-500">No. Rumah: ${res.nomor_rumah}</p>
                    </div>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">${res.dusun}</span>
                </div>
            `;
        });
        list.innerHTML = html;
    });
});

// Fungsi untuk melakukan pencarian di seluruh objek dusun dan warga
function cariPenduduk(keyword) {
    if (!globalData) return [];
    let hasil = [];
    
    globalData.dusun.forEach(dusun => {
        dusun.warga.forEach(w => {
            if (w.nama.toLowerCase().includes(keyword) || w.nomor_rumah.includes(keyword)) {
                hasil.push({
                    nama: w.nama,
                    nomor_rumah: w.nomor_rumah,
                    dusun: dusun.nama_dusun
                });
            }
        });
    });
    return hasil;
}

// Fungsi render kartu ringkasan total penduduk
function renderSummary(data) {
    const container = document.getElementById('statsContainer');
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 class="text-gray-500 text-sm font-medium uppercase">Total Kepala Keluarga (KK)</h3>
            <p class="text-3xl font-bold text-gray-800 mt-2">${data.ringkasan.total_kk}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 class="text-gray-500 text-sm font-medium uppercase">Total Jiwa</h3>
            <p class="text-3xl font-bold text-gray-800 mt-2">${data.ringkasan.total_jiwa}</p>
        </div>
    `;
}

// Fungsi render informasi statistik dan daftar warga per dusun
function renderDusun(dusunList) {
    const container = document.getElementById('dusunContainer');
    let html = '<h2 class="text-xl font-semibold mb-4 text-gray-700">Statistik per Dusun</h2>';
    
    dusunList.forEach(dusun => {
        html += `
            <div class="bg-white p-6 rounded-lg shadow mb-4">
                <h3 class="text-lg font-bold text-gray-800 mb-3">${dusun.nama_dusun}</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div class="bg-gray-50 p-3 rounded border">
                        <span class="text-gray-500 block">Jumlah KK</span>
                        <span class="font-bold text-base">${dusun.jumlah_kk}</span>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <span class="text-gray-500 block">Total Jiwa</span>
                        <span class="font-bold text-base">${dusun.jumlah_jiwa.total} <span class="text-xs text-gray-500">(L:${dusun.jumlah_jiwa.laki_laki}, P:${dusun.jumlah_jiwa.perempuan})</span></span>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <span class="text-gray-500 block">Rumah Permanen</span>
                        <span class="font-bold text-base">${dusun.kondisi_rumah.permanen}</span>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <span class="text-gray-500 block">Tidak Punya Rumah</span>
                        <span class="font-bold text-base">${dusun.kondisi_rumah.tidak_memiliki_rumah}</span>
                    </div>
                </div>
                <details class="group">
                    <summary class="cursor-pointer text-blue-600 font-medium text-sm hover:underline">Lihat Daftar Warga (${dusun.warga.length} orang)</summary>
                    <div class="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100 bg-gray-50 p-2">
        `;
        
        dusun.warga.forEach(w => {
            html += `
                <div class="p-2 text-sm flex justify-between items-center bg-white mb-1 rounded px-3 shadow-sm">
                    <span class="font-medium">${w.nama}</span>
                    <span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">No. Rumah: ${w.nomor_rumah}</span>
                </div>
            `;
        });

        html += `
                    </div>
                </details>
            </div>
        `;
    });

    container.innerHTML = html;
}