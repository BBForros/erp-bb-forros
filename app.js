const FIREBASE_URL = "COLE_AQUI_SEU_LINK_DO_FIREBASE";

const auth = {
    login: () => {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if(u === 'admin' && p === '123') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            ui.render('dashboard');
        } else { alert("Erro!"); }
    },
    logout: () => location.reload()
};

const db = {
    list: async (f) => {
        const r = await fetch(`${FIREBASE_URL}/${f}.json`);
        const d = await r.json();
        return d ? Object.keys(d).map(id => ({ id, ...d[id] })) : [];
    },
    save: async (f, d) => {
        await fetch(`${FIREBASE_URL}/${f}.json`, { method: 'POST', body: JSON.stringify(d) });
    }
};

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = "<h2>Carregando...</h2>";

        if(section === 'dashboard') {
            const peds = await db.list('pedidos');
            const total = peds.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
            area.innerHTML = `<h1>📊 Financeiro</h1>
                <div class="grid-form">
                    <div class="card"><h3>Faturamento</h3><h2>R$ ${total.toFixed(2)}</h2></div>
                    <div class="card"><h3>Vendas</h3><h2>${peds.length}</h2></div>
                </div>`;
        }

        if(section === 'clientes') {
            const lista = await db.list('clientes');
            area.innerHTML = `<h1>👥 Clientes</h1>
                <div class="card grid-form">
                    <div class="full"><label>Nome</label><input id="c-nome"></div>
                    <button onclick="actions.saveCli()" class="full" style="background:var(--primary); color:white; padding:12px; border:none; border-radius:8px; cursor:pointer;">SALVAR</button>
                </div>
                <div class="card"><table><thead><tr><th>Nome</th></tr></thead><tbody>${lista.map(c => `<tr><td>${c.nome}</td></tr>`).join('')}</tbody></table></div>`;
        }

        if(section === 'pedidos') {
            const clis = await db.list('clientes');
            const peds = await db.list('pedidos');
            area.innerHTML = `<h1>🛒 Pedidos</h1>
                <div class="card grid-form">
                    <div><label>Nº</label><input id="p-num"></div>
                    <div><label>Data</label><input id="p-data" type="date"></div>
                    <div class="full"><label>Cliente</label><select id="p-cli">${clis.map(c => `<option>${c.nome}</option>`).join('')}</select></div>
                    <div class="full"><label>Material</label><input id="p-mat"></div>
                    <div><label>Qtd</label><input id="p-qtd" type="number"></div>
                    <div><label>Vlr</label><input id="p-vlr" type="number"></div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer;">GERAR PEDIDO</button>
                </div>
                <div class="card"><table><thead><tr><th>Nº</th><th>Cliente</th><th>Total</th></tr></thead><tbody>${peds.map(p => `<tr><td>${p.numero}</td><td>${p.cliente}</td><td>R$ ${p.total}</td></tr>`).join('')}</tbody></table></div>`;
        }
    }
};

const actions = {
    saveCli: async () => {
        const n = document.getElementById('c-nome').value;
        if(n) { await db.save('clientes', { nome: n }); ui.render('clientes'); }
    },
    savePed: async () => {
        const q = document.getElementById('p-qtd').value;
        const v = document.getElementById('p-vlr').value;
        const d = {
            numero: document.getElementById('p-num').value,
            cliente: document.getElementById('p-cli').value,
            material: document.getElementById('p-mat').value,
            qtd: q, unit: v, total: (q * v).toFixed(2),
            data: document.getElementById('p-data').value
        };
        await db.save('pedidos', d); ui.render('pedidos');
    }
};
