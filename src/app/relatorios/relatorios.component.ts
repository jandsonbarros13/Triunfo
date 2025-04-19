import { Component, HostListener, OnInit } from '@angular/core';
import { RelatoriosService } from 'src/services/relatorios.service';
import { UserService } from 'src/services/user.service';
import jsPDF from 'jspdf';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent implements OnInit {
  selectedUser: string = '';
  startDate: string = '';
  endDate: string = '';
  reports: any[] = [];
  filteredReports: any[] = [];
  displayedReports: any[] = [];
  users: any[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  filteredUser: any;
  isSmallScreen: boolean = false;

  expandedImageUrl: string = '';
  isImageExpanded: boolean = false;

  constructor(
    private relatoriosService: RelatoriosService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.setDefaultDates();
    this.fetchReports();
    this.checkScreenSize();
  }

  fetchReports() {
    this.relatoriosService.obterRelatorios().subscribe({
      next: (data) => {
        console.log('Dados recebidos do servidor:', data);
        this.reports = data.map(report => {
          return {
            ...report,
            fotoUrl: `${environment.apiUrl}${report.fotoUrl}`
          };
        });
        this.filteredReports = this.reports;
        this.applyFilter();
        this.loadMoreReports();
      },
      error: (error) => {
        console.error('Erro ao buscar relatórios:', error);
        this.showAlert('Erro', 'Erro ao buscar relatórios. Tente novamente.');
      }
    });
  }

  loadUsers() {
    this.userService.listarUsuarios().subscribe({
      next: (data) => {
        this.users = data;
        if (this.users.length > 0) {
          this.selectedUser = this.users[0].nome;
          this.applyFilter();
          this.loadMoreReports();
        }
        console.log('Usuários carregados:', this.users);
      },
      error: (error) => {
        console.error('Erro ao buscar usuários:', error);
        this.showAlert('Erro', 'Erro ao buscar usuários. Tente novamente.');
      }
    });
  }

  totalPages(): number {
    return Math.ceil(this.filteredReports.length / this.pageSize);
  }

  setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.endDate = lastDayOfMonth.toISOString().split('T')[0];
  }

  applyFilter() {
    console.log('Usuário selecionado:', this.selectedUser);
    console.log('Data de início:', this.startDate);
    console.log('Data de fim:', this.endDate);

    this.filteredReports = this.reports.filter(report => {
      console.log('Data do relatório:', report.data);
      console.log('Relatório atual:', report);

      const matchesUser = this.selectedUser === 'Todos' ? true : report.nome === this.selectedUser;

      const reportDateParts = report.data.split('/');
      const reportDate = new Date(+reportDateParts[2], reportDateParts[1] - 1, +reportDateParts[0]);

      const isValidDate = !isNaN(reportDate.getTime());
      console.log('Data válida:', isValidDate);

      if (!isValidDate) return false;

      const formattedReportDate = reportDate.toISOString().split('T')[0];
      const matchesStartDate = this.startDate ? formattedReportDate >= this.startDate : true;
      const matchesEndDate = this.endDate ? formattedReportDate <= this.endDate : true;

      const isVisible = matchesUser && matchesStartDate && matchesEndDate;
      console.log('Visível:', isVisible);

      return isVisible;
    });

    console.log('Relatórios filtrados:', this.filteredReports);
    this.currentPage = 0;
    this.loadMoreReports();
    this.filteredUser = this.users.find(user => user.nome === this.selectedUser);
  }

  loadMoreReports() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayedReports = this.filteredReports.slice(start, end);
    console.log('Relatórios exibidos:', this.displayedReports);
  }

  calculateHours() {
    let totalHorasDevedorasEmMinutos = 0;
    let totalHorasExtrasEmMinutos = 0;
    let totalHorasTrabalhadasEmMinutos = 0;
  
    this.displayedReports.forEach((report) => {
      const usuario = this.users.find(user => user.nome === report.nome);
  
      if (usuario && report.horarioEntrada && report.horarioSaida) {
        const entradaBatidaEmMinutos = this.parseTime(report.horarioEntrada);
        const saidaBatidaEmMinutos = this.parseTime(report.horarioSaida);
        const entradaCadastradaEmMinutos = this.parseTime(usuario.horarioEntrada);
        const saidaCadastradaEmMinutos = this.parseTime(usuario.horarioSaida);
  
        const tempoTrabalhadoBrutoEmMinutos = saidaBatidaEmMinutos - entradaBatidaEmMinutos;
        const tempoTrabalhadoLiquidoEmMinutos = tempoTrabalhadoBrutoEmMinutos > 0 ? tempoTrabalhadoBrutoEmMinutos - 60 : 0;
  
        const jornadaDiariaEmMinutos = this.calcularJornadaDiaria(report.data) * 60;
        const jornadaLiquidaEsperada = Math.max(0, jornadaDiariaEmMinutos - 60);
  
        // Cálculo de horas devedoras (mantendo a lógica existente)
        if (tempoTrabalhadoBrutoEmMinutos > 0) {
          const faltaMinutos = jornadaLiquidaEsperada - tempoTrabalhadoLiquidoEmMinutos;
          if (faltaMinutos > 0) {
            totalHorasDevedorasEmMinutos += faltaMinutos;
          }
        } else if (this.selectedUser !== 'Todos') {
          totalHorasDevedorasEmMinutos += jornadaLiquidaEsperada;
        }
  
        // Cálculo de horas extras (LÓGICA REFINADA E ISOLADA)
        let excessoEmMinutos = 0;
        if (entradaBatidaEmMinutos < entradaCadastradaEmMinutos) {
          excessoEmMinutos += entradaCadastradaEmMinutos - entradaBatidaEmMinutos;
        }
        if (saidaBatidaEmMinutos > saidaCadastradaEmMinutos) {
          excessoEmMinutos += saidaBatidaEmMinutos - saidaCadastradaEmMinutos;
        }
  
        totalHorasExtrasEmMinutos += excessoEmMinutos;
  
        totalHorasTrabalhadasEmMinutos += tempoTrabalhadoBrutoEmMinutos > 0 ? tempoTrabalhadoBrutoEmMinutos : 0;
  
        console.log(`Relatório de ${report.nome} em ${report.data}:`);
        console.log(`  Entrada Batida: ${report.horarioEntrada} (${entradaBatidaEmMinutos} min)`);
        console.log(`  Saída Batida: ${report.horarioSaida} (${saidaBatidaEmMinutos} min)`);
        console.log(`  Entrada Cadastrada: ${usuario.horarioEntrada} (${entradaCadastradaEmMinutos} min)`);
        console.log(`  Saída Cadastrada: ${usuario.horarioSaida} (${saidaCadastradaEmMinutos} min)`);
        console.log(`  Trabalhado Bruto: ${tempoTrabalhadoBrutoEmMinutos} min`);
        console.log(`  Trabalhado Líquido: ${tempoTrabalhadoLiquidoEmMinutos} min`);
        console.log(`  Jornada Líquida Esperada: ${jornadaLiquidaEsperada} min`);
        console.log(`  Total Devedoras (acumulado): ${totalHorasDevedorasEmMinutos} min`);
        console.log(`  Excesso (neste relatório): ${excessoEmMinutos} min`);
        console.log(`  Total Extras (acumulado): ${totalHorasExtrasEmMinutos} min`);
        console.log(`  Total Trabalhadas (acumulado): ${totalHorasTrabalhadasEmMinutos} min`);
  
      } else if (this.selectedUser !== 'Todos') {
        const jornadaDiariaEmMinutos = this.calcularJornadaDiaria(report.data) * 60;
        totalHorasDevedorasEmMinutos += jornadaDiariaEmMinutos - 60;
        console.log(`Usuário sem registro (${this.selectedUser} em ${report.data}): Total Devedoras (acumulado): ${totalHorasDevedorasEmMinutos} min`);
      }
    });
  
    return {
      horasDevedoras: this.formatTime(totalHorasDevedorasEmMinutos),
      horasExtras: this.formatTime(totalHorasExtrasEmMinutos),
      diferencial: this.formatTime(totalHorasExtrasEmMinutos - totalHorasDevedorasEmMinutos),
      horasTrabalhadas: this.formatTime(totalHorasTrabalhadasEmMinutos),
    };
  }

  calcularJornadaDiaria(data: string): number {
    const dataRelatorio = new Date(data.split('/').reverse().join('-'));
    return dataRelatorio.getDay() === 5 ? 8 : 9;
  }

  calcularHorasDevedoras(entradaBatida: number, entradaCadastrada: number, saidaBatida: number, saidaCadastrada: number, horasTrabalhadasBatidas: number): number {
    const atrasoEntrada = entradaBatida - entradaCadastrada;
    const saidaAntecipada = saidaCadastrada - saidaBatida;

    let totalDevedoras = 0;

    if (atrasoEntrada > 10) {
      totalDevedoras += atrasoEntrada;
    }

    if (saidaAntecipada > 10) {
      totalDevedoras += saidaAntecipada;
    }

    if (horasTrabalhadasBatidas > 0) {
      totalDevedoras -= 60;
    }

    return -totalDevedoras;
  }

  calcularHorasExtras(saidaBatida: number, saidaCadastrada: number, horasTrabalhadasBatidas: number): number {
    const extraAposSaida = saidaBatida - saidaCadastrada;

    if (horasTrabalhadasBatidas > 0) {
      if (extraAposSaida > 10) {
        return extraAposSaida - 60;
      }
    }

    return extraAposSaida > 10 ? extraAposSaida : 0;
  }
