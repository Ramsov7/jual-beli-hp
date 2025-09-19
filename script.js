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

// ====== Debug Message (ganti console.log) ======
function showDebugMessage(targetId, msg, isError = false) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const p = document.createElement("div");
  p.style.whiteSpace = "pre-wrap";
  p.style.fontFamily = "monospace";
  p.style.margin = "6px 0";
  p.style.padding = "4px";
  p.style.border = "1px dashed #ccc";
  p.style.background = isError ? "#ffe6e6" : "#f9f9f9";
  p.style.color = isError ? "#8b0000" : "#333";
  p.textContent = msg;
  el.appendChild(p);
}

// ====== Load Items ======
async function loadItems() {
  const container = document.getElementById("items-list");
  if (!container) return;
  container.innerHTML = "";

  if (!window.supabase) {
    showDebugMessage("items-list", "❌ Supabase client tidak ditemukan.", true);
    return;
  }

  showDebugMessage("items-list", "🔄 Memuat data dari tabel 'items'...");
  try {
    const { data, error } = await supabase.from("items").select("*").limit(50);

    if (error) {
      showDebugMessage("items-list", `❌ Error Supabase: ${error.message}`, true);
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("list-item");
      div.innerHTML = `<pre>${JSON.stringify(item, null, 2)}</pre>`;
      container.appendChild(div);
    });
  } catch (err) {
    showDebugMessage("items-list", `❌ Exception loadItems: ${err.message}`, true);
  }
}

// ====== Load Transaksi ======
async function loadTransaksi() {
  const container = document.getElementById("daftarTransaksi");
  if (!container) return;
  container.innerHTML = "";

  try {
    const { data, error } = await supabase.from("transaksi").select("*").limit(100);

    if (error) {
      showDebugMessage("daftarTransaksi", `❌ Error Supabase: ${error.message}`, true);
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada transaksi.</p>";
      return;
    }

    const table = document.createElement("table");
    table.classList.add("transaksi-table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Unit</th>
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
      const kodeUnit = trx.kode_unit || "-";
      const namaUnit = trx.tipe_varian || "-";
      const hargaBeli = trx.harga_beli_unit || 0;
      const hargaJual = trx.harga_jual_unit || 0;
      const margin = hargaBeli > 0 ? (((hargaJual - hargaBeli) / hargaBeli) * 100).toFixed(2) : "-";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${namaUnit} <br><small>${kodeUnit}</small></td>
        <td>Rp ${hargaBeli ? hargaBeli.toLocaleString("id-ID") : "-"}</td>
        <td>Rp ${hargaJual ? hargaJual.toLocaleString("id-ID") : "-"}</td>
        <td>${margin === "-" ? "-" : margin + "%"}</td>
        <td><button class="detail-btn">Detail</button></td>
      `;
      row.querySelector(".detail-btn").addEventListener("click", () => showPopup(trx));
      tbody.appendChild(row);
    });

    container.appendChild(table);
  } catch (err) {
    showDebugMessage("daftarTransaksi", `❌ Exception loadTransaksi: ${err.message}`, true);
  }
}

// ====== Popup ======
function showPopup(obj) {
  const overlay = document.createElement("div");
  overlay.classList.add("popup-overlay");
  const popup = document.createElement("div");
  popup.classList.add("popup");

  let details = "<h3>Detail</h3><ul>";
  for (const key in obj) {
    details += `<li><b>${key}</b>: ${obj[key]}</li>`;
  }
  details += `</ul><button id="closePopup">Tutup</button>`;

  popup.innerHTML = details;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById("closePopup").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
}

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  loadTransaksi();
});