const FIREBASE_URL = "COLE_AQUI_SEU_LINK_DO_FIREBASE"; 

const auth = {
    login: () => {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if(u === 'admin' && p === '123') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            ui.render('dashboard');
        } else { alert("Acesso Negado!"); }
    },
    logout: () => location.reload()
};

const db = {
    list: async (folder) => {
        try {
            const res = await fetch(`${FIREBASE_URL}/${folder}.json`);
            const data = await res.json();
            return data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
        } catch (e) { 
            console.log("Erro ao conectar com Firebase. Mostrando formulário local.");
            return []; 
        }
    },
    save: async (folder, data) => {
        try {
            await fetch(`${FIREBASE_URL}/${folder}.json`, { method: 'POST', body: JSON.stringify(data) });
        } catch (e) { alert("Erro ao salvar! Verifique a conexão."); }
    }
};

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = `<h1>Carregando...</h1>`;

        if(section === 'dashboard') {
            const peds = await db.list('pedidos');
            const total = peds.reduce((a, b) => a + parseFloat(b.total || 0), 0);
            area.innerHTML = `<h1>📊 Painel Geral</h1>
                <div class="grid-form">
                    <div class="card"><h3>Faturamento Bruto</h3><h2 style="color:var(--primary)">R$ ${total.toFixed(2)}</h2></div>
                    <div class="card"><h3>Vendas</h3><h2>${peds.length}</h2></div>
                </div>`;
        }

        if(section === 'clientes') {
            const lista = await db.list('clientes');
            area.innerHTML = `<h1>👥 Clientes</h1>
                <div class="card grid-form">
                    <div class="full"><label>Nome</label><input id="c-nome"></div>
                    <div><label>CNPJ/CPF</label><input id="c-doc"></div>
                    <div><label>Cidade</label><input id="c-cid"></div>
                    <button onclick="actions.saveCli()" class="full" style="background:var(--primary); color:white; padding:12px; border:none; border-radius:8px; cursor:pointer;">CADASTRAR</button>
                </div>
                <div class="card">
                    <table><thead><tr><th>Nome</th><th>Cidade</th></tr></thead>
                    <tbody>${lista.map(c => `<tr><td>${c.nome}</td><td>${c.cid}</td></tr>`).join('')}</tbody></table>
                </div>`;
        }

        if(section === 'pedidos') {
            const clis = await db.list('clientes');
            const peds = await db.list('pedidos');
            area.innerHTML = `<h1>🛒 Pedidos</h1>
                <div class="card grid-form">
                    <div><label>Nº Pedido</label><input id="ped-num"></div>
                    <div><label>Data</label><input id="ped-data" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
                    <div class="full"><label>Cliente</label><select id="ped-cli"><option value="">Selecione...</option>${clis.map(c => `<option>${c.nome}</option>`).join('')}</select></div>
                    <div class="full"><label>Material</label><input id="ped-mat"></div>
                    <div><label>Qtd</label><input id="ped-qtd" type="number"></div>
                    <div><label>Valor Unit.</label><input id="ped-vlr" type="number" step="0.01"></div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer;">SALVAR E GERAR PDF</button>
                </div>
                <div class="card">
                    <table><thead><tr><th>Nº</th><th>Cliente</th><th>Total</th><th>Ação</th></tr></thead>
                    <tbody>${peds.map(p => `<tr><td>#${p.numero}</td><td>${p.cliente}</td><td>R$ ${p.total}</td><td><button onclick='actions.pdf(${JSON.stringify(p)})'>PDF</button></td></tr>`).join('')}</tbody></table>
                </div>`;
        }
    }
};

const actions = {
    saveCli: async () => {
        const data = { nome: document.getElementById('c-nome').value, doc: document.getElementById('c-doc').value, cid: document.getElementById('c-cid').value };
        await db.save('clientes', data); ui.render('clientes');
    },
    savePed: async () => {
        const q = document.getElementById('ped-qtd').value;
        const v = document.getElementById('ped-vlr').value;
        const data = {
            numero: document.getElementById('ped-num').value,
            cliente: document.getElementById('ped-cli').value,
            material: document.getElementById('ped-mat').value,
            qtd: q, unit: v, total: (q * v).toFixed(2),
            data: document.getElementById('ped-data').value
        };
        await db.save('pedidos', data); ui.render('pedidos');
    },
    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho conforme sua imagem
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 15, { align: "center" });
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 20, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33", 105, 25, { align: "center" });
        doc.setDrawColor(139, 0, 0); doc.line(10, 35, 200, 35);

        doc.setFontSize(12); doc.text(`PEDIDO Nº: ${p.numero}`, 10, 45);
        doc.autoTable({
            startY: 55,
            head: [['Material', 'Qtd', 'Unit.', 'Total']],
            body: [[p.material, p.qtd, p.unit, p.total]],
            headStyles: { fillGray: [139, 0, 0] }
        });
        doc.save(`Pedido_${p.numero}.pdf`);
    }
};
