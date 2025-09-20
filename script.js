// Supabase client
const SUPABASE_URL = "https://tvesoylwadcxtwtacnsn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZXNveWx3YWRjeHR3dGFjbnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDIyNjcsImV4cCI6MjA3Mzg3ODI2N30.j1ot_YnQ3PyeJl2EZbCmVnh33BXD4flkDhQ8uncL_u0";
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Panel pengaturan
const btnSettings = document.getElementById("btnSettings");
const panelSettings = document.getElementById("panelSettings");
btnSettings.addEventListener("click", () => {
  panelSettings.classList.toggle("active");
  panelSettings.setAttribute("aria-hidden", !panelSettings.classList.contains("active"));
});

// Navigasi antar section
const main = document.querySelector("main");
const sections = document.querySelectorAll("main section");
const bottomNavButtons = document.querySelectorAll(".bottom-nav button");

function showSection(targetId) {
  const index = Array.from(sections).findIndex(sec => sec.id === targetId);
  if (index === -1) return;
  main.style.transform = `translateX(-${index * 100}%)`;
  bottomNavButtons.forEach(b => b.classList.remove("active"));
  document.querySelector(`.bottom-nav button[data-target="${targetId}"]`)?.classList.add("active");
}

bottomNavButtons.forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.target)));

// App untuk data Supabase
const App = {
  state: { items: [] },
  refs: {},
  PLACEHOLDER_IMG: "https://via.placeholder.com/400x300?text=No+Image",

  init() {
    this.refs.itemsList = document.getElementById("itemsList");
    this.refs.searchInput = document.getElementById("searchInput");
    this.refs.filterKategori = document.getElementById("filterKategori");
    this.refs.filterStok = document.getElementById("filterStok");
    this.refs.filterJenis = document.getElementById("filterJenis");

    this.bindFilters();
    this.loadItems();
  },

  async loadItems() {
    const { data, error } = await window.supabase.from("items").select("*").limit(200);
    if (error) { 
      this.refs.itemsList.innerHTML = `<p>Error: ${error.message}</p>`; 
      return; 
    }
    this.state.items = data;
    this.renderItems(data);
    this.fillFilters(data);
  },

  renderItems(items) {
    this.refs.itemsList.innerHTML = "";
    items.forEach(item => this.refs.itemsList.appendChild(this.createCard(item)));
  },

  createCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    const foto = item.foto_url?.trim() || null;
    const nama = item.nama_item || "Tanpa Nama";
    const harga = item.biaya_item ? Number(item.biaya_item).toLocaleString("id-ID") : "-";
    const stok = item.stok_item ?? "-";
    const stokClass = Number(stok) > 0 ? "stock-tersedia" : "stock-habis";

    card.innerHTML = `
      ${foto ? `<img src="${foto}" alt="${this.escapeHtml(nama)}" onerror="this.src='${this.PLACEHOLDER_IMG}'">` : `<div class="placeholder">No Image</div>`}
      <div class="item-info">
        <h4>${this.escapeHtml(nama)}</h4>
        <div class="price">Rp ${harga}</div>
        <div><span class="stock-badge ${stokClass}">Stok: ${stok}</span></div>
      </div>
    `;
    return card;
  },

  fillFilters(items) {
    const kategoriSet = new Set(items.map(i => i.jenis_item).filter(Boolean));
    const jenisSet = new Set(items.map(i => i.kondisi_item).filter(Boolean));

    this.refs.filterKategori.innerHTML = '<option value="">Semua Kategori</option>';
    kategoriSet.forEach(k => this.refs.filterKategori.innerHTML += `<option value="${this.escapeHtml(k)}">${this.escapeHtml(k)}</option>`);

    this.refs.filterJenis.innerHTML = '<option value="">Semua Jenis</option>';
    jenisSet.forEach(j => this.refs.filterJenis.innerHTML += `<option value="${this.escapeHtml(j)}">${this.escapeHtml(j)}</option>`);
  },

  bindFilters() {
    this.refs.searchInput.addEventListener("input", () => this.applyFilters());
    this.refs.filterKategori.addEventListener("change", () => this.applyFilters());
    this.refs.filterStok.addEventListener("change", () => this.applyFilters());
    this.refs.filterJenis.addEventListener("change", () => this.applyFilters());
  },

  applyFilters() {
    const search = this.refs.searchInput.value.toLowerCase();
    const kategori = this.refs.filterKategori.value;
    const stok = this.refs.filterStok.value;
    const jenis = this.refs.filterJenis.value;

    const filtered = this.state.items.filter(i => {
      const matchSearch = !search || (i.nama_item && i.nama_item.toLowerCase().includes(search));
      const matchKategori = !kategori || i.jenis_item === kategori;
      const matchJenis = !jenis || i.kondisi_item === jenis;
      const matchStok = !stok ||
        (stok === "habis" && (!i.stok_item || Number(i.stok_item) === 0)) ||
        (stok === "tersedia" && Number(i.stok_item) > 0);

      return matchSearch && matchKategori && matchJenis && matchStok;
    });

    this.renderItems(filtered);
  },

  escapeHtml(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());