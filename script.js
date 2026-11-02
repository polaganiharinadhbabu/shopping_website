const $=s=>document.getElementById(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r2=n=>Math.round(n*100)/100,fmt=n=>'₹'+r2(n).toLocaleString('en-IN');
const K='store-v1';
const P=(id,name,price,cat,stock,emoji)=>({id,name,price,cat,stock,emoji});
let S={store:'My Store',next:1,orders:[],prods:[P(1,'Running Shoes',1499,'Footwear',12,'👟'),P(2,'Wireless Headphones',1299,'Electronics',8,'🎧'),P(3,'Smart Watch',1999,'Accessories',5,'⌚'),P(4,'Backpack',899,'Bags',15,'🎒'),P(5,'Cotton T-Shirt',399,'Clothing',30,'👕'),P(6,'Sunglasses',599,'Accessories',10,'🕶️'),P(7,'Phone Case',249,'Electronics',40,'📱'),P(8,'Water Bottle',349,'Home',20,'🧴')]};
try{const r=localStorage.getItem(K);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){alert('Storage is full. Remove some photos or products.')}};
let tab='shop',q='',cat='All',sort='new',cart={},step='cart',form={name:'',phone:'',addr:'',pay:'Cash on delivery'},done=null,newImg='';
const prod=id=>S.prods.find(p=>p.id==id);
const thumb=p=>p.img?`<img src="${p.img}" alt="">`:(p.emoji||'🛍️');
function cartCalc(){let sub=0;for(const id in cart){const p=prod(id);if(p)sub+=p.price*cart[id]}sub=r2(sub);const ship=sub===0||sub>=499?0:40;return{sub,ship,total:r2(sub+ship)}}
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);

function vShop(){
const cats=['All',...new Set(S.prods.map(p=>p.cat).filter(Boolean))];
let L=S.prods.filter(p=>(cat==='All'||p.cat===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));
if(sort==='lo')L.sort((a,b)=>a.price-b.price);else if(sort==='hi')L.sort((a,b)=>b.price-a.price);else L.reverse();
return `<div class="chips">${cats.map(c=>`<button data-a="cat" data-v="${esc(c)}" aria-pressed="${c===cat}">${esc(c)}</button>`).join('')}</div>
<div class="bar"><span style="color:var(--mu)">${L.length} products</span><select data-f="sort" aria-label="Sort"><option value="new"${sort==='new'?' selected':''}>Newest</option><option value="lo"${sort==='lo'?' selected':''}>Price: low to high</option><option value="hi"${sort==='hi'?' selected':''}>Price: high to low</option></select></div>
<div class="grid">${L.map(p=>`<div class="p"><div class="ph">${thumb(p)}</div><div class="pb"><small>${esc(p.cat||'')}</small><span>${esc(p.name)}</span><b>${fmt(p.price)}</b>${p.stock<1?'<span class="tag" style="background:var(--bd)">Out of stock</span>':p.stock<5?`<small>Only ${p.stock} left</small>`:''}<button class="btn" data-a="add" data-id="${p.id}" style="margin-top:auto" ${p.stock<1?'disabled':''}>Add to cart</button></div></div>`).join('')||'<p>No products found.</p>'}</div>
<p style="color:var(--mu);margin-top:20px">Free delivery on orders of ₹499 and above, otherwise ₹40.</p>`}

