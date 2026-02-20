const FIREBASE_URL = "COLE_AQUI_O_LINK_DO_SEU_FIREBASE"; 

const auth = {
    login: () => {
        const u = document.getElementById('user').value.trim();
        const p = document.getElementById('pass').value.trim();
        
        // Login padrão: admin / 123
        if(u === 'admin' && p === '123') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            ui.render('dashboard');
        } else { 
            alert("Usuário ou Senha incorretos!"); 
        }
    },
    logout: () => location.reload()
};

const db = {
    save: async (folder, data) => {
        try {
            await fetch(`${FIREBASE_URL}/${folder}.json`, { method: 'POST', body: JSON.stringify(data) });
        } catch (e) { console.error(e); }
    },
    list: async (folder) => {
        try {
            const res = await fetch(`${FIREBASE_URL}/${folder}.json`);
            const data = await res.json();
            return data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
        } catch (e) { return []; }
    },
    del: async (folder, id) => {
        await fetch(`${FIREBASE_URL}/${folder}/${id}.json`, { method: 'DELETE' });
    }
};

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = `<div class="card">Carregando...</div>`;

        if(section === 'dashboard') {
            const peds = await db.list('pedidos');
            const total = peds.reduce((a, b) => a + parseFloat(b.total || 0), 0);
            area.innerHTML = `
                <h1 style="color:#8b0000">📊 Painel Geral</h1>
                <div class="grid-form">
                    <div class="card" style="border-left: 5px solid #8b0000">
                        <h3>Faturamento Bruto</h3>
                        <h2 style="color:#8b0000">R$ ${total.toFixed(2)}</h2>
                    </div>
                    <div class="card"><h3>Vendas</h3><h2>${peds.length}</h2></div>
                </div>`;
        }

        if(section === 'clientes') {
            const lista = await db.list('clientes');
            area.innerHTML = `
                <h1 style="color:#8b0000">👥 Clientes</h1>
                <div class="card grid-form">
                    <div class="full"><label>Nome</label><input id="c-nome"></div>
                    <div><label>CNPJ/CPF</label><input id="c-doc"></div>
                    <div><label>Cidade</label><input id="c-cid"></div>
                    <button onclick="actions.saveCli()" class="full" style="background:#8b0000; color:white; padding:12px; border:none; border-radius:8px; cursor:pointer;">CADASTRAR</button>
                </div>
                <table>
                    <thead><tr><th>Nome</th><th>Cidade</th><th>Ação</th></tr></thead>
                    <tbody>${lista.reverse().map(c => `<tr><td>${c.nome}</td><td>${c.cid}</td><td><button onclick="actions.excluir('clientes','${c.id}')">Excluir</button></td></tr>`).join('')}</tbody>
                </table>`;
        }

        if(section === 'pedidos') {
            const clis = await db.list('clientes');
            const peds = await db.list('pedidos');
            area.innerHTML = `
                <h1 style="color:#8b0000">🛒 Novo Pedido</h1>
                <div class="card grid-form">
                    <div><label>Nº Pedido</label><input id="ped-num"></div>
                    <div><label>Data</label><input id="ped-data" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
                    <div class="full"><label>Cliente</label><select id="ped-cli"><option value="">Selecione...</option>${clis.map(c => `<option>${c.nome}</option>`).join('')}</select></div>
                    <div class="full"><label>Material</label><input id="ped-mat"></div>
                    <div><label>Qtd</label><input id="ped-qtd" type="number"></div>
                    <div><label>Vlr Unit.</label><input id="ped-vlr" type="number" step="0.01"></div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SALVAR E GERAR PDF</button>
                </div>
                <table>
                    <thead><tr><th>Nº</th><th>Cliente</th><th>Total</th><th>Ações</th></tr></thead>
                    <tbody>${peds.reverse().map(p => `<tr><td><b>#${p.numero}</b></td><td>${p.cliente}</td><td>R$ ${p.total}</td><td><button onclick='actions.pdf(${JSON.stringify(p)})' style="background:#8b0000; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">PDF</button></td></tr>`).join('')}</tbody>
                </table>`;
        }
    }
};

const actions = {
    saveCli: async () => {
        const nome = document.getElementById('c-nome').value;
        const cid = document.getElementById('c-cid').value;
        const doc = document.getElementById('c-doc').value;
        if(nome) { await db.save('clientes', { nome, cid, doc }); ui.render('clientes'); }
    },
    savePed: async () => {
        const num = document.getElementById('ped-num').value;
        const cli = document.getElementById('ped-cli').value;
        const q = document.getElementById('ped-qtd').value;
        const v = document.getElementById('ped-vlr').value;
        if(!num || !cli) return alert("Preencha Nº Pedido e Cliente!");
        
        const data = {
            numero: num, cliente: cli, material: document.getElementById('ped-mat').value,
            qtd: q, unit: v, total: (q * v).toFixed(2),
            data: document.getElementById('ped-data').value
        };
        await db.save('pedidos', data); ui.render('pedidos');
    },
    excluir: async (f, id) => { if(confirm("Excluir?")) { await db.del(f, id); ui.render(f); } },
    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho conforme a imagem enviada
        try {
            doc.addImage("LogoBB.png", 'PNG', 10, 8, 40, 25); 
            doc.addImage("Logopermatti.png", 'PNG', 160, 12, 35, 12);
        } catch(e) {}

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 14, { align: "center" });
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 19, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33 - INSC. EST.: 558.178.702.116", 105, 24, { align: "center" });
        doc.text("Telefones: (13) 3481-4504 // (13) 97414-2188", 105, 29, { align: "center" });
        doc.text("SIGA-NOS NAS REDES SOCIAIS: @bbforros | bb forros e divisórias", 105, 36, { align: "center" });

        doc.setDrawColor(139, 0
