// Variabel Global
let currentData = {};

// Event Listener untuk tombol
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnTotal').addEventListener('click', hitungTotal);
    document.getElementById('btnSalin').addEventListener('click', salinUU);
    document.getElementById('btnDiscord').addEventListener('click', tampilkanModalDiscord);
    document.getElementById('btnKirimDiscord').addEventListener('click', kirimKeDiscord);
    document.getElementById('btnBatal').addEventListener('click', () => {
        document.getElementById('discordModal').style.display = 'none';
    });
});

// Fungsi-fungsi
function hitungTotal() {
    const checkboxes = document.querySelectorAll('.checkbox:checked');

    if (checkboxes.length === 0) {
        document.getElementById('hasil-total').innerHTML = "Tidak ada pasal yang dipilih.";
        document.getElementById('tabel-uu').style.display = 'none';
        currentData = {};
        return;
    }

    let totalPasal = 0, totalDenda = 0, totalJail = 0;
    let deskripsiList = [], kodePasalList = [];
    let perluImpound = false, adaHukumanMati = false;

    checkboxes.forEach(cb => {
        const fineRaw = cb.dataset.fine || "";
        const jailRaw = cb.dataset.jail || "";
        const desc = cb.dataset.desc || "Tidak ada deskripsi";
        const code = cb.dataset.code || "???";

        if (jailRaw.toUpperCase().includes("HUKUMAN MATI")) adaHukumanMati = true;

        let jailAngka = jailRaw.includes("/") ? parseInt(jailRaw.split("/")[1]) || 0 : parseInt(jailRaw) || 0;
        let denda = isNaN(parseInt(fineRaw)) ? 0 : parseInt(fineRaw);

        totalPasal++;
        totalDenda += denda;
        totalJail += jailAngka;
        deskripsiList.push(desc);
        kodePasalList.push(code);

        if (jailRaw.toUpperCase().includes("IMPOUND") || fineRaw.toUpperCase().includes("IMPOUND") || desc.toUpperCase().includes("SAMSAT")) {
            perluImpound = true;
        }
    });

    const hasil = `
        <div style="text-align: left; line-height: 1.6;">
            <strong>Jumlah Pasal:</strong> ${totalPasal} pasal<br>
            <strong>Deskripsi Pelanggaran:</strong><br>
            <ul>${deskripsiList.map(d => `<li>${d}</li>`).join('')}</ul>
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
        totalJail,
        totalDenda: formatRupiah(totalDenda),
        deskripsiList,
        adaHukumanMati
    };

    document.getElementById('isi-tabel-uu').innerHTML = `<p><strong>${currentData.pasalString}</strong> — <strong>${totalJail} hari</strong></p>`;
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
        headers: { "Content-Type": "application/json" },
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
