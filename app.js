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

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = `<div class="card">Carregando ${section}...</div>`;

        if(section === 'dashboard') {
            const peds = await crud.list('pedidos');
            const total = peds.reduce((a, b) => a + parseFloat(b.total), 0);
            area.innerHTML = `
                <h1 style="margin-bottom:20px; color:var(--primary)">📊 Painel de Controle</h1>
                <div class="grid-form">
                    <div class="card" style="border-left: 5px solid var(--primary)"><h3>Faturamento Total</h3><h2 style="color:var(--primary)">R$ ${total.toFixed(2)}</h2></div>
                    <div class="card" style="border-left: 5px solid #333"><h3>Pedidos Realizados</h3><h2>${peds.length}</h2></div>
                </div>`;
        }

        if(section === 'clientes') {
            const lista = await crud.list('clientes');
            area.innerHTML = `
                <h1 style="color:var(--primary)">👥 Cadastro de Clientes</h1>
                <div class="card grid-form">
                    <div class="full"><label>Nome / Razão Social</label><input id="c-nome"></div>
                    <div><label>CPF / CNPJ</label><input id="c-doc"></div>
                    <div><label>RG / Insc. Estadual</label><input id="c-rg"></div>
                    <div><label>Celular / WhatsApp</label><input id="c-cel"></div>
                    <div><label>Contato Alternativo</label><input id="c-cont"></div>
                    <div><label>CEP</label><input id="c-cep"></div>
                    <div><label>Endereço</label><input id="c-end"></div>
                    <div><label>Bairro</label><input id="c-bai"></div>
                    <div><label>Cidade / UF</label><input id="c-cid"></div>
                    <div class="full"><label>Forma de Pagamento</label>
                        <select id="c-pag"><option>Boleto</option><option>PIX</option><option>Cartão</option><option>Dinheiro</option></select>
                    </div>
                    <div class="full"><label>Observações</label><textarea id="c-obs" rows="2"></textarea></div>
                    <button onclick="actions.saveCli()" class="full" style="background:var(--primary); color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SALVAR CLIENTE</button>
                </div>
                <table><thead><tr><th>Cliente</th><th>Cidade</th><th>Ações</th></tr></thead>
                <tbody>${lista.reverse().map(c => `<tr><td>${c.nome}</td><td>${c.cid}</td><td><button onclick="actions.excluir('clientes', ${c.id})" style="color:var(--primary); background:none; border:none; cursor:pointer;">Excluir</button></td></tr>`).join('')}</tbody></table>`;
        }

        if(section === 'produtos') {
            const lista = await crud.list('produtos');
            area.innerHTML = `
                <h1 style="color:var(--primary)">📦 Estoque</h1>
                <div class="card grid-form">
                    <div class="full"><label>Descrição do Material</label><input id="p-nome"></div>
                    <div><label>Preço Unitário (R$)</label><input id="p-preco" type="number"></div>
                    <div><label>Saldo Inicial</label><input id="p-qtd" type="number"></div>
                    <button onclick="actions.saveProd()" class="full" style="background:var(--primary); color:white; padding:15px; border:none; border-radius:8px; cursor:pointer;">ADICIONAR MATERIAL</button>
                </div>
                <table><thead><tr><th>Material</th><th>Preço</th><th>Saldo</th></tr></thead>
                <tbody>${lista.map(p => `<tr><td>${p.nome}</td><td>R$ ${p.preco}</td><td><b>${p.qtd} un</b></td></tr>`).join('')}</tbody></table>`;
        }

        if(section === 'pedidos') {
            const clis = await crud.list('clientes');
            const prods = await crud.list('produtos');
            const peds = await crud.list('pedidos');
            area.innerHTML = `
                <h1 style="color:var(--primary)">🛒 Novo Pedido</h1>
                <div class="card grid-form">
                    <div class="full"><label>Cliente</label><select id="ped-cli"><option value="">Selecione...</option>${clis.map(c => `<option>${c.nome}</option>`).join('')}</select></div>
                    <div class="full"><label>Produto</label><select id="ped-prod"><option value="">Selecione...</option>${prods.map(p => `<option value="${p.id}">${p.nome} (Estoque: ${p.qtd})</option>`).join('')}</select></div>
                    <div class="full"><label>Quantidade</label><input id="ped-qtd" type="number" value="1"></div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">FINALIZAR PEDIDO</button>
                </div>
                <table><thead><tr><th>Data</th><th>Cliente</th><th>Total</th><th>Ações</th></tr></thead>
                <tbody>${peds.reverse().map(p => `<tr><td>${p.data}</td><td>${p.cliente}</td><td>R$ ${p.total}</td><td><button onclick='actions.pdf(${JSON.stringify(p)})' style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">GERAR PDF</button></td></tr>`).join('')}</tbody></table>`;
        }

        if(section === 'financeiro') {
            const peds = await crud.list('pedidos');
            const total = peds.reduce((a, b) => a + parseFloat(b.total), 0);
            area.innerHTML = `<h1 style="color:var(--primary)">💰 Financeiro</h1><div class="card"><h3>Contas a Receber Total</h3><h2 style="color:var(--primary)">R$ ${total.toFixed(2)}</h2></div>`;
        }
    }
};

