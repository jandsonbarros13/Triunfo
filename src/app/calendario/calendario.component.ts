import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit, OnChanges {
  mesAtual: number;
  anoAtual: number;
  diasNoMes: (number | null)[];
  diasDaSemana: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  nomeMeses: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  nomeMesAtual: string;

  @Output() dataSelecionada = new EventEmitter<Date>();
  @Input() diasComPonto: Date[] = [];
  @Input() diasSemPonto: Date[] = [];

  constructor() {
    const hoje = new Date();
    this.mesAtual = hoje.getMonth();
    this.anoAtual = hoje.getFullYear();
    this.nomeMesAtual = this.nomeMeses[this.mesAtual];
    this.diasNoMes = [];
  }

  ngOnInit() {
    this.gerarCalendario();
    this.logSextasFeirasDoMes(); // Chamada para logar as sextas-feiras ao carregar
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diasComPonto'] || changes['diasSemPonto']) {
      this.gerarCalendario();
    }
  }

  gerarCalendario() {
    this.diasNoMes = [];
    const primeiroDiaDoMes = new Date(this.anoAtual, this.mesAtual, 1);
    const ultimoDiaDoMes = new Date(this.anoAtual, this.mesAtual + 1, 0);
    const numeroDeDias = ultimoDiaDoMes.getDate();
    const primeiroDiaDaSemana = primeiroDiaDoMes.getDay();

    for (let i = 0; i < primeiroDiaDaSemana; i++) {
      this.diasNoMes.push(null);
    }

    for (let i = 1; i <= numeroDeDias; i++) {
      this.diasNoMes.push(i);
    }
  }

  logSextasFeirasDoMes() {
    const sextasFeiras: Date[] = [];
    const primeiroDiaDoMes = new Date(this.anoAtual, this.mesAtual, 1);
    const ultimoDiaDoMes = new Date(this.anoAtual, this.mesAtual + 1, 0);

    for (let i = 1; i <= ultimoDiaDoMes.getDate(); i++) {
      const data = new Date(this.anoAtual, this.mesAtual, i);
      if (data.getDay() === 5) { // 5 representa sexta-feira (0 = Domingo, 1 = Segunda, ...)
        sextasFeiras.push(data);
      }
    }

    console.log('Sextas-feiras do mês:', sextasFeiras);
  }

  voltarMes() {
    this.mesAtual--;
    if (this.mesAtual < 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    }
    this.nomeMesAtual = this.nomeMeses[this.mesAtual];
    this.gerarCalendario();
    this.logSextasFeirasDoMes(); // Atualiza as sextas-feiras ao mudar de mês (opcional)
  }

  avancarMes() {
    this.mesAtual++;
    if (this.mesAtual > 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    }
    this.nomeMesAtual = this.nomeMeses[this.mesAtual];
    this.gerarCalendario();
    this.logSextasFeirasDoMes(); // Atualiza as sextas-feiras ao mudar de mês (opcional)
  }

  selecionarDia(dia: number | null) {
    if (dia) {
      const dataSelecionada = new Date(this.anoAtual, this.mesAtual, dia);
      console.log('Data selecionada:', dataSelecionada);
      this.dataSelecionada.emit(dataSelecionada);
    }
  }

  temPonto(dia: number | null): boolean {
    if (dia && this.diasComPonto) {
      const dataNoCalendario = new Date(this.anoAtual, this.mesAtual, dia);
      return this.diasComPonto.some(dataPonto =>
        dataPonto.getDate() === dataNoCalendario.getDate() &&
        dataPonto.getMonth() === dataNoCalendario.getMonth() &&
        dataPonto.getFullYear() === dataNoCalendario.getFullYear()
      );
    }
    return false;
  }

  naoTemPonto(dia: number | null): boolean {
    if (dia && this.diasComPonto) {
      const hoje = new Date();
      const dataNoCalendario = new Date(this.anoAtual, this.mesAtual, dia);
      const diaDaSemana = dataNoCalendario.getDay();
      const ehFimDeSemana = (diaDaSemana === 0 || diaDaSemana === 6);

      const temPontoNesseDia = this.diasComPonto.some(dataPonto =>
        dataPonto.getDate() === dataNoCalendario.getDate() &&
        dataPonto.getMonth() === dataNoCalendario.getMonth() &&
        dataPonto.getFullYear() === dataNoCalendario.getFullYear()
      );

      return !temPontoNesseDia && !ehFimDeSemana && dataNoCalendario <= hoje;
    }
    return false;
  }
}