// Nova função para calcular o diferencial individual de cada relatório
calculateIndividualHours(report: any): { diferencial: string } {
  const usuario = this.users.find(user => user.nome === report.nome);
  if (usuario && report.horarioEntrada && report.horarioSaida) {
    const entradaBatidaEmMinutos = this.parseTime(report.horarioEntrada);
    const saidaBatidaEmMinutos = this.parseTime(report.horarioSaida);
    const entradaCadastradaEmMinutos = this.parseTime(usuario.horarioEntrada);
    const saidaCadastradaEmMinutos = this.parseTime(usuario.horarioSaida);

    const tempoTrabalhadoBrutoEmMinutos = saidaBatidaEmMinutos - entradaBatidaEmMinutos;
    const tempoTrabalhadoLiquidoEmMinutos = tempoTrabalhadoBrutoEmMinutos > 0 ? tempoTrabalhadoBrutoEmMinutos - 60 : 0;

    const jornadaDiariaEmMinutos = this.calcularJornadaDiaria(report.data) * 60;
    const jornadaLiquidaEsperada = Math.max(0, jornadaDiariaEmMinutos - 60);

    const diferencaEmMinutos = tempoTrabalhadoLiquidoEmMinutos - jornadaLiquidaEsperada;
    return { diferencial: this.formatTime(diferencaEmMinutos) };
  } else {
    return { diferencial: 'N/A' };
  }
}

