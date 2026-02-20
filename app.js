const FIREBASE_URL = "LINK_DO_SEU_FIREBASE"; 

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = `<div class="card">Carregando...</div>`;

        if(section === 'pedidos') {
            const clis = await db.list('clientes');
            const peds = await db.list('pedidos');
            area.innerHTML = `
                <h1>🛒 Novo Pedido de Venda</h1>
                <div class="card grid-form">
                    <div class="full">
                        <label>Nº do Pedido</label>
                        <input id="ped-num" type="text" placeholder="Ex: 1050">
                    </div>
                    <div class="full">
                        <label>Cliente</label>
                        <select id="ped-cli">
                            <option value="">Selecione o Cliente</option>
                            ${clis.map(c => `<option>${c.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="full">
                        <label>Material / Descrição</label>
                        <input id="ped-mat" placeholder="Ex: Forro PVC Gelo 6m">
                    </div>
                    <div>
                        <label>Quantidade</label>
                        <input id="ped-qtd" type="number">
                    </div>
                    <div>
                        <label>Valor Unitário (R$)</label>
                        <input id="ped-vlr" type="number" step="0.01">
                    </div>
                    <button onclick="actions.savePed()" class="full" style="background:#16a34a; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SALVAR PEDIDO</button>
                </div>
                
                <div class="card">
                    <h3>Histórico de Vendas</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${peds.reverse().map(p => `
                                <tr>
                                    <td><b>#${p.numero || 'N/A'}</b></td>
                                    <td>${p.data}</td>
                                    <td>${p.cliente}</td>
                                    <td>R$ ${p.total}</td>
                                    <td><button onclick='actions.pdf(${JSON.stringify(p)})' style="background:#8b0000; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">PDF</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
        // ... (outras seções permanecem as mesmas)
    }
};

const actions = {
    savePed: async () => {
        const num = document.getElementById('ped-num').value;
        const cli = document.getElementById('ped-cli').value;
        const mat = document.getElementById('ped-mat').value;
        const q = document.getElementById('ped-qtd').value;
        const v = document.getElementById('ped-vlr').value;

        if(!num || !cli) return alert("Número do pedido e Cliente são obrigatórios!");

        const data = {
            numero: num,
            cliente: cli,
            material: mat,
            qtd: q,
            unit: v,
            total: (q * v).toFixed(2),
            data: new Date().toLocaleDateString()
        };

        await db.save('pedidos', data);
        ui.render('pedidos');
    },

    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho Oficial
        doc.addImage("LogoBB.png", 'PNG', 10, 8, 45, 28); 
        doc.addImage("Logopermatti.png", 'PNG', 165, 12, 35, 15);

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 14, { align: "center" });
        
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 19, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33 - INSC. EST.: 558.178.702.116", 105, 24, { align: "center" });
        doc.text("Telefones: (13) 3481-4504 // (13) 97414-2188", 105, 29, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.text("SIGA-NOS NAS REDES SOCIAIS: @bbforros | bb forros e divisórias", 105, 36, { align: "center" });

        doc.setDrawColor(139, 0, 0); doc.setLineWidth(0.5);
        doc.line(10, 40, 200, 40);

        // Informação do Número do Pedido no PDF
        doc.setFontSize(12);
        doc.setTextColor(139, 0, 0);
        doc.text(`PEDIDO Nº: ${p.numero}`, 10, 48);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Data: ${p.data}`, 160, 48);
        doc.text(`Cliente: ${p.cliente}`, 10, 54);

        doc.autoTable({
            startY: 60,
            head: [['Descrição do Material', 'Qtd', 'Unitário', 'Total']],
            body: [[p.material, p.qtd, `R$ ${p.unit}`, `R$ ${p.total}`]],
            headStyles: { fillGray: [139, 0, 0] }
        });

        doc.text(`VALOR TOTAL: R$ ${p.total}`, 195, doc.lastAutoTable.finalY + 10, { align: 'right' });

        doc.save(`Pedido_${p.numero}_${p.cliente}.pdf`);
    }
};

