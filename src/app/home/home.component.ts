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

    pesosBasePadrao = [
        { _id: 'padrao-8650', nome: 'Bobina 97', peso: 8.650 },
        { _id: 'padrao-9030', nome: 'Bobina 100', peso: 9.030 },
        { _id: 'padrao-9170', nome: 'Bobina 102', peso: 9.170 },
    ];

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
                this.bobinas = this.pesosBasePadrao.concat(data);
            },
            (error) => {
                console.error('Erro ao listar bobinas', error);
                alert('Erro ao carregar as bobinas. Tente novamente mais tarde.');
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
            alert('Peso da bobina selecionado não encontrado.');
            return;
        }

        const pesoBaseSelecionado = bobinaSelecionada.peso;
        const x = (pesoBaseSelecionado * 100) / this.pesoBobina;
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
        return peso.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).replace('.', ',');
    }

    iniciarInactivityTimer() {
        this.resetInactivityTimer();
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = setTimeout(() => {
            alert('Você ficou inativo por 15 minutos. Redirecionando para a tela de login.');
            this.router.navigate(['/login']);
        }, 900000);
    }

    monitorarAtividade() {
        const activityEvents = ['click', 'mousemove', 'keydown'];
        activityEvents.forEach(event => {
            window.addEventListener(event, () => this.resetInactivityTimer());
        });
    }

    ngOnDestroy() {
        clearTimeout(this.inactivityTimeout);
        const activityEvents = ['click', 'mousemove', 'keydown'];
        activityEvents.forEach(event => {
            window.removeEventListener(event, this.resetInactivityTimer);
        });
        document.removeEventListener('click', this.closeMenuOutsideClick); // Remover o listener
    }

    // Nova função para controlar a visibilidade do menu
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (this.isMenuOpen) {
            document.addEventListener('click', this.closeMenuOutsideClick);
        } else {
            document.removeEventListener('click', this.closeMenuOutsideClick);
        }
    }

    // Função para fechar o menu ao clicar fora
    closeMenuOutsideClick = (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;
        const menuElement = document.querySelector('nav');
        if (menuElement && !menuElement.contains(targetElement) && this.isMenuOpen) {
            this.isMenuOpen = false;
        }
    };
}