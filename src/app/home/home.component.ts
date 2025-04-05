import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BobinaService } from 'src/services/bobina.service';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  rosca: number | null = null; // Valor do RPM inserido
  pesoBobina: number | null = null; // Peso da bobina inserido pelo usuário
  pesoBaseSelecionado: string | null = null; // ID da bobina selecionada
  resultado: number | null = null; // Resultado ajustado de RPM
  bobinas: any[] = []; // Array para armazenar as bobinas
  isMenuOpen: boolean = false;
  userType: string | null = null;
  cargo: string | null = null;
  private inactivityTimeout: any; // Variável para armazenar o timeout

  // Definições dos pesos base padrão
  pesosBasePadrao = [
    { _id: 'padrao-8650', nome: 'Bobina 97', peso: 8.650 },
    { _id: 'padrao-9030', nome: 'Bobina 100', peso: 9.030 },
    { _id: 'padrao-9170', nome: 'Bobina 102', peso: 9.170 },
  ];

  constructor(private bobinaService: BobinaService, private router: Router, private stateService: StateService,   private authService: AuthService
  ) {}

  ngOnInit() {
    document.body.style.backgroundColor = '#ffffff';
    this.listarBobinas(); // Carrega as bobinas ao iniciar
    this.iniciarInactivityTimer(); // Inicia o temporizador de inatividade
    this.monitorarAtividade(); // Monitora a atividade do usuário
    this.stateService.clearData();
    this.carregarInformacoesUsuario();

  
    this.authService.getUser().then(user => {
      if (user) {
        console.log('Usuário logado:', user);
        this.cargo = user.cargo; // Armazena o cargo do usuário
      } else {
        console.log('Nenhum usuário logado.');
      }
    }).catch(error => {
      console.error('Erro ao recuperar usuário:', error);
    });
  }
  async carregarInformacoesUsuario() {
    const userInfo = await this.authService.getUser(); // Método que obtém as informações do usuário
    if (userInfo) {
      this.userType = userInfo.userType; // "master"
      this.cargo = userInfo.cargo; // "Gerente"
      console.log('User Type:', this.userType); // Para depuração
      console.log('Cargo:', this.cargo); // Para depuração
    }
  }



  listarBobinas() {
    this.bobinaService.listarBobinas().subscribe(
      (data) => {
        // Combina as bobinas padrão com as bobinas carregadas do serviço
        this.bobinas = this.pesosBasePadrao.concat(data);
      },
      (error) => {
        console.error('Erro ao listar bobinas', error);
        alert('Erro ao carregar as bobinas. Tente novamente mais tarde.'); // Mensagem de erro ao usuário
      }
    );
  }
  sair() {
    // Redireciona para a página de login
    this.router.navigate(['/login']);
}

  calcularAjuste(): void {
    if (this.rosca === null || this.pesoBobina === null || this.pesoBaseSelecionado === null) {
        alert('Por favor, insira todos os valores necessários.');
        return;
    }

    const bobinaSelecionada = this.bobinas.find(bobina => bobina._id === this.pesoBaseSelecionado);
    
    if (!bobinaSelecionada) {
        alert('Peso da bobina selecionado não encontrado.');
        return;
    }

    const pesoBaseSelecionado = bobinaSelecionada.peso;

    // Passo 1: Calcular X em porcentagem
    const x = (pesoBaseSelecionado * 100) / this.pesoBobina; // Aqui, x é calculado como porcentagem

    // Passo 2: Calcular Novo valor RPM
    const novoRPM = (x * this.rosca) / 100; // Multiplicando por Atual RPM e dividindo por 100 para ajustar

    // Mantém todos os quatro dígitos do resultado
    this.resultado = novoRPM; // Mantém o valor exato
}

// Método para formatar o resultado
getResultadoFormatado(): string {
    if (this.resultado !== null) {
        return Math.round(this.resultado).toString(); // Arredonda para o inteiro mais próximo e converte para string
    }
    return '';
}

  // Método para formatar o peso das bobinas
  formatarPeso(peso: number): string {
    return peso.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).replace('.', ',');
  }

  iniciarInactivityTimer() {
    this.resetInactivityTimer(); // Inicia o temporizador na primeira execução
  }

  resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout); // Limpa o temporizador anterior
    this.inactivityTimeout = setTimeout(() => {
      alert('Você ficou inativo por 15 minutos. Redirecionando para a tela de login.');
      this.router.navigate(['/login']); // Redireciona para a tela de login
    }, 900000); // 15 minutos
  }

  monitorarAtividade() {
    // Monitora eventos de atividade do usuário
    const activityEvents = ['click', 'mousemove', 'keydown'];

    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  ngOnDestroy() {
    clearTimeout(this.inactivityTimeout); // Limpa o temporizador ao destruir o componente
    const activityEvents = ['click', 'mousemove', 'keydown'];

    activityEvents.forEach(event => {
      window.removeEventListener(event, this.resetInactivityTimer); // Remove os ouvintes de evento
    });
  }
}
