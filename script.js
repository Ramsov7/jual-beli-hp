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

    // sementara tampilkan di console
    console.log("Data Transaksi:", data);

    // tampilkan jumlah transaksi di halaman
    document.getElementById("daftarTransaksi").innerHTML =
      `<p>Total Transaksi: ${data.length}</p>`;
  } catch (err) {
    console.error("Gagal memuat transaksi.json", err);
    document.getElementById("daftarTransaksi").innerHTML =
      "<p>Gagal memuat data transaksi.</p>";
  }
}

// Panggil saat halaman pertama kali dibuka
loadItems();
loadTransaksi();