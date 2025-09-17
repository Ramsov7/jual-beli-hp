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

// ====== Popup Detail ======
function showPopup(trx) {
  // hapus popup lama
  const old = document.getElementById("popupDetail");
  if (old) old.remove();

  const popup = document.createElement("div");
  popup.id = "popupDetail";
  popup.classList.add("popup-overlay");

  popup.innerHTML = `
    <div class="popup-card">
      <h3>${trx.tipe_varian || "Detail Transaksi"}</h3>
      <pre>${JSON.stringify(trx, null, 2)}</pre>
      <button id="closePopup">Tutup</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("closePopup").addEventListener("click", () => {
    popup.remove();
  });
}

// ====== Load Transaksi JSON ======
async function loadTransaksi() {
  try {
    const res = await fetch("transaksi.json");
    const data = await res.json();

    const container = document.getElementById("daftarTransaksi");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>Belum ada transaksi.</p>";
      return;
    }

    const table = document.createElement("table");
    table.classList.add("transaksi-table");

    table.innerHTML = `
      <thead>
        <tr>
          <th>Nama Unit</th>
          <th>Harga Beli</th>
          <th>Harga Jual</th>
          <th>Margin</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    data.forEach(trx => {
      const namaUnit = trx.tipe_varian || "-";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${namaUnit}</td>
        <td>Rp ${trx.harga_beli_unit?.toLocaleString("id-ID") || "-"}</td>
        <td>Rp ${trx.harga_jual?.toLocaleString("id-ID") || "-"}</td>
        <td>${trx.margin ? trx.margin + "%" : "-"}</td>
        <td><button class="detail-btn">Detail</button></td>
      `;

      // tombol detail -> popup
      row.querySelector(".detail-btn").addEventListener("click", () => {
        showPopup(trx);
      });

      tbody.appendChild(row);
    });

    container.appendChild(table);
  } catch (err) {
    console.error("Gagal memuat transaksi.json", err);
    document.getElementById("daftarTransaksi").innerHTML =
      "<p>Gagal memuat data transaksi.</p>";
  }
}

// load saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadTransaksi);