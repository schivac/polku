function kirimKeDiscord() {
    // Ambil nilai dari form
    const namaSuspect = document.getElementById('namaSuspect').value.trim();
    const idCard = document.getElementById('idCard').value.trim();
    const foto = document.getElementById('foto').value.trim();
    const namaPetugas = document.getElementById('namaPetugas').value.trim();
    
    // Validasi input
    if (!namaSuspect || !namaPetugas) {
        Swal.fire({
            title: 'Data Tidak Lengkap!',
            text: 'Nama suspect dan petugas wajib diisi!',
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-wide'
            }
        });
        return;
    }

    // Tampilkan loading
    Swal.fire({
        title: 'Sedang Memproses',
        html: '<div class="swal2-progress-steps">Mengirim laporan ke Discord...</div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#f8f9fa',
        backdrop: `
            rgba(0,0,0,0.6)
            url("/images/loading.gif")
            center top
            no-repeat
        `
    });

    // Format waktu
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const waktuLaporan = now.toLocaleDateString('id-ID', options);

    // Siapkan data untuk dikirim
    const message = {
        content: `**LAPORAN BARU - ${waktuLaporan.toUpperCase()}**\n\n` +
                 `**NAMA SUSPECT:** ${namaSuspect}\n` +
                 `**ID CARD:** ${idCard || 'Tidak dilaporkan'}\n` +
                 `**FOTO:** ${foto || 'Tidak dilampirkan'}\n` +
                 `**PASAL:** ${currentData.pasalString}\n` +
                 `**BERAPA BULAN:** ${currentData.totalJail} Bulan\n` +
                 `**DENDA:** Rp${currentData.totalDenda}\n` +
                 `**KRONOLOGI:**\n${currentData.deskripsiList.map(item => `• ${item}`).join('\n')}\n` +
                 `**HUKUMAN MATI:** ${currentData.adaHukumanMati ? "YA" : "TIDAK"}\n\n` +
                 `**PETUGAS:** ${namaPetugas}\n` +
                 `_Laporan otomatis dibuat oleh Sistem Pelaporan Hukum_`
    };

    // Konfigurasi pengiriman
    const WEBHOOK_URL_DISCORD = "https://discord.com/api/webhooks/1368679759739093105/rZgo3X_YbC5rfaWLdzcgezAmZZNlARsFtGBmnhxEVX9QauvfP_Eqa4-Ym5XdPP1n5dRx";
    
    fetch(WEBHOOK_URL_DISCORD, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Notifikasi sukses
        Swal.fire({
            title: 'Berhasil!',
            html: `<div style="text-align:left;">
                     <p>Laporan berhasil dikirim ke Discord!</p>
                     <p><strong>Detail:</strong></p>
                     <ul>
                       <li>Suspect: ${namaSuspect}</li>
                       <li>Total Pasal: ${currentData.pasalString.split(',').length}</li>
                       <li>Total Denda: Rp${currentData.totalDenda}</li>
                     </ul>
                   </div>`,
            icon: 'success',
            confirmButtonText: 'Tutup',
            showCancelButton: true,
            cancelButtonText: 'Lihat Preview',
            reverseButtons: true,
            footer: `<small>ID Laporan: ${now.getTime()}</small>`,
            willClose: () => {
                // Reset form setelah notifikasi ditutup
                document.getElementById('discordModal').style.display = 'none';
                document.getElementById('namaSuspect').value = '';
                document.getElementById('idCard').value = '';
                document.getElementById('foto').value = '';
                document.getElementById('namaPetugas').value = '';
                currentData = {};
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                // Jika user klik "Lihat Preview"
                tampilkanPreview();
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Notifikasi error
        Swal.fire({
            title: 'Gagal Mengirim!',
            html: `<div style="text-align:left;">
                     <p>Terjadi kesalahan saat mengirim laporan:</p>
                     <p><code>${error.message}</code></p>
                     <p>Silahkan coba lagi atau hubungi administrator.</p>
                   </div>`,
            icon: 'error',
            confirmButtonText: 'Coba Lagi',
            showCancelButton: true,
            cancelButtonText: 'Simpan Draft',
            focusConfirm: false,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                kirimKeDiscord(); // Coba kirim ulang
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Simpan ke localStorage sebagai draft
                const draftData = {
                    namaSuspect,
                    idCard,
                    foto,
                    namaPetugas,
                    ...currentData,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('draftLaporan', JSON.stringify(draftData));
                Swal.fire('Draft Tersimpan!', 'Laporan telah disimpan di browser Anda.', 'info');
            }
        });
    });
}