function vAdmin(){
const st=['New','Packed','Delivered'];
return `<div class="card"><h3>Store name</h3><input data-f="store" value="${esc(S.store)}" aria-label="Store name" style="margin-top:8px"></div>
<div class="card"><h3>Add a product</h3><div class="r3"><div><label class="f" for="an">Name</label><input id="an"></div><div><label class="f" for="ap">Price (₹)</label><input id="ap" type="number" min="1" inputmode="decimal"></div><div><label class="f" for="ac">Category</label><input id="ac" placeholder="e.g. Clothing"></div><div><label class="f" for="as">Stock</label><input id="as" type="number" min="0" value="10"></div><div><label class="f" for="ae">Emoji (if no photo)</label><input id="ae" placeholder="🛍️" maxlength="4"></div><div><label class="f" for="ai">Photo (optional)</label><input id="ai" type="file" accept="image/*" data-f="img"></div></div><div class="msg" id="msg" role="status"></div><button class="btn" data-a="addp">Add product</button></div>
<div class="card"><h3>Products</h3>${S.prods.map(p=>`<div class="row"><span>${esc(p.name)}</span><label>₹<input type="number" min="0" value="${p.price}" data-a="price" data-id="${p.id}" aria-label="Price"></label><label>Stock<input type="number" min="0" value="${p.stock}" data-a="stock" data-id="${p.id}" aria-label="Stock"></label><button class="btn alt sm" data-a="delp" data-id="${p.id}">Remove</button></div>`).join('')||'<p>No products.</p>'}</div>
<div class="card"><h3>Orders (${S.orders.length})</h3>${[...S.orders].reverse().map(o=>`<div class="row" style="align-items:flex-start"><span><b>#${o.no}</b> · ${new Date(o.time).toLocaleDateString()}<br>${esc(o.name)}, ${esc(o.phone)}<br><small>${esc(o.addr)}</small><br><small>${o.lines.map(l=>esc(l.name)+' × '+l.qty).join(', ')}</small><br><small>${esc(o.pay)}</small></span><b>${fmt(o.total)}</b><button class="btn sm ${o.status==='Delivered'?'alt':'hi'}" data-a="stat" data-no="${o.no}">${o.status}</button></div>`).join('')||'<p>No orders yet.</p>'}</div>
<p class="msg" style="color:var(--mu);font-weight:400">This is a demo store: products and orders are saved only in this browser, and there is no online payment. A live shop needs a server and a payment gateway.</p>`}

function drawer(){
const c=cartCalc(),ids=Object.keys(cart);
let h=`<div class="row" style="border:0"><h2 style="flex:1">${step==='done'?'Order placed':step==='checkout'?'Checkout':'Your cart'}</h2><button class="btn alt sm" data-a="close">Close</button></div>`;
if(step==='done')return h+`<div class="card"><p><b>Thank you, ${esc(done.name)}!</b></p><p>Your order <b>#${done.no}</b> for ${fmt(done.total)} is placed. Payment: ${esc(done.pay)}.</p></div><button class="btn" data-a="close">Keep shopping</button>`;
if(!ids.length)return h+'<p>Your cart is empty.</p>';
h+=ids.map(id=>{const p=prod(id);return `<div class="line"><div class="t">${thumb(p)}</div><span>${esc(p.name)}<br><small>${fmt(p.price)}</small></span><button class="q" data-a="minus" data-id="${id}" aria-label="Less">−</button><b>${cart[id]}</b><button class="q" data-a="plus" data-id="${id}" aria-label="More">+</button></div>`}).join('');
h+=`<div style="margin:12px 0"><div class="tot"><span>Subtotal</span><span>${fmt(c.sub)}</span></div><div class="tot"><span>Delivery</span><span>${c.ship?fmt(c.ship):'Free'}</span></div><div class="tot big"><span>Total</span><span>${fmt(c.total)}</span></div></div>`;
if(step==='cart')return h+'<button class="btn hi" data-a="checkout">Checkout</button>';
return h+`<label class="f" for="cn">Full name</label><input id="cn" data-f="name" value="${esc(form.name)}"><label class="f" for="cp">Phone</label><input id="cp" data-f="phone" value="${esc(form.phone)}" inputmode="tel"><label class="f" for="ca">Delivery address</label><textarea id="ca" data-f="addr" rows="3">${esc(form.addr)}</textarea><label class="f" for="cy">Payment</label><select id="cy" data-f="pay"><option>Cash on delivery</option><option>UPI on delivery</option></select><div class="msg" id="dm" role="status"></div><button class="btn hi" data-a="place">Place order</button><button class="btn alt" data-a="back" style="margin-top:8px">Back to cart</button>`}

function render(){document.querySelectorAll('header [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));$('sn').textContent=S.store;document.title=S.store;$('cb').textContent='Cart ('+count()+')';$('main').innerHTML=tab==='shop'?vShop():vAdmin()}
function renderDr(){$('dr').innerHTML=drawer();$('ov').classList.add('on');$('cb').textContent='Cart ('+count()+')'}
function readImg(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,400/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.8))};im.src=fr.result};fr.readAsDataURL(f)})}
function amsg(id,t){const m=$(id);if(m)m.textContent=t}

