<script>
// Variabel global untuk menyimpan data
let currentData = {};

// Semua function kamu tetap sama di sini, tidak perlu diubah, karena error utama dari HTML nya.

function hitungTotal() {
    const checkboxes = document.querySelectorAll('.checkbox:checked');

    if (checkboxes.length === 0) {
        document.getElementById('hasil-total').innerHTML = "Tidak ada pasal yang dipilih.";
        document.getElementById('tabel-uu').style.display = 'none';
        currentData = {};
        return;
    }

    let totalPasal = 0;
    let totalDenda = 0;
    let totalJail = 0;
    let deskripsiList = [];
    let perluImpound = false;
    let adaHukumanMati = false;
    let kodePasalList = [];

    checkboxes.forEach(cb => {
        const fineRaw = cb.dataset.fine || "";
        const jailRaw = cb.dataset.jail || "";
        const desc = cb.dataset.desc || "Tidak ada deskripsi";
        const code = cb.dataset.code || "???";

        // Deteksi HUKUMAN MATI
        if (jailRaw.toUpperCase().includes("HUKUMAN MATI")) {
            adaHukumanMati = true;
        }

        // Hitung jumlah hari penjara
        let jailAngka = 0;
        if (jailRaw.includes("/")) {
            const parts = jailRaw.split("/");
            jailAngka = parseInt(parts[1]) || 0;
        } else {
            jailAngka = parseInt(jailRaw) || 0;
        }

        const denda = isNaN(parseInt(fineRaw)) ? 0 : parseInt(fineRaw);

        totalPasal++;
        totalDenda += denda;
        totalJail += jailAngka;
        deskripsiList.push(desc);
        kodePasalList.push(code);

        if (jailRaw.toUpperCase().includes("IMPOUND") ||
            fineRaw.toUpperCase().includes("IMPOUND") ||
            desc.toUpperCase().includes("SAMSAT")) {
            perluImpound = true;
        }
    });

    const hasil = `
        <div style="text-align: left; line-height: 1.6;">
            <strong>Jumlah Pasal:</strong> ${totalPasal} pasal<br>
            <strong>Deskripsi Pelanggaran:</strong><br>
            <ul style="margin-left: 20px; padding-left: 0; list-style-position: inside;">
                ${deskripsiList.map(d => `<li style="margin-left: 0;">${d}</li>`).join('')}
            </ul>
            <strong>Total Denda:</strong> Rp. ${formatRupiah(totalDenda)}<br>
            <strong>Total Penjara:</strong> ${totalJail} hari<br>
            ${adaHukumanMati ? '<strong style="color:red;">HUKUMAN MATI</strong><br>' : ''}
            <strong>Impound Kendaraan:</strong> ${perluImpound ? 'YA' : 'Tidak'}
        </div>
    `;
    
    document.getElementById('hasil-total').innerHTML = hasil;
    document.getElementById('hasil-total').style.display = 'block';

    currentData = {
        pasalString: kodePasalList.join(', '),
        totalJail: totalJail,
        totalDenda: formatRupiah(totalDenda),
        deskripsiList: deskripsiList,
        adaHukumanMati: adaHukumanMati
    };

    const pasalString = kodePasalList.join(', ');
    const isiTabel = `
        <p><strong>${pasalString}</strong> — <strong>${totalJail} hari</strong></p>
    `;
    document.getElementById('isi-tabel-uu').innerHTML = isiTabel;
    document.getElementById('tabel-uu').style.display = 'block';
}

function tampilkanModalDiscord() {
    if (Object.keys(currentData).length === 0) {
        alert("Silahkan tekan tombol TOTAL terlebih dahulu untuk mengumpulkan data pelanggaran.");
        return;
    }
    document.getElementById('discordModal').style.display = 'flex';
}

function kirimKeDiscord() {
    const namaSuspect = document.getElementById('namaSuspect').value;
    const idCard = document.getElementById('idCard').value;
    const foto = document.getElementById('foto').value;
    
    if (!namaSuspect) {
        alert("Nama suspect harus diisi!");
        return;
    }

    const message = {
        content: "**LAPORAN BARU**",
        embeds: [{
            title: "DATA PELANGGARAN",
            color: 0xff0000,
            fields: [
                { name: "NAMA SUSPECT", value: namaSuspect },
                { name: "ID CARD", value: idCard },
                { name: "PASAL", value: currentData.pasalString },
                { name: "FOTO", value: foto },
                { name: "BERAPA BULAN", value: currentData.totalJail.toString() },
                { name: "DENDA", value: currentData.totalDenda },
                { name: "KRONOLOGI SUSPECT", value: '• ' + currentData.deskripsiList.join('\n• ') },
                { name: "HUKUMAN MATI", value: currentData.adaHukumanMati ? "YA" : "TIDAK" }
            ],
            timestamp: new Date().toISOString()
        }]
    };

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
            alert("Laporan berhasil dikirim ke Discord!");
            document.getElementById('discordModal').style.display = 'none';
        } else {
            throw new Error('Gagal mengirim ke Discord');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Gagal mengirim laporan ke Discord: " + error.message);
    });
}

function salinUU() {
    const isi = document.getElementById('isi-tabel-uu').innerText;
    if (!isi) {
        alert("Belum ada pasal yang dipilih.");
        return;
    }

    navigator.clipboard.writeText(isi)
        .then(() => alert("Disalin ke clipboard:\n" + isi))
        .catch(err => alert("Gagal menyalin: " + err));
}

function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
</script>
