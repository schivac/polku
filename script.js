function submitForm() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    let message = "Laporan Tindak Pidana:\n";

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const pasal = row.cells[0].innerText;
        const pelanggaran = row.cells[2].innerText;
        const denda = row.cells[3].innerText;
        const hukuman = row.cells[4].innerText;
        message += `Pasal: ${pasal}\nPelanggaran: ${pelanggaran}\nDenda: ${denda}\nHukuman: ${hukuman}\n\n`;
    });

    const webhookURL = 'https://discord.com/api/webhooks/1345512886264402022/OLosHZ2RYCLTYfrf9R--rL9KBaK6Bcp1klc0w2lxvk19-t6TGOd54EQZMbWdNb3Sl_De';

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
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
}

function resetForm() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