generatePDF() {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const logoUrl = `http://localhost:4200/assets/TRIUNFO%20LOGO%20ALPHA.png`;
  const logoImg = new Image();
  logoImg.onload = () => {
    doc.addImage(logoImg, 'JPEG', 10, 10, 50, 20);
    doc.setFontSize(16);
    doc.text('Relatórios', 10, 35);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    let currentY = 50;
    const spacingY = 20;
    const startX = 10;
    const columnSpacing = 40; // Aumentei o espaçamento para testar
    const titleHeight = 5;
    const titleBoxPadding = 2;
    const titleFontSize = 10;

    const titleBoxY = currentY - titleHeight - titleBoxPadding;
    const titleBoxWidth = startX + columnSpacing * 5; // Ajustei a largura para 5 colunas
    const titleBoxColor = '#007bff';
    const textColor = '#ffffff';

    doc.setFillColor(titleBoxColor);
    doc.rect(startX - titleBoxPadding, titleBoxY, titleBoxWidth + 2 * titleBoxPadding, titleHeight + 2 * titleBoxPadding, 'F');

    doc.setFontSize(titleFontSize);
    doc.setTextColor(textColor);

    const titleYText = titleBoxY + titleHeight / 2 + titleFontSize / 2 - 1;

    doc.text('Foto', startX, titleYText);
    doc.text('Nome', startX + columnSpacing, titleYText);
    doc.text('Data', startX + columnSpacing * 2, titleYText);
    doc.text('Entrada', startX + columnSpacing * 3, titleYText);
    doc.text('Saída', startX + columnSpacing * 4, titleYText);
    // Adicionando o cabeçalho da coluna "Dif."
    doc.text('Dif.', startX + columnSpacing * 5, titleYText);

    currentY += spacingY;
    doc.setFontSize(12);
    doc.setTextColor('#000000');

    const drawRow = (report: any) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = report.fotoUrl;
        img.onload = () => {
          const { diferencial } = this.calculateIndividualHours(report);
          console.log('Diferencial para', report.nome, 'em', report.data, ':', diferencial); // LOG
          console.log('Valor de diferencial ANTES de adicionar ao PDF:', diferencial, typeof diferencial); // LOG
          doc.line(startX, currentY - 2, startX + columnSpacing * 6, currentY - 2); // Ajustei o final da linha
          doc.addImage(img, 'JPEG', startX, currentY, 15, 15);
          doc.text(report.nome, startX + columnSpacing, currentY + 10);
          doc.text(report.data, startX + columnSpacing * 2, currentY + 10);
          doc.text(report.horarioEntrada, startX + columnSpacing * 3, currentY + 10);
          doc.text(report.horarioSaida, startX + columnSpacing * 4, currentY + 10);
          // Adicionando o valor do diferencial na coluna "Dif."
          doc.text(diferencial, startX + columnSpacing * 5, currentY + 10);
          doc.line(startX, currentY + 18, startX + columnSpacing * 6, currentY + 18); // Ajustei o final da linha
          currentY += spacingY;
          if (currentY > doc.internal.pageSize.height - 30) {
            doc.addPage();
            currentY = 10;
            doc.setFillColor(titleBoxColor);
            doc.rect(startX - titleBoxPadding, currentY - titleHeight - titleBoxPadding, titleBoxWidth + 2 * titleBoxPadding, titleHeight + 2 * titleBoxPadding, 'F');
            doc.setFontSize(titleFontSize);
            doc.setTextColor(textColor);
            doc.text('Foto', startX, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Nome', startX + columnSpacing, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Data', startX + columnSpacing * 2, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Entrada', startX + columnSpacing * 3, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Saída', startX + columnSpacing * 4, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Dif.', startX + columnSpacing * 5, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            currentY += spacingY;
          }
          resolve();
        };
        img.onerror = () => {
          const { diferencial } = this.calculateIndividualHours(report);
          console.log('Diferencial (erro img) para', report.nome, 'em', report.data, ':', diferencial); // LOG
          console.log('Valor de diferencial ANTES de adicionar ao PDF (erro img):', diferencial, typeof diferencial); // LOG
          doc.line(startX, currentY - 2, startX + columnSpacing * 6, currentY - 2); // Ajustei o final da linha
          doc.text('Imagem', startX, currentY + 10);
          doc.text(report.nome, startX + columnSpacing, currentY + 10);
          doc.text(report.data, startX + columnSpacing * 2, currentY + 10);
          doc.text(report.horarioEntrada, startX + columnSpacing * 3, currentY + 10);
          doc.text(report.horarioSaida, startX + columnSpacing * 4, currentY + 10);
          // Adicionando o valor do diferencial mesmo em caso de erro da imagem
          doc.text(diferencial, startX + columnSpacing * 5, currentY + 10);
          doc.line(startX, currentY + 18, startX + columnSpacing * 6, currentY + 18); // Ajustei o final da linha
          currentY += spacingY;
          if (currentY > doc.internal.pageSize.height - 30) {
            doc.addPage();
            currentY = 10;
            doc.setFillColor(titleBoxColor);
            doc.rect(startX - titleBoxPadding, currentY - titleHeight - titleBoxPadding, titleBoxWidth + 2 * titleBoxPadding, titleHeight + 2 * titleBoxPadding, 'F');
            doc.setFontSize(titleFontSize);
            doc.setTextColor(textColor);
            doc.text('Foto', startX, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Nome', startX + columnSpacing, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Data', startX + columnSpacing * 2, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Entrada', startX + columnSpacing * 3, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Saída', startX + columnSpacing * 4, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.text('Dif.', startX + columnSpacing * 5, currentY - titleHeight / 2 + titleFontSize / 2 - 1);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            currentY += spacingY;
          }
          resolve();
        };
      });
    };

    const drawPromises = this.filteredReports.map((report) => drawRow(report));
    Promise.all(drawPromises).then(() => {
      const { horasDevedoras, horasExtras, horasTrabalhadas } = this.calculateHours();
      const finalY = currentY + 10;
      doc.text(`Horas Devedoras: ${horasDevedoras}`, 10, finalY);
      doc.text(`Horas Extras: ${horasExtras}`, 10, finalY + 10);
      doc.text(`Horas Trabalhadas: ${horasTrabalhadas}`, 10, finalY + 20);
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    });
  };
  logoImg.src = logoUrl;
}


  calculateTotalHours() {
    let totalHoursDevedoras = 0;
    let totalHoursExtras = 0;

    const expectedStart = this.parseTime('07:00');
    const expectedEnd = this.parseTime('17:00');
    const expectedDailyHours = expectedEnd - expectedStart;
    const gracePeriod = 10;

    this.filteredReports.forEach(report => {
      const entrada = this.parseTime(report.horarioEntrada);
      const saida = this.parseTime(report.horarioSaida);

      const workedHours = saida - entrada;

      if (entrada > expectedStart) {
        totalHoursDevedoras += entrada - expectedStart;
      }
      if (saida < expectedEnd) {
        totalHoursDevedoras += expectedEnd - saida;
      }

      if (saida > expectedEnd) {
        const extraTime = saida - expectedEnd;
        if (extraTime > gracePeriod) {
          totalHoursExtras += extraTime - gracePeriod;
        }
      }
    });

    return {
      horasDevedoras: this.formatTime(totalHoursDevedoras),
      horasExtras: this.formatTime(totalHoursExtras),
    };
  }

  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  showAlert(header: string, message: string) {
    window.alert(`${header}: ${message}`);
  }

  onScroll(event: any) {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      this.currentPage++;
      this.loadMoreReports();
    }
  }

  searchReports() {
    this.applyFilter();
    this.loadMoreReports();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 600;
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadMoreReports();
    }
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.currentPage++;
      this.loadMoreReports();
    }
  }

  isLastPage(): boolean {
    return (this.currentPage + 1) * this.pageSize >= this.filteredReports.length;
  }

  expandImage(imageUrl: string) {
    this.expandedImageUrl = imageUrl;
    this.isImageExpanded = true;
  }

  closeExpandedImage() {
    this.isImageExpanded = false;
    this.expandedImageUrl = '';
  }
}