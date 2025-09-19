// ====== Navigasi Bottom ======
const navButtons = document.querySelectorAll(".bottom-nav button");
const sections = document.querySelectorAll("main section");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// ====== Load Items dari Supabase ======
async function loadItems() {
  try {
    const { data, error } = await supabase.from("items").select("*");
    if (error) throw error;

    const container = document.getElementById("items-list");
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("list-item");
      div.innerHTML = `
        <span>${item.tipe_varian || "-"}</span>
        <span>Kode: ${item.kode_item || "-"}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal memuat data items:", err);
    document.getElementById("items-list").innerHTML =
      "<p>Gagal memuat data items.</p>";
  }
}

// ====== Load Transaksi dari Supabase ======
async function loadTransaksi() {
  try {
    const { data, error } = await supabase.from("transaksi").select("*");
    if (error) throw error;

    const container = document.getElementById("daftarTransaksi");
    container.innerHTML = "";

    if (!data || data.length === 0) {
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

    data.forEach((trx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trx.tipe_varian || "-"}</td>
        <td>Rp ${trx.harga_beli_unit?.toLocaleString("id-ID") || "-"}</td>
        <td>Rp ${trx.harga_jual?.toLocaleString("id-ID") || "-"}</td>
        <td>${trx.margin ? trx.margin + "%" : "-"}</td>
        <td><button class="detail-btn">Detail</button></td>
      `;

      row.querySelector(".detail-btn").addEventListener("click", () => {
        showPopup(trx);
      });

      tbody.appendChild(row);
    });

    container.appendChild(table);
  } catch (err) {
    console.error("Gagal memuat transaksi:", err);
    document.getElementById("daftarTransaksi").innerHTML =
      "<p>Gagal memuat data transaksi.</p>";
  }
}

// ====== Popup Detail ======
function showPopup(trx) {
  const overlay = document.createElement("div");
  overlay.classList.add("popup-overlay");

  const popup = document.createElement("div");
  popup.classList.add("popup");

  let details = "<h3>Detail Transaksi</h3><ul>";
  for (const key in trx) {
    details += `<li><b>${key}</b>: ${trx[key]}</li>`;
  }
  details += "</ul><button id='closePopup'>Tutup</button>";

  popup.innerHTML = details;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById("closePopup").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
}

// ====== Inisialisasi Saat Load ======
document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  loadTransaksi();
});

async function loadItems() {
  try {
    const { data, error } = await supabase.from("items").select("*");
    if (error) throw error;

    console.log("Data items:", data); // debug ke console

    const container = document.getElementById("items-list");
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("list-item");
      div.innerHTML = `
        <pre>${JSON.stringify(item, null, 2)}</pre>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal memuat data items:", err.message);
    document.getElementById("items-list").innerHTML =
      "<p>Gagal memuat data items.</p>";
  }
}