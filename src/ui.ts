// Reveal on scroll and the copy-mail button.
/* reveals: transform only, text readable before they run */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rv").forEach(el => io.observe(el));

/* copy mail */
document.getElementById("copy")!.addEventListener("click", e => {
  const b = e.currentTarget as HTMLButtonElement, txt = document.getElementById("mail")!.textContent;
  const done = m => { b.textContent = m; setTimeout(() => { b.textContent = "Adresse kopieren"; }, 1600); };
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => done("Kopiert"), () => { selectMail(); done("Markiert, Strg+C"); });
  else { selectMail(); done("Markiert, Strg+C"); }
});
function selectMail() { const r = document.createRange(); r.selectNodeContents(document.getElementById("mail")!); const s = getSelection()!; s.removeAllRanges(); s.addRange(r); }
