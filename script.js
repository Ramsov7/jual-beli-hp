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

// ====== Load Items JSON ======
async function loadItems() {
  try {
    const res = await fetch("items.json");
    const data = await res.json();
    const container = document.getElementById("items-list");

    container.innerHTML = ""; // reset isi
    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("list-item");
      div.innerHTML = `
        <span>${item.tipe_varian}</span>
        <span>Kode: ${item.kode_unit}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal memuat items.json", err);
  }
}

// ====== Load Transaksi JSON ======
async function loadTransaksi() {
  try {
    const res = await fetch("transaksi.json");
    const data = await res.json();

    const container = document.getElementById("daftarTransaksi");
    container.innerHTML = ""; // reset isi

    if (data.length === 0) {
      container.innerHTML = "<p>Belum ada transaksi.</p>";
      return;
    }

    // buat tabel
    const table = document.createElement("table");
    table.classList.add("transaksi-table");

    // header
    table.innerHTML = `
      <thead>
        <tr>
          <th>Kode Unit</th>
          <th>Tanggal Jual</th>
          <th>Harga Beli</th>
          <th>Harga Jual</th>
          <th>Laba Bersih</th>
          <th>Margin</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    // isi data
    data.forEach(trx => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trx.kode_unit}</td>
        <td>${trx.tanggal_jual || "-"}</td>
        <td>Rp ${trx.harga_beli_unit?.toLocaleString("id-ID") || "-"}</td>
        <td>Rp ${trx.harga_jual?.toLocaleString("id-ID") || "-"}</td>
        <td>Rp ${trx.laba_bersih?.toLocaleString("id-ID") || "-"}</td>
        <td>${trx.margin ? trx.margin + "%" : "-"}</td>
      `;
      tbody.appendChild(row);
    });

    container.appendChild(table);
  } catch (err) {
    console.error("Gagal memuat transaksi.json", err);
    document.getElementById("daftarTransaksi").innerHTML =
      "<p>Gagal memuat data transaksi.</p>";
  }
}

// Panggil saat halaman pertama kali dibuka
loadItems();
loadTransaksi();