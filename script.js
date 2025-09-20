// ===============================
// Servisel - script.js (modular & maintainable)
// Menampilkan grid 2 kolom; overlay detail muncul saat hover (desktop) atau tap (mobile)
// ===============================

const App = {
  state: {
    allItems: []
  },

  elements: {
    navButtons: null,
    sections: null,
    containerItems: null,
    searchInput: null,
    filterKategori: null,
    filterStok: null,
    filterJenis: null
  },

  init() {
    // cache DOM elements (script.js diletakkan di bawah body sehingga elemen tersedia)
    this.elements.navButtons = document.querySelectorAll(".bottom-nav button");
    this.elements.sections = document.querySelectorAll("main section");
    this.elements.containerItems = document.getElementById("items-list");
    this.elements.searchInput = document.getElementById("searchInput");
    this.elements.filterKategori = document.getElementById("filterKategori");
    this.elements.filterStok = document.getElementById("filterStok");
    this.elements.filterJenis = document.getElementById("filterJenis");

    this.initNavigation();
    this.bindFilterEvents();
    this.loadItems();
    this.attachGlobalClicks();
  },

  initNavigation() {
    const { navButtons, sections } = this.elements;
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navButtons.forEach((b) => b.classList.remove("active"));
        sections.forEach((s) => s.classList.remove("active"));

        btn.classList.add("active");
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        if (target) target.classList.add("active");
      });
    });
  },

  attachGlobalClicks() {
    // Jika user klik di luar card aktif, tutup semua overlay aktif (berguna di mobile)
    document.addEventListener("click", (e) => {
      const isCard = e.target.closest(".item-card");
      if (!isCard) {
        document.querySelectorAll(".item-card.active").forEach((c) => c.classList.remove("active"));
      }
    });
  },

  async loadItems() {
    const container = this.elements.containerItems;
    if (!container) return;
    container.innerHTML = "";

    try {
      // gunakan global window.supabase (didefinisikan di index.html)
      const db = window.supabase;
      if (!db) {
        container.innerHTML = `<p class="debug">❌ Supabase client belum siap.</p>`;
        return;
      }

      const { data, error } = await db.from("items").select("*").limit(200);

      if (error) {
        container.innerHTML = `<p class="debug">❌ Error Supabase: ${error.message}</p>`;
        return;
      }

      if (!data || data.length === 0) {
        container.innerHTML = "<p>Belum ada item di database.</p>";
        return;
      }

      this.state.allItems = data;
      this.renderItems(data);
      this.fillFilterOptions(data);
    } catch (err) {
      container.innerHTML = `<p class="debug">❌ Exception: ${err.message}</p>`;
    }
  },

  renderItems(items) {
    const container = this.elements.containerItems;
    container.innerHTML = "";

    // jika kamu ingin, bisa bungkus grid, tapi #items-list sendiri sudah grid di CSS
    items.forEach((item) => {
      const card = this.createItemCard(item);
      container.appendChild(card);
    });
  },

  createItemCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    card.setAttribute("tabindex", "0"); // agar bisa fokus keyboard

    const foto = item.foto_url || item.image || "https://via.placeholder.com/400x300?text=No+Image";
    const nama = item.nama_item || "Tanpa Nama";
    const harga = item.biaya_item ? Number(item.biaya_item).toLocaleString("id-ID") : "-";
    const stokVal = (item.stok_item == null) ? "-" : item.stok_item;
    const stokBadgeClass = item.stok_item && Number(item.stok_item) > 0 ? "stock-tersedia" : "stock-habis";

    card.innerHTML = `
      <img src="${foto}" alt="${nama}">
      <div class="item-info">
        <h4 title="${nama}">${nama}</h4>
        <div class="price">Rp ${harga}</div>
        <div class="stock"><span class="stock-badge ${stokBadgeClass}">Stok: ${stokVal}</span></div>
      </div>

      <div class="item-detail" aria-hidden="true">
        <div><strong>${nama}</strong></div>
        <div>Harga: Rp ${harga}</div>
        <div>Kategori: ${item.jenis_item || "-"}</div>
        <div>Kondisi: ${item.kondisi_item || "-"}</div>
        <div style="font-size:12px;opacity:.9;margin-top:6px;">Sentuh lagi untuk menutup</div>
      </div>
    `;

    // toggle detail pada klik (mobile) — juga menutup card aktif lainnya
    card.addEventListener("click", (ev) => {
      ev.stopPropagation(); // jangan trigger document click handler
      // tutup card lain
      document.querySelectorAll(".item-card.active").forEach((c) => {
        if (c !== card) c.classList.remove("active");
      });
      card.classList.toggle("active");
    });

    // keyboard support: Enter untuk toggle, Esc untuk close
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        card.classList.toggle("active");
      } else if (ev.key === "Escape") {
        card.classList.remove("active");
      }
    });

    return card;
  },

  fillFilterOptions(items) {
    const kategoriSelect = this.elements.filterKategori;
    const jenisSelect = this.elements.filterJenis;
    if (!kategoriSelect || !jenisSelect) return;

    const kategoriSet = new Set(items.map(i => i.jenis_item).filter(Boolean));
    const jenisSet = new Set(items.map(i => i.kondisi_item).filter(Boolean));

    kategoriSelect.innerHTML = '<option value="">Semua Kategori</option>';
    jenisSelect.innerHTML = '<option value="">Semua Jenis</option>';

    kategoriSet.forEach(k => {
      kategoriSelect.innerHTML += `<option value="${k}">${k}</option>`;
    });
    jenisSet.forEach(j => {
      jenisSelect.innerHTML += `<option value="${j}">${j}</option>`;
    });
  },

  bindFilterEvents() {
    const s = this.elements;
    if (!s.searchInput) return;
    s.searchInput.addEventListener("input", () => this.applyFilters());
    s.filterKategori.addEventListener("change", () => this.applyFilters());
    s.filterStok.addEventListener("change", () => this.applyFilters());
    s.filterJenis.addEventListener("change", () => this.applyFilters());
  },

  applyFilters() {
    const s = this.elements;
    const search = (s.searchInput.value || "").trim().toLowerCase();
    const kategori = s.filterKategori.value;
    const stok = s.filterStok.value;
    const jenis = s.filterJenis.value;

    const filtered = this.state.allItems.filter(i => {
      const matchSearch = !search || (i.nama_item && i.nama_item.toLowerCase().includes(search));
      const matchKategori = !kategori || i.jenis_item === kategori;
      const matchJenis = !jenis || i.kondisi_item === jenis;
      const matchStok =
        !stok ||
        (stok === "habis" && (!i.stok_item || Number(i.stok_item) === 0)) ||
        (stok === "tersedia" && Number(i.stok_item) > 0);

      return matchSearch && matchKategori && matchJenis && matchStok;
    });

    this.renderItems(filtered);
  }
};

// Init saat DOM siap
document.addEventListener("DOMContentLoaded", () => App.init());