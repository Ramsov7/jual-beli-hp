// ===============================
// Servisel App - script.js
// ===============================

// ==== GLOBAL STATE ====
let allItems = [];

// ==== DOM SELECTORS ====
const navButtons = document.querySelectorAll(".bottom-nav button");
const sections = document.querySelectorAll("main section");

const containerItems = document.getElementById("items-list");
const searchInput = document.getElementById("searchInput");
const filterKategori = document.getElementById("filterKategori");
const filterStok = document.getElementById("filterStok");
const filterJenis = document.getElementById("filterJenis");

// ==== UTILITIES ====
function showDebugMessage(targetId, msg, isError = false) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const p = document.createElement("div");
  p.className = "debug";
  p.style.color = isError ? "red" : "#333";
  p.textContent = msg;
  el.appendChild(p);
}

// ==== NAVIGATION HANDLER ====
function initNavigation() {
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });
}

// ==== SUPABASE HANDLER ====
async function loadItems() {
  if (!containerItems) return;

  containerItems.innerHTML = "";

  try {
    const { data, error } = await supabase.from("items").select("*").limit(50);

    if (error) {
      showDebugMessage("items-list", `❌ Error Supabase: ${error.message}`, true);
      return;
    }

    if (!data || data.length === 0) {
      containerItems.innerHTML = "<p>Belum ada item di database.</p>";
      return;
    }

    allItems = data;
    renderItems(allItems);
    fillFilterOptions(allItems);
  } catch (err) {
    showDebugMessage("items-list", `❌ Exception loadItems: ${err.message}`, true);
  }
}

// ==== RENDER HANDLER ====
function renderItems(items) {
  containerItems.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "items-grid";

  items.forEach((item) => {
    grid.appendChild(createItemCard(item));
  });

  containerItems.appendChild(grid);
}

function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.innerHTML = `
    <h4>${item.nama_item || "Tanpa Nama"}</h4>
    <p>Kategori: ${item.jenis_item || "-"}</p>
    <p>Kondisi: ${item.kondisi_item || "-"}</p>
    <p>Stok: ${item.stok_item ?? "-"}</p>
    <p>Harga: ${item.biaya_item ? "Rp " + Number(item.biaya_item).toLocaleString() : "-"}</p>
  `;
  return card;
}

// ==== FILTER HANDLER ====
function fillFilterOptions(items) {
  const kategoriSet = new Set(items.map((i) => i.jenis_item).filter(Boolean));
  const jenisSet = new Set(items.map((i) => i.kondisi_item).filter(Boolean));

  // Reset options
  filterKategori.innerHTML = '<option value="">Semua Kategori</option>';
  filterJenis.innerHTML = '<option value="">Semua Kondisi</option>';

  kategoriSet.forEach((k) => {
    filterKategori.innerHTML += `<option value="${k}">${k}</option>`;
  });
  jenisSet.forEach((j) => {
    filterJenis.innerHTML += `<option value="${j}">${j}</option>`;
  });
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const kategori = filterKategori.value;
  const stok = filterStok.value;
  const jenis = filterJenis.value;

  const filtered = allItems.filter((i) => {
    const matchSearch = !search || (i.nama_item && i.nama_item.toLowerCase().includes(search));
    const matchKategori = !kategori || i.jenis_item === kategori;
    const matchJenis = !jenis || i.kondisi_item === jenis;
    const matchStok =
      !stok ||
      (stok === "habis" && (!i.stok_item || i.stok_item == 0)) ||
      (stok === "tersedia" && i.stok_item > 0);

    return matchSearch && matchKategori && matchJenis && matchStok;
  });

  renderItems(filtered);
}

// ==== EVENT BINDING ====
function initFilters() {
  searchInput.addEventListener("input", applyFilters);
  filterKategori.addEventListener("change", applyFilters);
  filterStok.addEventListener("change", applyFilters);
  filterJenis.addEventListener("change", applyFilters);
}

// ==== INIT APP ====
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initFilters();
  loadItems();
});
