const App = {
  state: { items: [] },

  refs: {
    navBtns: null,
    sections: null,
    itemsList: null,
    searchInput: null,
    filterKategori: null,
    filterStok: null,
    filterJenis: null,
    btnSettings: null,
    panelSettings: null,
  },

  init() {
    this.refs.navBtns = document.querySelectorAll(".bottom-nav button");
    this.refs.sections = document.querySelectorAll("main section");
    this.refs.itemsList = document.getElementById("itemsList");
    this.refs.searchInput = document.getElementById("searchInput");
    this.refs.filterKategori = document.getElementById("filterKategori");
    this.refs.filterStok = document.getElementById("filterStok");
    this.refs.filterJenis = document.getElementById("filterJenis");
    this.refs.btnSettings = document.getElementById("btnSettings");
    this.refs.panelSettings = document.getElementById("panelSettings");

    this.initNavigation();
    this.bindFilters();
    this.bindSettings();
    this.loadItems();
    this.closeCardOnOutsideClick();
  },

  initNavigation() {
    const { navBtns, sections } = this.refs;
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        navBtns.forEach((b) => b.classList.remove("active"));
        sections.forEach((s) => s.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.target)?.classList.add("active");
      });
    });
  },

  bindSettings() {
    const { btnSettings, panelSettings } = this.refs;
    btnSettings.addEventListener("click", (e) => {
      e.stopPropagation();
      panelSettings.classList.toggle("active");
    });
    document.addEventListener("click", () => panelSettings.classList.remove("active"));
    panelSettings.addEventListener("click", (e) => e.stopPropagation());
  },

  async loadItems() {
    const container = this.refs.itemsList;
    if (!container) return;
    container.innerHTML = "";

    try {
      const { data, error } = await window.supabase.from("items").select("*").limit(200);
      if (error) {
        container.innerHTML = `<p>Error: ${error.message}</p>`;
        return;
      }
      if (!data || data.length === 0) {
        container.innerHTML = "<p>Belum ada item.</p>";
        return;
      }
      this.state.items = data;
      this.renderItems(data);
      this.fillFilters(data);
    } catch (err) {
      container.innerHTML = `<p>Exception: ${err.message}</p>`;
    }
  },

  renderItems(items) {
    const container = this.refs.itemsList;
    container.innerHTML = "";
    items.forEach((item) => container.appendChild(this.createCard(item)));
  },

  createCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    card.tabIndex = 0;

    const foto = item.foto_url || "https://via.placeholder.com/400x300?text=No+Image";
    const nama = item.nama_item || "Tanpa Nama";
    const harga = item.biaya_item ? Number(item.biaya_item).toLocaleString("id-ID") : "-";
    const stok = item.stok_item ?? "-";
    const stokClass = item.stok_item > 0 ? "stock-tersedia" : "stock-habis";

    card.innerHTML = `
      <img src="${foto}" alt="${nama}">
      <div class="item-info">
        <h4>${nama}</h4>
        <div class="price">Rp ${harga}</div>
        <div class="stock"><span class="stock-badge ${stokClass}">Stok: ${stok}</span></div>
      </div>
      <div class="item-detail">
        <div><strong>${nama}</strong></div>
        <div>Harga: Rp ${harga}</div>
        <div>Kategori: ${item.jenis_item || "-"}</div>
        <div>Kondisi: ${item.kondisi_item || "-"}</div>
      </div>
    `;

    card.addEventListener("click", (ev) => {
      ev.stopPropagation();
      document.querySelectorAll(".item-card.active").forEach((c) => c.classList.remove("active"));
      card.classList.toggle("active");
    });
    return card;
  },

  fillFilters(items) {
    const { filterKategori, filterJenis } = this.refs;
    const kategoriSet = new Set(items.map(i => i.jenis_item).filter(Boolean));
    const jenisSet = new Set(items.map(i => i.kondisi_item).filter(Boolean));

    filterKategori.innerHTML = '<option value="">Semua Kategori</option>';
    filterJenis.innerHTML = '<option value="">Semua Jenis</option>';
    kategoriSet.forEach(k => filterKategori.innerHTML += `<option>${k}</option>`);
    jenisSet.forEach(j => filterJenis.innerHTML += `<option>${j}</option>`);
  },

  bindFilters() {
    const r = this.refs;
    r.searchInput.addEventListener("input", () => this.applyFilters());
    r.filterKategori.addEventListener("change", () => this.applyFilters());
    r.filterStok.addEventListener("change", () => this.applyFilters());
    r.filterJenis.addEventListener("change", () => this.applyFilters());
  },

  applyFilters() {
    const r = this.refs;
    const search = r.searchInput.value.toLowerCase();
    const kategori = r.filterKategori.value;
    const stok = r.filterStok.value;
    const jenis = r.filterJenis.value;

    const filtered = this.state.items.filter(i => {
      const matchSearch = !search || i.nama_item?.toLowerCase().includes(search);
      const matchKategori = !kategori || i.jenis_item === kategori;
      const matchJenis = !jenis || i.kondisi_item === jenis;
      const matchStok = !stok ||
        (stok === "habis" && (!i.stok_item || i.stok_item == 0)) ||
        (stok === "tersedia" && i.stok_item > 0);
      return matchSearch && matchKategori && matchJenis && matchStok;
    });
    this.renderItems(filtered);
  },

  closeCardOnOutsideClick() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".item-card")) {
        document.querySelectorAll(".item-card.active").forEach((c) => c.classList.remove("active"));
      }
    });
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());