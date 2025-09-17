// ====== Navigasi Bottom ======
const navButtons = document.querySelectorAll(".bottom-nav button");
const sections = document.querySelectorAll("main section");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // reset aktif
    navButtons.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    // aktifkan
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// ====== Load Data Transaksi dari JSON ======
function loadTransaksi() {
  fetch("transaksi.json")
    .then(response => response.json())
    .then(data => {
      let output = "<table border='1' cellpadding='5'>";
      output += "<tr><th>Kode Unit</th><th>Tipe & Varian</th><th>Harga Beli</th><th>Harga Jual</th><th>Laba Bersih</th></tr>";

      data.forEach(item => {
        output += `
          <tr>
            <td>${item.kode_unit}</td>
            <td>${item.tipe_varian}</td>
            <td>Rp ${item.harga_beli_unit.toLocaleString()}</td>
            <td>Rp ${item.harga_jual.toLocaleString()}</td>
            <td>Rp ${item.laba_bersih.toLocaleString()}</td>
          </tr>
        `;
      });

      output += "</table>";
      document.getElementById("daftarTransaksi").innerHTML = output;
    })
    .catch(err => {
      console.error("Gagal memuat transaksi.json", err);
      document.getElementById("daftarTransaksi").innerHTML = "<p>Gagal memuat data transaksi.</p>";
    });
}

// Panggil saat halaman pertama kali dibuka
loadTransaksi();