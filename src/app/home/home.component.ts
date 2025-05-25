import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BobinaService } from 'src/services/bobina.service';
import { StateService } from 'src/services/state.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    rosca: number | null = null;
    pesoBobina: number | null = null;
    pesoBaseSelecionado: string | null = null;
    resultado: number | null = null;
    bobinas: any[] = [];
    isMenuOpen: boolean = false; // Controla a visibilidade do menu
    userType: string | null = null;
    cargo: string | null = null;
    private inactivityTimeout: any;

    // A variável pesosBasePadrao foi removida daqui.

    constructor(
        private bobinaService: BobinaService,
        private router: Router,
        private stateService: StateService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        document.body.style.backgroundColor = '#ffffff';
        this.listarBobinas();
        this.iniciarInactivityTimer();
        this.monitorarAtividade();
        this.stateService.clearData();
        this.carregarInformacoesUsuario();

        this.authService.getUser().then(user => {
            if (user) {
                console.log('Usuário logado:', user);
                this.cargo = user.cargo;
            } else {
                console.log('Nenhum usuário logado.');
            }
        }).catch(error => {
            console.error('Erro ao recuperar usuário:', error);
        });
    }

    async carregarInformacoesUsuario() {
        const userInfo = await this.authService.getUser();
        if (userInfo) {
            this.userType = userInfo.userType;
            this.cargo = userInfo.cargo;
            console.log('User Type:', this.userType);
            console.log('Cargo:', this.cargo);
        }
    }

    listarBobinas() {
        this.bobinaService.listarBobinas().subscribe(
            (data) => {
                // Atribui diretamente os dados do serviço à variável bobinas.
                this.bobinas = data;
                if (!data || data.length === 0) {
                    console.warn('Nenhuma bobina retornada pelo serviço ou lista vazia.');
                    // Você pode querer mostrar uma mensagem para o usuário aqui
                }
            },
            (error) => {
                console.error('Erro ao listar bobinas', error);
                alert('Erro ao carregar as bobinas. Verifique a conexão ou tente novamente mais tarde.');
                // Define bobinas como um array vazio em caso de erro para evitar problemas no template.
                this.bobinas = [];
            }
        );
    }

    sair() {
        this.router.navigate(['/login']);
    }

    calcularAjuste(): void {
        if (this.rosca === null || this.pesoBobina === null || this.pesoBaseSelecionado === null) {
            alert('Por favor, insira todos os valores necessários.');
            return;
        }

        const bobinaSelecionada = this.bobinas.find(bobina => bobina._id === this.pesoBaseSelecionado);

        if (!bobinaSelecionada) {
            alert('Bobina selecionada não encontrada. Verifique se as bobinas foram carregadas corretamente.');
            return;
        }

        // Certifique-se de que bobinaSelecionada.peso existe e é um número
        if (typeof bobinaSelecionada.peso !== 'number') {
            alert('O peso da bobina selecionada é inválido.');
            return;
        }

        const pesoBaseNum = bobinaSelecionada.peso;

        // Certifique-se de que pesoBobina não é zero para evitar divisão por zero
        if (this.pesoBobina === 0) {
            alert('O peso da bobina não pode ser zero.');
            return;
        }

        const x = (pesoBaseNum * 100) / this.pesoBobina;
        const novoRPM = (x * this.rosca) / 100;
        this.resultado = novoRPM;
    }

    getResultadoFormatado(): string {
        if (this.resultado !== null) {
            return Math.round(this.resultado).toString();
        }
        return '';
    }

    formatarPeso(peso: number): string {
        // Adiciona uma verificação para o caso de 'peso' não ser um número
        if (typeof peso !== 'number') {
            return 'N/A';
        }
        return peso.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).replace('.', ',');
    }

    iniciarInactivityTimer() {
        this.resetInactivityTimer();
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = setTimeout(() => {
            // Adicionar verificação se o usuário ainda está na página antes de alertar/redirecionar
            if (this.router.url === '/' || this.router.url === '/home') { // Ajuste as rotas conforme necessário
                alert('Você ficou inativo por 15 minutos. Redirecionando para a tela de login.');
                this.authService.logout(); // Opcional: Limpar sessão/token
                this.router.navigate(['/login']);
            }
        }, 900000); // 15 minutos (900000 ms)
    }

    // Envolver resetInactivityTimer em uma arrow function para manter o contexto do 'this'
    private handleUserActivity = () => {
        this.resetInactivityTimer();
    }

    monitorarAtividade() {
        const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, this.handleUserActivity, true); // Usar capturing phase pode ser mais confiável
        });
    }

    ngOnDestroy() {
        clearTimeout(this.inactivityTimeout);
        const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.removeEventListener(event, this.handleUserActivity, true);
        });
        document.removeEventListener('click', this.closeMenuOutsideClick);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (this.isMenuOpen) {
            // Adiciona o listener um pouco depois para evitar que o próprio clique de abrir feche o menu
            setTimeout(() => document.addEventListener('click', this.closeMenuOutsideClick), 0);
        } else {
            document.removeEventListener('click', this.closeMenuOutsideClick);
        }
    }

    closeMenuOutsideClick = (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;
        // Tenta encontrar o elemento do menu de forma mais robusta
        const menuContainer = document.querySelector('app-menu'); // Assumindo que <app-menu> é o container do seu menu

        // Verifica se o clique foi fora do componente app-menu
        if (menuContainer && !menuContainer.contains(targetElement) && this.isMenuOpen) {
            this.isMenuOpen = false;
            document.removeEventListener('click', this.closeMenuOutsideClick); // Remove o listener após fechar
        }
    };
}