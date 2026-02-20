const FIREBASE_URL = "SEU_LINK_DO_FIREBASE_AQUI"; 

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        area.innerHTML = `<div class="card">Carregando ${section}...</div>`;

        if(section === 'dashboard') {
            const peds = await db.list('pedidos');
            const total = peds.reduce((a, b) => a + parseFloat(b.total || 0), 0);
            area.innerHTML = `
                <h1>📊 Painel Geral</h1>
                <div class="grid-form">
                    <div class="card" style="border-left: 6px solid var(--primary)">
                        <h3>Faturamento Bruto</h3>
                        <h2>R$ ${total.toFixed(2)}</h2>
                    </div>
                    <div class="card">
                        <h3>Total de Vendas</h3>
                        <h2>${peds.length}</h2>
                    </div>
                </div>`;
        }
        // ... (as outras seções de clientes e pedidos seguem a mesma lógica)
    }
};

const actions = {
    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- CABEÇALHO CONFORME SUA IMAGEM ---
        doc.addImage("LogoBB.png", 'PNG', 10, 10, 45, 28); // Logo à esquerda
        doc.addImage("Logopermatti.png", 'PNG', 165, 12, 35, 15); // Logo à direita

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 15, { align: "center" });
        
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 20, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33 - INSC. EST.: 558.178.702.116", 105, 25, { align: "center" });
        doc.text("Telefones: (13) 3481-4504 // (13) 97414-2188", 105, 30, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.text("SIGA-NOS NAS REDES SOCIAIS: @bbforros | bb forros e divisórias", 105, 37, { align: "center" });

        // Linha Divisória em Vermelho
        doc.setDrawColor(139, 0, 0); doc.setLineWidth(0.5);
        doc.line(10, 42, 200, 42); 

        // Informações do Pedido
        doc.setFontSize(12); doc.setTextColor(139, 0, 0);
        doc.text(`PEDIDO Nº: ${p.numero}`, 10, 50);
        doc.setTextColor(0,0,0); doc.setFontSize(10);
        doc.text(`Data: ${p.data}`, 160, 50);
        doc.text(`Cliente: ${p.cliente}`, 10, 56);

        // Tabela de Itens
        doc.autoTable({
            startY: 62,
            head: [['Descrição', 'Qtd', 'Vlr Unit.', 'Total']],
            body: [[p.material, p.qtd, `R$ ${p.unit}`, `R$ ${p.total}`]],
            headStyles: { fillGray: [139, 0, 0] }
        });

        doc.save(`Pedido_BB_${p.numero}.pdf`);
    }
};
