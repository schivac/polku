function kirimKeDiscord() {
    // Ambil nilai dari form
    const namaSuspect = document.getElementById('namaSuspect').value.trim();
    const idCard = document.getElementById('idCard').value.trim();
    const foto = document.getElementById('foto').value.trim();
    const namaPetugas = document.getElementById('namaPetugas').value.trim();
    
    // Validasi input sederhana
    if (!namaSuspect || !namaPetugas) {
        Swal.fire({
            title: 'Oops...',
            text: 'Nama suspect dan petugas wajib diisi!',
            icon: 'warning'
        });
        return;
    }

    // Tampilkan loading sederhana
    Swal.fire({
        title: 'Mengirim Laporan',
        text: 'Sedang memproses...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Format pesan tetap sama
    const message = {
        content: `**LAPORAN BARU - DATA PELANGGARAN**\n\n` +
                 `**NAMA SUSPECT:** ${namaSuspect}\n` +
                 `**ID CARD:** ${idCard || '-'}\n` +
                 `**PASAL:** ${currentData.pasalString}\n` +
                 `**FOTO:** ${foto || '-'}\n` +
                 `**BERAPA BULAN:** ${currentData.totalJail} hari\n` +
                 `**DENDA:** ${currentData.totalDenda}\n` +
                 `**KRONOLOGI SUSPECT:**\n` +
                 `${currentData.deskripsiList.map(item => `• ${item}`).join('\n')}\n` +
                 `**HUKUMAN MATI:** ${currentData.adaHukumanMati ? "YA" : "TIDAK"}\n\n` +
                 `**NAMA PETUGAS:** ${namaPetugas}\n` +
                 `*Laporan dibuat pada: ${new Date().toLocaleString()}*`
    };

    // URL webhook (sama seperti sebelumnya)
    const WEBHOOK_URL_DISCORD = "https://discord.com/api/webhooks/1368679759739093105/rZgo3X_YbC5rfaWLdzcgezAmZZNlARsFtGBmnhxEVX9QauvfP_Eqa4-Ym5XdPP1n5dRx";
    
    fetch(WEBHOOK_URL_DISCORD, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    })
    .then(response => {
        if (response.ok) {
            // Notifikasi sukses sederhana
            Swal.fire({
                title: 'Berhasil!',
                text: 'Laporan berhasil dikirim ke Discord',
                icon: 'success'
            });
            
            // Reset form
            document.getElementById('discordModal').style.display = 'none';
            document.getElementById('namaSuspect').value = '';
            document.getElementById('idCard').value = '';
            document.getElementById('foto').value = '';
            document.getElementById('namaPetugas').value = '';
        } else {
            throw new Error('Gagal mengirim ke Discord');
        }
    })
    .catch(error => {
        // Notifikasi error sederhana
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan: ' + error.message,
            icon: 'error'
        });
    });
}