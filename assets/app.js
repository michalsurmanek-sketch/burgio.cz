/* =========================
   Data (demo katalog)
   ========================= */
const CATEGORIES = [
  {id:"nova", name:"Novinky", icon:"✨"},
  {id:"pro",  name:"Pro výbava", icon:"⚙️"},
  {id:"eco",  name:"Eco", icon:"🌿"},
  {id:"home", name:"Domov", icon:"🏠"},
];

const PRODUCTS = [
  {id:"ao-pro-1", name:"AO Pro One",  cat:"pro",  price:2990, compare:3490, rating:4.8, tags:["Pro","Rychlé","Prémiové"], blurb:"Vlajkový produkt s pocitem Apple."},
  {id:"ao-max-2", name:"AO Max Air",  cat:"pro",  price:3890, compare:4390, rating:4.7, tags:["Max","Lehké","Tiché"],     blurb:"Max výkon, minimální hluk."},
  {id:"ao-eco-3", name:"AO Eco Set",  cat:"eco",  price: 990, compare:1290, rating:4.6, tags:["Eco","Úsporné","Chytré"],  blurb:"Chytré řešení pro každý den."},
  {id:"ao-home-4",name:"AO Home Mini",cat:"home", price:1490, compare:1690, rating:4.5, tags:["Home","Kompaktní"],        blurb:"Mini, ale se špičkovým dojmem."},
  {id:"ao-new-5", name:"AO Nova Glow",cat:"nova", price:1990, compare:2390, rating:4.9, tags:["Novinka","Top"],          blurb:"Nový standard. Elegantní a rychlé."},
  {id:"ao-eco-6", name:"AO Eco Max",  cat:"eco",  price:1790, compare:2090, rating:4.4, tags:["Eco","Max"],              blurb:"Více za méně. Skvělé recenze."},
  {id:"ao-home-7",name:"AO Home Pro", cat:"home", price:2590, compare:2990, rating:4.7, tags:["Home","Pro"],             blurb:"Prémiový domovský kousek."},
  {id:"ao-new-8", name:"AO Nova Pro", cat:"nova", price:3490, compare:3990, rating:4.8, tags:["Novinka","Pro"],          blurb:"Prémiová novinka pro náročné."},
];

/* =========================
   Helpers
   ========================= */
const $  = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

function escapeHtml(s){
  return (s||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function money(czk){ return czk.toLocaleString("cs-CZ") + " Kč"; }

function qs(){ return new URLSearchParams(location.search); }

function toast(msg, tone="ok"){
  const t = $("#toast");
  if(!t) return;
  const el = document.createElement("div");
  el.className = "toast__item";
  const icon = tone==="ok" ? "✅" : tone==="warn" ? "⚠️" : "❌";
  el.innerHTML = `<div style="font-size:18px">${icon}</div><div><div style="font-weight:850">${msg}</div><div class="small">AO Shop • demo</div></div>`;
  t.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transform="translateY(6px)"; }, 2200);
  setTimeout(()=>{ el.remove(); }, 2550);
}

/* =========================
   Store (localStorage)
   ========================= */
const store = {
  getCart(){ try{ return JSON.parse(localStorage.getItem("ao_cart")||"[]"); }catch(e){ return []; } },
  setCart(items){ localStorage.setItem("ao_cart", JSON.stringify(items)); },
  getUser(){ try{ return JSON.parse(localStorage.getItem("ao_user")||"null"); }catch(e){ return null; } },
  setUser(u){ localStorage.setItem("ao_user", JSON.stringify(u)); },
  getOrders(){ try{ return JSON.parse(localStorage.getItem("ao_orders")||"[]"); }catch(e){ return []; } },
  setOrders(o){ localStorage.setItem("ao_orders", JSON.stringify(o)); },
};

function cartCount(){
  const cart = store.getCart();
  return cart.reduce((a,i)=>a+i.qty,0);
}
function updateCartBadge(){
  const el = $("#cartCount");
  if(el) el.textContent = cartCount();
}

function addToCart(id, qty=1){
  const cart = store.getCart();
  const found = cart.find(i=>i.id===id);
  if(found) found.qty += qty; else cart.push({id, qty});
  store.setCart(cart);
  updateCartBadge();
  toast("Přidáno do košíku");
}

function removeFromCart(id){
  store.setCart(store.getCart().filter(i=>i.id!==id));
  updateCartBadge();
  toast("Odebráno z košíku", "warn");
}

