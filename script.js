// ====== script.js (debug-friendly, langsung copy-paste) ======

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

// ====== Utility: tampilkan info debug singkat ======
function showDebugMessage(targetId, msg, isError = false) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const p = document.createElement("div");
  p.style.whiteSpace = "pre-wrap";
  p.style.fontFamily = "monospace";
  p.style.margin = "6px 0";
  p.style.color = isError ? "#8b0000" : "#333";
  p.textContent = msg;
  el.appendChild(p);
}

// ====== Load Items dari Supabase (dengan debug) ======
async function loadItems() {
  const container = document.getElementById("items-list");
  if (!container) return;

  // cek apakah supabase client ada
  if (typeof supabase === "undefined" || !supabase) {
    const msg = "Supabase client tidak ditemukan. Pastikan file CDN supabase dan createClient dijalankan SEBELUM script.js.";
    console.error(msg);
    container.innerHTML = `<p style="color:#8b0000">${msg}</p>`;
    return;
  }

  container.innerHTML = ""; // reset container
  showDebugMessage("items-list", "Mencoba memuat data dari tabel 'items'...");

  try {
    // request normal lewat client supabase
    const { data, error } = await supabase.from("items").select("*").limit(50);

    console.log("Supabase response (items):", { data, error });
    if (error) {
      // tampilkan error detail di UI agar jelas
      const errMsg = `Gagal memuat data items: ${error.message || JSON.stringify(error)}`;
      console.error(errMsg, error);
      container.innerHTML = `<p style="color:#8b0000">${errMsg}</p>`;
      // tampilkan object error lengkap untuk debugging
      showDebugMessage("items-list", JSON.stringify(error, null, 2), true);

      // jika window.SUPABASE_ANON_KEY tersedia, coba fallback REST (debug)
      if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        showDebugMessage("items-list", "Mencoba fallback ke REST API (debug)...");
        try {
          const restUrl = `${window.SUPABASE_URL}/rest/v1/items?select=*&limit=3`;
          const restRes = await fetch(restUrl, {
            headers: {
              apikey: window.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
              Accept: "application/json",
            },
          });
          const restText = await restRes.text();
          console.log("REST fallback status:", restRes.status, restText);
          showDebugMessage("items-list", `REST fallback status: ${restRes.status}\n${restText}`, restRes.status >= 400);
        } catch (e) {
          console.error("REST fallback error:", e);
          showDebugMessage("items-list", `REST fallback error: ${e.message}`, true);
        }
      }

      return;
    }

    // sukses: tampilkan data (sementara tampilkan JSON mentah per item)
    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("list-item");
      // tampil JSON rapi agar kita tahu nama kolom persisnya
      div.innerHTML = `<pre>${JSON.stringify(item, null, 2)}</pre>`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Exception ketika memuat items:", err);
    container.innerHTML = `<p style="color:#8b0000">Gagal memuat data items: ${err.message || err}</p>`;
    showDebugMessage("items-list", JSON.stringify(err, null, 2), true);
  }
}

// ====== Load Transaksi dari Supabase ======
async function loadTransaksi() {
  const container = document.getElementById("daftarTransaksi");
  if (!container) return;
  container.innerHTML = "";

  try {
    // Ambil transaksi (limit untuk cepat)
    const { data, error } = await supabase.from("transaksi").select("*").limit(100);
    console.log("Supabase response (transaksi):", { data, error });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada transaksi.</p>";
      return;
    }

    const table = document.createElement("table");
    table.classList.add("transaksi-table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nama Unit / Kode Unit (raw)</th>
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
      // coba ambil fields yang umum, fallback ke raw object jika tidak ada
      const kodeUnit = trx.kode_unit || trx.kodeUnit || trx.unit || "-";
      const namaUnit = trx.tipe_varian || trx.tipe || "-";
      const hargaBeli = trx.harga_beli_unit || trx.harga_beli || 0;
      const hargaJual = trx.harga_jual_unit || trx.harga_jual || 0;
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
    console.error("Gagal memuat transaksi:", err);
    container.innerHTML = `<p style="color:#8b0000">Gagal memuat data transaksi: ${err.message || err}</p>`;
    showDebugMessage("daftarTransaksi", JSON.stringify(err, null, 2), true);
  }
}

// ====== Popup Detail ======
function showPopup(obj) {
  const overlay = document.createElement("div");
  overlay.classList.add("popup-overlay");

  const popup = document.createElement("div");
  popup.classList.add("popup");

  let details = "<h3>Detail</h3><ul>";
  try {
    // tampilkan key/value secara aman, JSON.stringify untuk objek nested
    for (const key in obj) {
      const val = obj[key];
      details += `<li><b>${key}</b>: ${typeof val === "object" ? JSON.stringify(val) : val}</li>`;
    }
  } catch (e) {
    details += `<li>Error saat menampilkan detail: ${e.message}</li>`;
  }
  details += `</ul><button id="closePopup">Tutup</button>`;

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