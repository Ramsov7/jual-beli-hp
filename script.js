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

// ====== Debug ke UI ======
function showDebugMessage(targetId, msg, isError = false) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const p = document.createElement("div");
  p.className = "debug";
  p.style.color = isError ? "red" : "#333";
  p.textContent = msg;
  el.appendChild(p);
}

// ====== Global state ======
let allItems = [];

// ====== Load Items ======
async function loadItems() {
  const container = document.getElementById("items-list");
  if (!container) return;
  container.innerHTML = "";

  try {
    const { data, error } = await supabase.from("items").select("*").limit(50);

    if (error) {
      showDebugMessage("items-list", "❌ Error Supabase: " + error.message, true);
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    allItems = data;
    renderItems(allItems);
    fillFilterOptions(allItems);
  } catch (err) {
    showDebugMessage("items-list", "❌ Exception loadItems: " + err.message, true);
  }
}

// ====== Render Items as Cards ======
function renderItems(items) {
  const container = document.getElementById("items-list");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "items-grid";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h4>${item.nama || "Tanpa Nama"}</h4>
      <p>Kategori: ${item.kategori || "-"}</p>
      <p>Jenis: ${item.jenis || "-"}</p>
      <p>Stok: ${item.stok ?? "-"}</p>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// ====== Filter Options ======
function fillFilterOptions(items) {
  const kategoriSelect = document.getElementById("filterKategori");
  const jenisSelect = document.getElementById("filterJenis");

  const kategoriSet = new Set(items.map((i) => i.kategori).filter(Boolean));
  const jenisSet = new Set(items.map((i) => i.jenis).filter(Boolean));

  kategoriSelect.innerHTML = '<option value="">Semua Kategori</option>';
  jenisSelect.innerHTML = '<option value="">Semua Jenis</option>';

  kategoriSet.forEach((k) => {
    kategoriSelect.innerHTML += `<option value="${k}">${k}</option>`;
  });
  jenisSet.forEach((j) => {
    jenisSelect.innerHTML += `<option value="${j}">${j}</option>`;
  });
}

// ====== Apply Filters ======
function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const kategori = document.getElementById("filterKategori").value;
  const stok = document.getElementById("filterStok").value;
  const jenis = document.getElementById("filterJenis").value;

  let filtered = allItems.filter((i) => {
    const matchSearch =
      !search || (i.nama && i.nama.toLowerCase().includes(search));
    const matchKategori = !kategori || i.kategori === kategori;
    const matchJenis = !jenis || i.jenis === jenis;
    const matchStok =
      !stok ||
      (stok === "habis" && (!i.stok || i.stok == 0)) ||
      (stok === "tersedia" && i.stok > 0);

    return matchSearch && matchKategori && matchJenis && matchStok;
  });

  renderItems(filtered);
}

// ====== Event Listeners ======
document
  .getElementById("searchInput")
  .addEventListener("input", applyFilters);
document
  .getElementById("filterKategori")
  .addEventListener("change", applyFilters);
document
  .getElementById("filterStok")
  .addEventListener("change", applyFilters);
document
  .getElementById("filterJenis")
  .addEventListener("change", applyFilters);

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  loadItems();
});