document.getElementById('crimeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const pasal = document.getElementById('pasal').value;
    const pelanggaran = document.getElementById('pelanggaran').value;
    const denda = document.getElementById('denda').value;
    const penjara = document.getElementById('penjara').value;

    const webhookURL = 'https://discord.com/api/webhooks/1345512886264402022/OLosHZ2RYCLTYfrf9R--rL9KBaK6Bcp1klc0w2lxvk19-t6TGOd54EQZMbWdNb3Sl_De';

    const data = {
        content: `Laporan Tindak Pidana:\nPasal: ${pasal}\nPelanggaran: ${pelanggaran}\nDenda: ${denda}\nMassa Tahanan: ${penjara}`
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            alert('Data berhasil dikirim ke Discord!');
        } else {
            alert('Gagal mengirim data.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
