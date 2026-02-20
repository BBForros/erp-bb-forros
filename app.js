const FIREBASE_URL = "SUA_URL_DO_FIREBASE_AQUI"; // Não esqueça de colocar seu link!

const ui = {
    render: async (section) => {
        const area = document.getElementById('view-content');
        // ... (resto da lógica de renderização)
    }
};

const actions = {
    pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- CABEÇALHO IDÊNTICO À IMAGEM ENVIADA ---
        doc.addImage("LogoBB.png", 'PNG', 10, 10, 40, 25); // Logo BB + ISO
        doc.addImage("Logopermatti.png", 'PNG', 160, 15, 35, 12); // Logo Permatti

        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 15, { align: "center" });
        
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 21, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33 - INSC. EST.: 558.178.702.116", 105, 26, { align: "center" });
        doc.text("Telefones: (13) 3481-4504 // (13) 97414-2188", 105, 31, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.text("SIGA-NOS NAS REDES SOCIAIS: @bbforros | bb forros e divisórias", 105, 38, { align: "center" });

        // Linha de fechamento do cabeçalho
        doc.setDrawColor(139, 0, 0); 
        doc.line(10, 42, 200, 42); 

        // Tabela de Itens
        doc.autoTable({
            startY: 48,
            head: [['Descrição', 'Qtd', 'Unitário', 'Total']],
            body: [[p.material, p.qtd, `R$ ${p.unit}`, `R$ ${p.total}`]],
            headStyles: { fillGray: [139, 0, 0] } // Vermelho Escuro
        });

        doc.save(`Pedido_BB_${p.cliente}.pdf`);
    }
};
