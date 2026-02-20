const FIREBASE_URL = "COLE_AQUI_O_LINK_DO_SEU_FIREBASE"; 

const auth = {
    login: () => {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if(u === 'admin' && p === '123') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            ui.render('dashboard');
        } else { alert("Acesso negado!"); }
    },
    logout: () => location.reload()
};

const db = {
    list: async (folder) => {
        try {
            const res = await fetch(`${FIREBASE_URL}/${folder}.json`);
            const data = await res.json();
            return data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
        } catch (e) { return []; }
    }
};

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = "<h2>Carregando...</h2>";

        // SEÇÃO DO FINANCEIRO (DASHBOARD)
        if(section === 'dashboard') {
            const peds = await db.list('pedidos');
            const faturamento = peds.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
            
            area.innerHTML = `
                <h1 style="color:var(--primary); margin-bottom:20px;">📊 Resumo Financeiro</h1>
                <div class="grid-form">
                    <div class="card" style="border-left: 8px solid var(--primary);">
                        <h3>FATURAMENTO BRUTO</h3>
                        <h2 style="color:var(--primary); font-size:32px;">R$ ${faturamento.toFixed(2)}</h2>
                    </div>
                    <div class="card">
                        <h3>TOTAL DE PEDIDOS</h3>
                        <h2 style="font-size:32px;">${peds.length}</h2>
                    </div>
                </div>
                <div class="card">
                    <h3>Últimas Vendas</h3>
                    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                        <thead><tr style="text-align:left; color:var(--primary); border-bottom:1px solid #eee;"><th>Pedido</th><th>Cliente</th><th>Valor</th></tr></thead>
                        <tbody>${peds.slice(-5).reverse().map(p => `<tr><td>#${p.numero}</td><td>${p.cliente}</td><td>R$ ${p.total}</td></tr>`).join('')}</tbody>
                    </table>
                </div>`;
        }

        // SEÇÃO DE CLIENTES
        if(section === 'clientes') {
            const clis = await db.list('clientes');
            area.innerHTML = `<h1>👥 Clientes</h1>
                <div class="card grid-form">
                    <div class="full"><label>Nome / Razão Social</label><input id="c-nome"></div>
                    <button onclick="actions.saveCli()" class="full" style="background:var(--primary); color:white; padding:12px; border:none; border-radius:8px; cursor:pointer;">CADASTRAR CLIENTE</button>
                </div>
                <div class="card">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="text-align:left; border-bottom:1px solid #ccc;"><th>Nome</th></tr></thead>
                        <tbody>${clis.map(c => `<tr><td>${c.nome}</td></tr>`).join('')}</tbody>
                    </table>
                </div>`;
        }

        // SEÇÃO DE PEDIDOS
        if(section === 'pedidos') {
            const clis = await db.list('clientes');
            const peds = await db.list('pedidos');
            area.innerHTML = `<h1>🛒 Novo Pedido</h1>
                <div class="card grid-form">
                    <div><label>Nº Pedido</label><input id="p-num"></div>
                    <div><label>Data</label><input id="p-data" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
                    <div class="full"><label>Cliente</label>
                        <select id="p-cli"><option value="">Escolha...</option>${clis.map(c => `<option>${c.nome}</option>`).join('')}</select>
                    </div>
                    <div class="full"><label>Material</label><input id="p-mat"></div>
                    <div><label>Qtd</label><input id="p-qtd" type="number"></div>
                    <div><label>Vlr Unit.</label><input id="p-vlr" type="number" step="0.01"></div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">GERAR PEDIDO E PDF</button>
                </div>`;
        }
    }
};

// (Funções de salvar permanecem iguais ao código anterior)