function setQty(id, qty){
  const cart = store.getCart();
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty = Math.max(1, qty);
  store.setCart(cart);
  updateCartBadge();
}

function cartTotals(){
  const cart = store.getCart();
  let subtotal = 0;
  for(const it of cart){
    const p = PRODUCTS.find(x=>x.id===it.id);
    if(p) subtotal += p.price * it.qty;
  }
  const shipping = subtotal>=2500 ? 0 : (cart.length?89:0);
  const total = subtotal + shipping;
  return {subtotal, shipping, total};
}

/* =========================
   Modal (quick view)
   ========================= */
function closeModal(){
  const m = $("#modal");
  if(m) m.removeAttribute("open");
}
function openQuickView(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const cat = CATEGORIES.find(c=>c.id===p.cat);

  $("#mTitle").textContent = p.name;
  $("#mSub").textContent = `${cat?cat.icon:"🧩"} ${cat?cat.name:"Kategorie"} • ⭐ ${p.rating.toFixed(1)}`;

  $("#mBody").innerHTML = `
    <div class="two">
      <div>
        <div class="p__img" style="height:260px; border-radius:18px" aria-hidden="true"></div>
      </div>
      <div>
        <div class="lead" style="margin-top:0">${escapeHtml(p.blurb)}</div>
        <div class="row" style="margin:12px 0">
          <div>
            <div class="price" style="font-size:24px">${money(p.price)}</div>
            <div class="small">Původně <span class="strike">${money(p.compare)}</span></div>
          </div>
          <span class="pill pill--g">🛡️ 30 dnů</span>
        </div>
        <div class="chips">${p.tags.map((t,i)=>`<span class="pill ${i===0?"pill--b":i===1?"pill--g":"pill--y"}">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="hero__cta" style="margin-top:12px">
          <button class="btn btn--primary" id="qvAdd">Přidat do košíku</button>
          <a class="btn" href="produkt.html?id=${encodeURIComponent(p.id)}">Otevřít detail</a>
        </div>
      </div>
    </div>
  `;

  $("#qvAdd").onclick = ()=>addToCart(p.id,1);
  $("#modal").setAttribute("open","");
}

function bindSharedUI(){
  updateCartBadge();

  const mClose = $("#mClose");
  if(mClose) mClose.onclick = closeModal;

  const modal = $("#modal");
  if(modal){
    modal.addEventListener("click", (e)=>{ if(e.target.id==="modal") closeModal(); });
  }

  // Ctrl/⌘ K fokus vyhledávání
  window.addEventListener("keydown", (e)=>{
    const k = e.key.toLowerCase();
    if((e.ctrlKey || e.metaKey) && k==="k"){
      e.preventDefault();
      $("#q")?.focus();
    }
    if(e.key==="Escape") closeModal();
  });

  // search -> vždy poslat na produkty.html
  const f = $("#searchForm");
  if(f){
    f.addEventListener("submit", (e)=>{
      e.preventDefault();
      const v = ($("#q")?.value || "").trim();
      const url = new URL("produkty.html", location.href);
      if(v) url.searchParams.set("q", v);
      location.href = url.toString();
    });
  }
}

/* =========================
   Components
   ========================= */
function productCard(p){
  const cat = CATEGORIES.find(c=>c.id===p.cat);
  return `
    <article class="p" aria-label="${escapeHtml(p.name)}">
      <div class="p__img" aria-hidden="true"></div>
      <div class="p__body">
        <div class="row" style="align-items:flex-start">
          <div style="min-width:0">
            <div class="p__name">${escapeHtml(p.name)}</div>
            <div class="p__desc">${escapeHtml(p.blurb)}</div>
          </div>
          <span class="pill" title="Kategorie">${cat?cat.icon:"🧩"}</span>
        </div>
        <div class="p__row">
          <div>
            <span class="price">${money(p.price)}</span>
            <span class="strike">${money(p.compare)}</span>
          </div>
          <div class="small" title="Hodnocení">⭐ ${p.rating.toFixed(1)}</div>
        </div>
        <div class="chips" aria-label="Štítky">
          ${p.tags.slice(0,3).map((t,i)=>`<span class="pill ${i===0?"pill--b":i===1?"pill--g":"pill--y"}">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="hero__cta" style="margin-top:12px">
          <a class="btn" href="produkt.html?id=${encodeURIComponent(p.id)}">Detail</a>
          <button class="btn" data-qv="${p.id}">Rychlý náhled</button>
          <button class="btn btn--primary" data-add="${p.id}">Přidat</button>
        </div>
      </div>
    </article>`;
}

function bindProductButtons(root=document){
  $$("[data-add]", root).forEach(b=>b.onclick=()=>addToCart(b.dataset.add,1));
  $$("[data-qv]", root).forEach(b=>b.onclick=()=>openQuickView(b.dataset.qv));
}

/* =========================
   Pages
   ========================= */
function pageHome(){
  const app = $("#app");
  const topPicks = [...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,6);

  app.innerHTML = `
    <section class="hero" aria-label="Hero">
      <div class="hero__inner">
        <div>
          <div class="chips">
            <span class="pill pill--b">⚡ 100% rychlé demo</span>
            <span class="pill pill--g">🛡️ Důvěra & UX</span>
            <span class="pill pill--y">✨ Prémiový vzhled</span>
          </div>
          <h1 class="h1">E-shop, který působí jako <span style="background:linear-gradient(transparent 62%, rgba(11,92,255,.22) 0);">Apple</span> a prodává jako <span style="background:linear-gradient(transparent 62%, rgba(20,184,166,.16) 0);">Amazon</span>.</h1>
          <p class="lead">Vysoká důvěryhodnost, čistota, rychlost. Chytré filtry, košík, pokladna, účet, objednávky — rozsekané na soubory.</p>
          <div class="hero__cta">
            <a class="btn btn--primary" href="produkty.html">🛍️ Otevřít produkty</a>
            <a class="btn" href="pokladna.html">⚡ Rychlá pokladna</a>
            <a class="btn" href="kategorie.html">🧭 Kategorie</a>
          </div>
          <div class="hr"></div>
          <div class="small">Tip: Ctrl/⌘ K fokus vyhledávání. Košík se ukládá.</div>
        </div>
        <div class="hero__side">
          <div class="card">
            <div class="card__pad">
              <div class="row">
                <div>
                  <div style="font-weight:900; letter-spacing:-.2px">Doručení do 24 h</div>
                  <div class="small">nad 2 500 Kč zdarma</div>
                </div>
                <div class="pill pill--g">🚚</div>
              </div>
              <div class="hr"></div>
              <div class="row">
                <div>
                  <div style="font-weight:900; letter-spacing:-.2px">Vrácení do 30 dnů</div>
                  <div class="small">bez zbytečných řečí</div>
                </div>
                <div class="pill pill--b">🧾</div>
              </div>
              <div class="hr"></div>
              <div class="row">
                <div>
                  <div style="font-weight:900; letter-spacing:-.2px">Důvěra</div>
                  <div class="small">jasné ceny, jasné info</div>
                </div>
                <div class="pill pill--y">⭐</div>
              </div>
            </div>
          </div>
          <div class="card" style="background:rgba(255,255,255,.70)">
            <div class="card__pad">
              <div class="sectionTitle" style="margin:0 0 8px">
                <h2>Rychlé kategorie</h2>
                <span class="small">1 klik</span>
              </div>
              <div class="chips">
                ${CATEGORIES.map(c=>`<a class="pill" href="produkty.html?cat=${c.id}">${c.icon} ${c.name}</a>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid">
      <aside class="card sidebar">
        <div class="card__pad">
          <div class="sectionTitle"><h2>Nákupní asistence</h2><span class="small">UX</span></div>
          <div class="small">• Přehledné filtry<br/>• Rychlé přidání do košíku<br/>• Rychlý náhled produktu<br/>• Bezpečná pokladna</div>
          <div class="hr"></div>
          <a class="btn btn--primary" href="produkty.html" style="width:100%; justify-content:center">Přejít na produkty</a>
        </div>
      </aside>

      <section>
        <div class="sectionTitle">
          <h2>Výběr týdne</h2>
          <span class="small">prémiový dojem</span>
        </div>
        <div class="products">
          ${topPicks.map(p=>productCard(p)).join("")}
        </div>
      </section>
    </div>
  `;

  bindProductButtons(app);
}

function pageCategories(){
  const app = $("#app");
  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Kategorie</h2>
      <span class="small">vyber a filtruj</span>
    </div>

    <div class="two">
      ${CATEGORIES.map(c=>`
        <a class="card" href="produkty.html?cat=${c.id}">
          <div class="card__pad">
            <div class="row">
              <div>
                <div style="font-weight:900; font-size:18px">${c.icon} ${c.name}</div>
                <div class="small">Zobrazit produkty v kategorii</div>
              </div>
              <span class="pill pill--b">→</span>
            </div>
          </div>
        </a>
      `).join("")}

      <a class="card" href="produkty.html">
        <div class="card__pad">
          <div class="row">
            <div>
              <div style="font-weight:900; font-size:18px">🧺 Všechny produkty</div>
              <div class="small">Kompletní katalog</div>
            </div>
            <span class="pill pill--g">→</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

function filterProducts({cat="", q="", sort="top"}={}){
  let list = PRODUCTS.filter(p=>{
    const catOk = !cat || p.cat===cat;
    const qv = (q||"").toLowerCase();
    const qOk = !qv || (p.name.toLowerCase().includes(qv) || p.blurb.toLowerCase().includes(qv) || p.tags.join(" ").toLowerCase().includes(qv));
    return catOk && qOk;
  });

  if(sort==="top") list = list.sort((a,b)=>b.rating-a.rating);
  if(sort==="cheap") list = list.sort((a,b)=>a.price-b.price);
  if(sort==="exp") list = list.sort((a,b)=>b.price-a.price);
  if(sort==="new") list = list.sort((a,b)=> (b.cat==="nova") - (a.cat==="nova"));
  return list;
}

function pageProducts(){
  const app = $("#app");
  const params = qs();
  const cat = params.get("cat") || "";
  const q = params.get("q") || "";
  $("#q").value = q;

  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Produkty</h2>
      <span class="small" id="count"></span>
    </div>

    <div class="grid">
      <aside class="card sidebar" aria-label="Filtry">
        <div class="card__pad">
          <div class="sectionTitle"><h2>Filtry</h2><span class="small">rychle</span></div>

          <div class="field">
            <label for="fCat">Kategorie</label>
            <select id="fCat">
              <option value="">Všechny</option>
              ${CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join("")}
            </select>
          </div>

          <div class="field">
            <label for="fSort">Řazení</label>
            <select id="fSort">
              <option value="top">Nejlepší hodnocení</option>
              <option value="cheap">Nejlevnější</option>
              <option value="exp">Nejdražší</option>
              <option value="new">Novinky nahoře</option>
            </select>
          </div>

          <div class="hr"></div>
          <div class="small">Tip: hledání nahoře filtruje hned (odesláním jdeš sem).</div>
          <div style="margin-top:12px">
            <button class="btn" id="clearFilters" style="width:100%; justify-content:center">Zrušit filtry</button>
          </div>
        </div>
      </aside>

      <section>
        <div class="chips" style="margin-bottom:10px">
          <span class="pill pill--b">⚡ Okamžitá reakce</span>
          <span class="pill pill--g">🛡️ Důvěryhodný layout</span>
          <span class="pill pill--y">✨ Premium vibe</span>
        </div>

        <div class="products" id="plist"></div>
      </section>
    </div>
  `;

  const fCat = $("#fCat");
  const fSort = $("#fSort");
  fCat.value = cat;
  fSort.value = "top";

  function paint(){
    const list = filterProducts({
      cat: fCat.value,
      q: ($("#q").value || "").trim(),
      sort: fSort.value
    });
    $("#count").textContent = `${list.length} položek`;
    $("#plist").innerHTML = list.map(p=>productCard(p)).join("");
    bindProductButtons(app);
  }

  fCat.onchange = paint;
  fSort.onchange = paint;
  $("#q").addEventListener("input", paint);

  $("#clearFilters").onclick = ()=>{
    fCat.value = "";
    fSort.value = "top";
    $("#q").value = "";
    history.replaceState({}, "", "produkty.html");
    paint();
  };

  paint();
}

function pageProduct(){
  const app = $("#app");
  const id = qs().get("id");
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p){ app.innerHTML = `<div class="card"><div class="card__pad">Produkt nenalezen.</div></div>`; return; }

  const cat = CATEGORIES.find(c=>c.id===p.cat);

  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Detail produktu</h2>
      <a class="small" href="produkty.html?cat=${p.cat}">← Zpět na produkty</a>
    </div>

    <div class="card">
      <div class="card__pad">
        <div class="two">
          <div>
            <div class="p__img" style="height:320px; border-radius:18px" aria-hidden="true"></div>
            <div class="chips" style="margin-top:12px">
              <span class="pill pill--b">⭐ ${p.rating.toFixed(1)} / 5</span>
              <span class="pill">${cat?cat.icon:"🧩"} ${cat?cat.name:"Kategorie"}</span>
              <span class="pill pill--g">🛡️ 30 dnů vrácení</span>
            </div>
          </div>

          <div>
            <div style="font-size:28px; font-weight:950; letter-spacing:-.4px">${escapeHtml(p.name)}</div>
            <p class="lead" style="margin-top:8px">${escapeHtml(p.blurb)} — tady by byly výhody, specifikace a FAQ.</p>

            <div class="row" style="margin:12px 0">
              <div>
                <div class="price" style="font-size:26px">${money(p.price)}</div>
                <div class="small">Původně <span class="strike">${money(p.compare)}</span></div>
              </div>
              <span class="pill pill--y">🎁 Dárek v balení</span>
            </div>

            <div class="card" style="background:rgba(255,255,255,.70)">
              <div class="card__pad">
                <div style="font-weight:900">Vyber variantu</div>
                <div class="two" style="margin-top:8px">
                  <select id="v1">
                    <option>Standard</option>
                    <option>Pro</option>
                    <option>Max</option>
                  </select>
                  <select id="v2">
                    <option>Barva: Grafit</option>
                    <option>Barva: Bílá</option>
                    <option>Barva: Modrá</option>
                  </select>
                </div>
                <div class="hero__cta" style="margin-top:12px">
                  <button class="btn btn--primary" id="addOne">🛒 Přidat do košíku</button>
                  <a class="btn" href="pokladna.html">⚡ Koupit hned</a>
                  <button class="btn" id="qv">Rychlý náhled</button>
                </div>
                <div class="small" style="margin-top:10px">Doprava: <b>${p.price>=2500?"zdarma":"89 Kč"}</b> • Platby: karta / převod / dobírka</div>
              </div>
            </div>

            <div class="card" style="margin-top:12px">
              <div class="card__pad">
                <div class="sectionTitle" style="margin:0"><h2>Recenze</h2><span class="small">demo</span></div>
                <div class="small">„Perfektní dojem, rychlé doručení.“ — ⭐⭐⭐⭐⭐</div>
                <div class="small" style="margin-top:8px">„Čistota jako Apple. Koupě bez stresu.“ — ⭐⭐⭐⭐⭐</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  $("#addOne").onclick = ()=>addToCart(p.id, 1);
  $("#qv").onclick = ()=>openQuickView(p.id);
}

function pageCart(){
  const app = $("#app");
  const cart = store.getCart();
  const {subtotal, shipping, total} = cartTotals();

  function getQty(id){
    const it = store.getCart().find(x=>x.id===id);
    return it ? it.qty : 1;
  }

  function lineItem(it){
    const p = PRODUCTS.find(x=>x.id===it.id);
    if(!p) return "";
    return `
      <div class="card" style="background:rgba(255,255,255,.70); margin:10px 0">
        <div class="card__pad">
          <div class="row" style="align-items:flex-start">
            <div style="display:flex; gap:12px; align-items:flex-start; min-width:0">
              <div class="p__img" style="width:110px; height:86px; border-radius:14px" aria-hidden="true"></div>
              <div style="min-width:0">
                <div style="font-weight:950">${escapeHtml(p.name)}</div>
                <div class="small">${escapeHtml(p.blurb)}</div>
                <div class="small" style="margin-top:6px">Cena: <b>${money(p.price)}</b></div>
              </div>
            </div>
            <button class="btn" data-rm="${p.id}" aria-label="Odebrat">🗑️</button>
          </div>

          <div class="row" style="margin-top:10px">
            <div class="hero__cta" style="margin:0">
              <button class="btn" data-minus="${p.id}">−</button>
              <span class="pill" aria-label="Počet">${it.qty} ks</span>
              <button class="btn" data-plus="${p.id}">+</button>
            </div>
            <div style="font-weight:950">${money(p.price * it.qty)}</div>
          </div>
        </div>
      </div>`;
  }

  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Košík</h2>
      <span class="small">${cartCount()} ks</span>
    </div>

    <div class="grid">
      <section class="card">
        <div class="card__pad">
          ${cart.length ? cart.map(lineItem).join("") : `
            <div style="padding:18px; text-align:center">
              <div style="font-size:40px">🛒</div>
              <div style="font-weight:950; font-size:18px; margin-top:8px">Košík je prázdný</div>
              <div class="small" style="margin-top:6px">Vyber si něco, co má wow efekt.</div>
              <div style="margin-top:12px"><a class="btn btn--primary" href="produkty.html">Jít na produkty</a></div>
            </div>
          `}
        </div>
      </section>

      <aside class="card sidebar">
        <div class="card__pad">
          <div class="sectionTitle"><h2>Souhrn</h2><span class="small">pokladna</span></div>
          <div class="row"><div class="small">Mezisoučet</div><div style="font-weight:900">${money(subtotal)}</div></div>
          <div class="row" style="margin-top:8px"><div class="small">Doprava</div><div style="font-weight:900">${shipping?money(shipping):"Zdarma"}</div></div>
          <div class="hr"></div>
          <div class="row"><div style="font-weight:950">Celkem</div><div style="font-weight:950; font-size:18px">${money(total)}</div></div>
          <div style="margin-top:12px">
            <a class="btn btn--primary" href="pokladna.html" style="width:100%; justify-content:center">Pokračovat k pokladně</a>
          </div>
          <div class="small" style="margin-top:10px">Doprava zdarma od 2 500 Kč.</div>
        </div>
      </aside>
    </div>
  `;

  $$("[data-minus]").forEach(b=>b.onclick=()=>{ setQty(b.dataset.minus, getQty(b.dataset.minus)-1); pageCart(); });
  $$("[data-plus]").forEach(b=>b.onclick=()=>{ setQty(b.dataset.plus, getQty(b.dataset.plus)+1); pageCart(); });
  $$("[data-rm]").forEach(b=>b.onclick=()=>{ removeFromCart(b.dataset.rm); pageCart(); });
}

function pageCheckout(){
  const app = $("#app");
  const cart = store.getCart();
  const {subtotal, shipping, total} = cartTotals();
  const user = store.getUser();

  if(!cart.length){
    app.innerHTML = `
      <div class="card">
        <div class="card__pad" style="text-align:center; padding:22px">
          <div style="font-size:42px">🧾</div>
          <div style="font-weight:950; font-size:18px; margin-top:8px">Nejdřív vlož něco do košíku</div>
          <div class="small" style="margin-top:6px">Pokladna dává smysl až s produkty.</div>
          <div style="margin-top:12px"><a class="btn btn--primary" href="produkty.html">Jít na produkty</a></div>
        </div>
      </div>`;
    return;
  }

  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Pokladna</h2>
      <span class="small">bez tření</span>
    </div>

    <div class="grid">
      <section class="card">
        <div class="card__pad">
          <div class="sectionTitle"><h2>Kontaktní údaje</h2><span class="small">1/3</span></div>
          <div class="two">
            <div class="field">
              <label>Jméno a příjmení</label>
              <input class="input" id="name" placeholder="Jan Novák" value="${user?.name?escapeHtml(user.name):""}"/>
            </div>
            <div class="field">
              <label>E-mail</label>
              <input class="input" id="email" placeholder="jan@domena.cz" value="${user?.email?escapeHtml(user.email):""}"/>
            </div>
          </div>

          <div class="sectionTitle" style="margin-top:10px"><h2>Doručení</h2><span class="small">2/3</span></div>
          <div class="two">
            <div class="field">
              <label>Ulice a číslo</label>
              <input class="input" id="addr" placeholder="Ulice 12"/>
            </div>
            <div class="field">
              <label>Město</label>
              <input class="input" id="city" placeholder="Brno"/>
            </div>
          </div>
          <div class="two">
            <div class="field">
              <label>PSČ</label>
              <input class="input" id="zip" placeholder="602 00"/>
            </div>
            <div class="field">
              <label>Doprava</label>
              <select id="ship">
                <option value="standard">Standard (89 Kč / zdarma od 2 500)</option>
                <option value="express">Express (149 Kč)</option>
                <option value="pickup">Výdejní místo (69 Kč)</option>
              </select>
            </div>
          </div>

          <div class="sectionTitle" style="margin-top:10px"><h2>Platba</h2><span class="small">3/3</span></div>
          <div class="two">
            <div class="field">
              <label>Metoda</label>
              <select id="pay">
                <option>Karta</option>
                <option>Převod</option>
                <option>Dobírka</option>
              </select>
            </div>
            <div class="field">
              <label>Poznámka</label>
              <input class="input" id="note" placeholder="Např. nevolat, zazvonit"/>
            </div>
          </div>

          <div class="hr"></div>
          <div class="hero__cta">
            <button class="btn btn--primary" id="place">✅ Odeslat objednávku</button>
            <a class="btn" href="kosik.html">← Zpět do košíku</a>
          </div>
          <div class="small" style="margin-top:10px">Demo: objednávka se uloží do historie (localStorage).</div>
        </div>
      </section>

      <aside class="card sidebar">
        <div class="card__pad">
          <div class="sectionTitle"><h2>Souhrn</h2><span class="small">kontrola</span></div>
          <div class="small">
            ${cart.map(it=>{
              const p=PRODUCTS.find(x=>x.id===it.id);
              return p?`• ${escapeHtml(p.name)} × ${it.qty}`:"";
            }).join("<br/>")}
          </div>
          <div class="hr"></div>
          <div class="row"><div class="small">Mezisoučet</div><div style="font-weight:900">${money(subtotal)}</div></div>
          <div class="row" style="margin-top:8px"><div class="small">Doprava</div><div style="font-weight:900">${shipping?money(shipping):"Zdarma"}</div></div>
          <div class="hr"></div>
          <div class="row"><div style="font-weight:950">Celkem</div><div style="font-weight:950; font-size:18px">${money(total)}</div></div>
        </div>
      </aside>
    </div>
  `;

  $("#place").onclick = ()=>{
    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    if(!name || !email){ toast("Doplň jméno a e-mail", "warn"); return; }

    store.setUser({name, email});

    const id = "AO" + Math.random().toString(16).slice(2,8).toUpperCase();
    const order = {
      id,
      createdAt: new Date().toISOString(),
      items: store.getCart(),
      total: cartTotals().total,
      status: "Přijato",
    };

    const orders = store.getOrders();
    orders.unshift(order);
    store.setOrders(orders);

    store.setCart([]);
    updateCartBadge();
    toast("Objednávka odeslána (demo)");
    location.href = `objednavka.html?id=${encodeURIComponent(id)}`;
  };
}

function pageAccount(){
  const app = $("#app");
  const user = store.getUser();
  const orders = store.getOrders();

  app.innerHTML = `
    <div class="sectionTitle">
      <h2>Můj účet</h2>
      <span class="small">přehled</span>
    </div>

    ${user ? `
      <div class="card">
        <div class="card__pad">
          <div class="row">
            <div>
              <div style="font-weight:950; font-size:18px">👤 ${escapeHtml(user.name)}</div>
              <div class="small">${escapeHtml(user.email)}</div>
            </div>
            <button class="btn" id="logout">Odhlásit</button>
          </div>
          <div class="hr"></div>
          <div class="sectionTitle" style="margin:0 0 8px"><h2>Objednávky</h2><span class="small">historie</span></div>
          ${orders.length ? orders.map(o=>`
            <a class="card" href="objednavka.html?id=${encodeURIComponent(o.id)}" style="display:block; margin:10px 0; background:rgba(255,255,255,.70)">
              <div class="card__pad">
                <div class="row">
                  <div>
                    <div style="font-weight:950">Objednávka ${o.id}</div>
                    <div class="small">Stav: <b>${o.status}</b> • ${new Date(o.createdAt).toLocaleString("cs-CZ")}</div>
                  </div>
                  <div style="font-weight:950">${money(o.total)}</div>
                </div>
              </div>
            </a>
          `).join("") : `<div class="small">Zatím nemáš žádnou objednávku. Udělej test nákup.</div>`}
        </div>
      </div>
    ` : `
      <div class="two">
        <a class="card" href="login.html"><div class="card__pad"><div style="font-weight:950; font-size:18px">🔑 Přihlásit se</div><div class="small">Pokračuj v nákupu rychleji</div></div></a>
        <a class="card" href="registrace.html"><div class="card__pad"><div style="font-weight:950; font-size:18px">✨ Vytvořit účet</div><div class="small">Historie objednávek a adresa</div></div></a>
      </div>
    `}
  `;

  const lo = $("#logout");
  if(lo) lo.onclick = ()=>{ store.setUser(null); toast("Odhlášeno", "warn"); pageAccount(); };
}

function pageLogin(){
  const app = $("#app");
  app.innerHTML = `
    <div class="card">
      <div class="card__pad">
        <div class="sectionTitle"><h2>Přihlášení</h2><span class="small">demo</span></div>
        <div class="two">
          <div class="field">
            <label>E-mail</label>
            <input class="input" id="le" placeholder="jan@domena.cz"/>
          </div>
          <div class="field">
            <label>Heslo</label>
            <input class="input" id="lp" type="password" placeholder="••••••••"/>
          </div>
        </div>
        <div class="hero__cta">
          <button class="btn btn--primary" id="loginBtn">Přihlásit</button>
          <a class="btn" href="registrace.html">Vytvořit účet</a>
        </div>
        <div class="small" style="margin-top:10px">Demo: stačí vyplnit e-mail a „přihlásit“.</div>
      </div>
    </div>
  `;

  $("#loginBtn").onclick = ()=>{
    const email = $("#le").value.trim();
    if(!email){ toast("Zadej e-mail", "warn"); return; }
    store.setUser({name:"Zákazník", email});
    toast("Přihlášeno");
    location.href = "ucet.html";
  };
}

function pageRegister(){
  const app = $("#app");
  app.innerHTML = `
    <div class="card">
      <div class="card__pad">
        <div class="sectionTitle"><h2>Registrace</h2><span class="small">demo</span></div>
        <div class="two">
          <div class="field">
            <label>Jméno</label>
            <input class="input" id="rn" placeholder="Jan"/>
          </div>
          <div class="field">
            <label>E-mail</label>
            <input class="input" id="re" placeholder="jan@domena.cz"/>
          </div>
        </div>
        <div class="two">
          <div class="field">
            <label>Heslo</label>
            <input class="input" id="rp" type="password" placeholder="••••••••"/>
          </div>
          <div class="field">
            <label>Heslo znovu</label>
            <input class="input" id="rp2" type="password" placeholder="••••••••"/>
          </div>
        </div>
        <div class="hero__cta">
          <button class="btn btn--primary" id="regBtn">Vytvořit účet</button>
          <a class="btn" href="login.html">Už mám účet</a>
        </div>
      </div>
    </div>
  `;

  $("#regBtn").onclick = ()=>{
    const name = $("#rn").value.trim();
    const email = $("#re").value.trim();
    if(!name || !email){ toast("Doplň jméno a e-mail", "warn"); return; }
    store.setUser({name, email});
    toast("Účet vytvořen");
    location.href = "ucet.html";
  };
}

function pageOrder(){
  const app = $("#app");
  const id = qs().get("id");
  const o = store.getOrders().find(x=>x.id===id);
  if(!o){ app.innerHTML = `<div class="card"><div class="card__pad">Objednávka nenalezena.</div></div>`; return; }

  app.innerHTML = `
    <div class="card">
      <div class="card__pad">
        <div class="sectionTitle"><h2>Objednávka ${o.id}</h2><span class="small">detail</span></div>
        <div class="two">
          <div>
            <div class="small">Stav</div>
            <div style="font-weight:950; font-size:18px">${o.status}</div>
            <div class="small" style="margin-top:8px">Vytvořeno: ${new Date(o.createdAt).toLocaleString("cs-CZ")}</div>
          </div>
          <div>
            <div class="small">Celkem</div>
            <div style="font-weight:950; font-size:18px">${money(o.total)}</div>
            <div class="small" style="margin-top:8px">Děkujeme — tohle je demo objednávka.</div>
          </div>
        </div>
        <div class="hr"></div>
        <div class="sectionTitle" style="margin:0 0 8px"><h2>Položky</h2><span class="small">${o.items.reduce((a,i)=>a+i.qty,0)} ks</span></div>
        <div class="small">
          ${o.items.map(it=>{
            const p = PRODUCTS.find(x=>x.id===it.id);
            if(!p) return "";
            return `• <b>${escapeHtml(p.name)}</b> × ${it.qty} — ${money(p.price*it.qty)}`;
          }).join("<br/>")}
        </div>
        <div class="hero__cta" style="margin-top:14px">
          <a class="btn btn--primary" href="produkty.html">Nakoupit znovu</a>
          <a class="btn" href="ucet.html">Můj účet</a>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   Boot
   ========================= */
(function boot(){
  bindSharedUI();

  const page = document.body.dataset.page || "home";
  if(page==="home") pageHome();
  if(page==="categories") pageCategories();
  if(page==="products") pageProducts();
  if(page==="product") pageProduct();
  if(page==="cart") pageCart();
  if(page==="checkout") pageCheckout();
  if(page==="account") pageAccount();
  if(page==="login") pageLogin();
  if(page==="register") pageRegister();
  if(page==="order") pageOrder();
})();
