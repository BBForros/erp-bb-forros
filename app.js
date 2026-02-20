pdf: (p) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- CABEÇALHO ---
        doc.setFont("helvetica", "bold"); 
        doc.setFontSize(12);
        doc.text("BB COMERCIO DE FORROS E DIVISÓRIAS LTDA", 105, 15, { align: "center" });
        
        doc.setFontSize(9); 
        doc.setFont("helvetica", "normal");
        doc.text("R. João Pereira Inacio, 397 - Aviação - Praia Grande/SP", 105, 20, { align: "center" });
        doc.text("CNPJ: 05.510.861/0001-33", 105, 25, { align: "center" });
        
        doc.setDrawColor(139, 0, 0); 
        doc.setLineWidth(0.5);
        doc.line(10, 32, 200, 32); 

        // --- DADOS DO PEDIDO ---
        doc.setFontSize(11); 
        doc.setTextColor(139, 0, 0);
        doc.text(`PEDIDO Nº: ${p.numero}`, 10, 40);
        doc.setTextColor(0,0,0);
        doc.text(`Data do Pedido: ${p.data}`, 160, 40);
        doc.text(`Cliente: ${p.cliente}`, 10, 47);

        // --- TABELA DE PRODUTOS ---
        doc.autoTable({
            startY: 55,
            head: [['Descrição', 'Qtd', 'Unitário', 'Total']],
            body: [[p.material, p.qtd, `R$ ${p.unit}`, `R$ ${p.total}`]],
            headStyles: { fillColor: [139, 0, 0] },
            theme: 'striped'
        });

        // --- RODAPÉ COM ASSINATURAS (DATA E LOCAL) ---
        const finalY = doc.lastAutoTable.finalY + 30; // Define espaço após a tabela
        
        // Local e Data
        doc.setFontSize(10);
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.text(`Praia Grande, SP - ${dataAtual}`, 105, finalY, { align: "center" });

        // Linhas de Assinatura
        const linhaY = finalY + 25;
        
        // Empresa (Esquerda)
        doc.line(20, linhaY, 90, linhaY); 
        doc.text("ASSINATURA EMPRESA", 55, linhaY + 5, { align: "center" });

        // Cliente (Direita)
        doc.line(120, linhaY, 190, linhaY);
        doc.text("ASSINATURA CLIENTE", 155, linhaY + 5, { align: "center" });

        // Salvar o arquivo
        doc.save(`Pedido_${p.numero}_${p.cliente}.pdf`);
    }