const actions = {
    saveCli: async () => {
        const data = {
            nome: document.getElementById('c-nome').value, doc: document.getElementById('c-doc').value,
            rg: document.getElementById('c-rg').value, cel: document.getElementById('c-cel').value,
            cont: document.getElementById('c-cont').value, cep: document.getElementById('c-cep').value,
            end: document.getElementById('c-end').value, bai: document.getElementById('c-bai').value,
            cid: document.getElementById('c-cid').value, pag: document.getElementById('c-pag').value,
            obs: document.getElementById('c-obs').value
        };
        if(data.nome) { await crud.add('clientes', data); ui.render('clientes'); }
    },
    saveProd: async () => {
        const data = { nome: document.getElementById('p-nome').value, preco: document.getElementById('p-preco').value, qtd: parseInt(document.getElementById('p-qtd').value) };
        if(data.nome) { await crud.add('produtos', data); ui.render('produtos'); }
    },
    savePed: async () => {
        const pId = parseInt(document.getElementById('ped-prod').value);
        const qtdPed = parseInt(document.getElementById('ped-qtd').value);
        const cli = document.getElementById('ped-cli').value;
        const prods = await crud.list('produtos');
        const p = prods.find(x => x.id === pId);

        if(p && p.qtd >= qtdPed && cli) {
            p.qtd -= qtdPed;
            await crud.update('produtos', p);
            const pedido = { cliente: cli, total: (p.preco * qtdPed).toFixed(2), data: new Date().toLocaleDateString(), item: p.nome, qtd: qtdPed, unit: p.preco };
            await crud.add('pedidos', pedido);
            ui.render('pedidos');
        } else { alert("Erro: Verifique estoque ou cliente."); }
    },
    excluir: async (store, id) => { if(confirm("Remover permanentemente?")) { await crud.del(store, id); ui.render(store); } },
    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.addImage("LogoBB.png", 'PNG', 15, 10, 30, 18);
        doc.addImage("Logopermatti.png", 'PNG', 160, 12, 35, 12);

        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.setTextColor(139, 0, 0); // Cor Vermelho Escuro no PDF
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 15, { align: "center" });
        
        doc.setTextColor(0, 0, 0); doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 20, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33 | (13) 3481-4504 | (13) 97414-2188", 105, 24, { align: "center" });
        doc.text("REDES SOCIAIS: @bbforros | bb forros e divisórias", 105, 28, { align: "center" });

        doc.autoTable({
            startY: 40,
            head: [['Descrição do Material', 'Qtd', 'Vlr. Unit', 'Total']],
            body: [[p.item, p.qtd, `R$ ${p.unit}`, `R$ ${p.total}`]],
            theme: 'striped',
            headStyles: { fillGray: [139, 0, 0] } // Cabeçalho da tabela em Vermelho Escuro
        });

        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL DO PEDIDO: R$ ${p.total}`, 195, doc.lastAutoTable.finalY + 10, { align: 'right' });
        doc.save(`Pedido_BB_${p.cliente}.pdf`);
    }
};