const navButtons = document.querySelectorAll(".bottom-nav button");
const sections = document.querySelectorAll("main section");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Hapus aktif sebelumnya
    navButtons.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    // Aktifkan yang dipilih
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});