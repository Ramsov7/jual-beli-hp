const App = {
  state: { items: [] },

  refs: {},

  PLACEHOLDER_IMG: "https://via.placeholder.com/400x300?text=No+Image",

  init() {
    // cache refs
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
    const { navBtns } = this.refs;
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        navBtns.forEach((b) => b.classList.remove("active"));
        this.refs.sections.forEach((s) => s.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.dataset.target;
        document.getElementById(targetId)?.classList.add("active");
      });
    });
  },

  bindSettings() {
    const { btnSettings, panelSettings } = this.refs;
    if (!btnSettings || !panelSettings) return;
    btnSettings.addEventListener("click", (e) => {
      e.stopPropagation();
      panelSettings.classList.toggle("active");
      panelSettings.setAttribute("aria-hidden", panelSettings.classList.contains("active") ? "false" : "true");
    });
    // close when clicking outside
    document.addEventListener("click", () => {
      panelSettings.classList.remove("active");
      panelSettings.setAttribute("aria-hidden", "true");
    });
    panelSettings.addEventListener("click", (e) => e.stopPropagation());
  },

  async loadItems() {
    const container = this.refs.itemsList;
    if (!container) return;
    container.innerHTML = "";

    try {
      const { data, error } = await window.supabase.from("items").select("*").limit(200);
      if (error) {
        container.innerHTML = `<p class="debug">Error: ${error.message}</p>`;
        return;
      }
      if (!data || data.length === 0) {
        container.innerHTML = "<p class='debug'>Belum ada item.</p>";
        return;
      }
      this.state.items = data;
      this.renderItems(data);
      this.fillFilters(data);
    } catch (err) {
      container.innerHTML = `<p class="debug">Exception: ${err.message}</p>`;
    }
  },

  renderItems(items) {
    const container = this.refs.itemsList;
    container.innerHTML = "";
    items.forEach(item => container.appendChild(this.createCard(item)));
  },

  createCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    card.tabIndex = 0;

    const foto = item.foto_url && item.foto_url.trim() ? item.foto_url.trim() : null;
    const nama = item.nama_item || "Tanpa Nama";
    const harga = item.biaya_item ? Number(item.biaya_item).toLocaleString("id-ID") : "-";
    const stok = (item.stok_item == null) ? "-" : item.stok_item;
    const stokClass = (Number(item.stok_item) > 0) ? "stock-tersedia" : "stock-habis";

    // build innerHTML but ensure broken images fallback to placeholder
    card.innerHTML = `
      ${foto
        ? `<img src="${foto}" alt="${this.escapeHtml(nama)}" onerror="this.onerror=null;this.src='${this.PLACEHOLDER_IMG}';">`
        : `<div class="placeholder">No Image</div>`}
      <div class="item-info">
        <h4>${this.escapeHtml(nama)}</h4>
        <div class="price">Rp ${harga}</div>
        <div class="stock"><span class="stock-badge ${stokClass}">Stok: ${stok}</span></div>
      </div>
      <div class="item-detail" aria-hidden="true">
        <div><strong>${this.escapeHtml(nama)}</strong></div>
        <div>Harga: Rp ${harga}</div>
        <div>Kategori: ${this.escapeHtml(item.jenis_item || "-")}</div>
        <div>Kondisi: ${this.escapeHtml(item.kondisi_item || "-")}</div>
        <div style="font-size:12px;opacity:.9;margin-top:6px;">Sentuh lagi untuk menutup</div>
      </div>
    `;

    // toggle detail on click (mobile) and close other active cards
    card.addEventListener("click", (ev) => {
      ev.stopPropagation();
      document.querySelectorAll(".item-card.active").forEach(c => {
        if (c !== card) c.classList.remove("active");
      });
      card.classList.toggle("active");
    });

    // keyboard support
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") card.classList.toggle("active");
      if (ev.key === "Escape") card.classList.remove("active");
    });

    return card;
  },

  fillFilters(items) {
    const { filterKategori, filterJenis } = this.refs;
    if (!filterKategori || !filterJenis) return;

    const kategoriSet = new Set(items.map(i => i.jenis_item).filter(Boolean));
    const jenisSet = new Set(items.map(i => i.kondisi_item).filter(Boolean));

    filterKategori.innerHTML = '<option value="">Semua Kategori</option>';
    filterJenis.innerHTML = '<option value="">Semua Jenis</option>';

    kategoriSet.forEach(k => filterKategori.innerHTML += `<option value="${this.escapeHtml(k)}">${this.escapeHtml(k)}</option>`);
    jenisSet.forEach(j => filterJenis.innerHTML += `<option value="${this.escapeHtml(j)}">${this.escapeHtml(j)}</option>`);
  },

  bindFilters() {
    const r = this.refs;
    if (r.searchInput) r.searchInput.addEventListener("input", () => this.applyFilters());
    if (r.filterKategori) r.filterKategori.addEventListener("change", () => this.applyFilters());
    if (r.filterStok) r.filterStok.addEventListener("change", () => this.applyFilters());
    if (r.filterJenis) r.filterJenis.addEventListener("change", () => this.applyFilters());
  },

  applyFilters() {
    const r = this.refs;
    const search = (r.searchInput?.value || "").trim().toLowerCase();
    const kategori = r.filterKategori?.value || "";
    const stok = r.filterStok?.value || "";
    const jenis = r.filterJenis?.value || "";

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

  closeCardOnOutsideClick() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".item-card")) {
        document.querySelectorAll(".item-card.active").forEach(c => c.classList.remove("active"));
      }
    });
  },

  // small helper to avoid injecting raw HTML from DB
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