document.addEventListener('click',e=>{
const tb=e.target.closest('header [data-t]');if(tb){tab=tb.dataset.t;render();return}
const b=e.target.closest('[data-a]');if(!b||b.tagName==='INPUT'||b.tagName==='SELECT')return;const a=b.dataset.a,id=b.dataset.id;
if(a==='cart'){step='cart';renderDr()}
else if(a==='close'){$('ov').classList.remove('on');render()}
else if(a==='cat'){cat=b.dataset.v;render()}
else if(a==='add'){const p=prod(id);if((cart[id]||0)<p.stock)cart[id]=(cart[id]||0)+1;render();b.textContent='Added ✓'}
else if(a==='plus'){const p=prod(id);if(cart[id]<p.stock)cart[id]++;renderDr()}
else if(a==='minus'){cart[id]--;if(cart[id]<1)delete cart[id];renderDr()}
else if(a==='checkout'){step='checkout';renderDr()}
else if(a==='back'){step='cart';renderDr()}
else if(a==='place'){
if(!form.name.trim())return amsg('dm','Enter your name.');
if(!/^\d{10}$/.test(form.phone.replace(/\D/g,'').slice(-10))||form.phone.replace(/\D/g,'').length<10)return amsg('dm','Enter a valid 10-digit phone number.');
if(form.addr.trim().length<8)return amsg('dm','Enter your full delivery address.');
const c=cartCalc(),lines=Object.keys(cart).map(i=>({name:prod(i).name,qty:cart[i],price:prod(i).price}));
Object.keys(cart).forEach(i=>{const p=prod(i);p.stock=Math.max(0,p.stock-cart[i])});
const o={no:S.next++,time:new Date().toISOString(),name:form.name.trim(),phone:form.phone.trim(),addr:form.addr.trim(),pay:form.pay,lines,sub:c.sub,ship:c.ship,total:c.total,status:'New'};
S.orders.push(o);save();done=o;cart={};step='done';renderDr()}
else if(a==='addp'){const n=$('an').value.trim(),p=parseFloat($('ap').value);if(!n||!(p>0))return amsg('msg','Enter a name and a price above 0.');
S.prods.push({id:Date.now(),name:n,price:r2(p),cat:$('ac').value.trim()||'General',stock:Math.max(0,parseInt($('as').value)||0),emoji:$('ae').value.trim(),img:newImg});newImg='';save();render();amsg('msg','Added '+n+'.')}
else if(a==='delp'){if(b.dataset.armed){S.prods=S.prods.filter(p=>p.id!=id);delete cart[id];save();render()}else{b.dataset.armed=1;b.textContent='Tap again';setTimeout(()=>{delete b.dataset.armed;b.textContent='Remove'},3000)}}
else if(a==='stat'){const o=S.orders.find(x=>x.no==b.dataset.no),s=['New','Packed','Delivered'];o.status=s[(s.indexOf(o.status)+1)%3];save();render()}});
$('q').addEventListener('input',e=>{q=e.target.value;if(tab!=='shop')tab='shop';render()});
document.addEventListener('input',e=>{const f=e.target.dataset.f;if(!f)return;const v=e.target.value;if(f==='store'){S.store=v||'My Store';$('sn').textContent=S.store;document.title=S.store;save()}else if(['name','phone','addr'].includes(f))form[f]=v});
document.addEventListener('change',async e=>{const t=e.target,f=t.dataset.f,a=t.dataset.a;
if(f==='sort'){sort=t.value;render()}
else if(f==='pay')form.pay=t.value;
else if(f==='img'&&t.files[0])newImg=await readImg(t.files[0]);
else if(a==='price'){const p=prod(t.dataset.id),v=parseFloat(t.value);if(v>=0){p.price=r2(v);save()}else t.value=p.price}
else if(a==='stock'){const p=prod(t.dataset.id),v=parseInt(t.value);if(v>=0){p.stock=v;save()}else t.value=p.stock}});
render();
