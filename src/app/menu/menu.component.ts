import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service'; // Mantenha AuthService para userType, cargo, login/logout
import { PessoaService, UserProfileInfo } from 'src/services/pessoa.service'; // Importe PessoaService e a interface UserProfileInfo
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  userType: string | null = null;
  cargo: string | null = null;

  // Propriedade para armazenar as informações completas do perfil do usuário logado
  userProfile: UserProfileInfo | null = null; 

  private inactivityTimeout: any;
  private authSubscription: Subscription | undefined; // Para observar userType/cargo do AuthService
  private profileSubscription: Subscription | undefined; // Para observar os dados do perfil do PessoaService
  private clickOutsideListener: (event: MouseEvent) => void;
  private activityListeners: (() => void)[] = [];

  constructor(
    private router: Router,
    private authService: AuthService, // Injetar AuthService
    private pessoaService: PessoaService // Injetar PessoaService
  ) {
    this.clickOutsideListener = this.closeMenuOutsideClick.bind(this);
  }

  ngOnInit() {
    // Inscreve-se no userInfo$ do AuthService para obter userType e cargo
    // Isso é útil se você não quer que a rota de perfil retorne *tudo*
    this.authSubscription = this.authService.userInfo$.subscribe(
      (userInfo) => {
        if (userInfo) {
          this.userType = userInfo.userType;
          this.cargo = userInfo.cargo;
          // Opcional: Se o AuthService já retorna foto, você pode ter uma lógica de fallback aqui
          // ou simplesmente confiar no PessoaService para a foto.
        } else {
          this.userType = null;
          this.cargo = null;
          this.userProfile = null; // Reseta o perfil se não houver usuário logado
        }
      }
    );

    // Carregar os dados completos do perfil (incluindo a foto) usando o PessoaService
    // Isso é feito uma vez na inicialização do componente
    this.loadUserProfile(); 

    this.iniciarInactivityTimer();
    this.monitorarAtividade();
  }

  // Método para carregar as informações do perfil do usuário logado
  loadUserProfile() {
    this.profileSubscription = this.pessoaService.getLoggedInUserProfile().subscribe(
      (profileInfo) => {
        this.userProfile = profileInfo; // Atribui as informações do perfil (incluindo a foto)
        console.log('--- Informações do Perfil do Usuário (PessoaService) ---');
        console.log('Nome:', profileInfo.nome);
        console.log('Username:', profileInfo.username);
        console.log('Cargo:', profileInfo.cargo);
        console.log('Tipo de Usuário:', profileInfo.userType);
        console.log('Foto URL:', profileInfo.foto || 'N/A'); // Mostra a URL da foto ou 'N/A'
        console.log('ID:', profileInfo._id);
        console.log('---------------------------------------------------------');
      },
      (error) => {
        console.error('Erro ao carregar o perfil do usuário:', error);
        this.userProfile = null; // Garante que a foto não seja exibida em caso de erro
        // Dependendo do erro, você pode querer fazer logout ou exibir uma mensagem
      }
    );
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(event: Event) {
    event.preventDefault(); // Impede o comportamento padrão do link
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.addEventListener('click', this.clickOutsideListener);
    } else {
      document.removeEventListener('click', this.clickOutsideListener);
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.removeEventListener('click', this.clickOutsideListener);
  }

  closeMenuOutsideClick = (event: MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const navbarElement = document.querySelector('nav.navbar');
    const headerElement = document.querySelector('header');

    if (
      this.isMenuOpen &&
      navbarElement && !navbarElement.contains(targetElement) &&
      headerElement && !headerElement.contains(targetElement)
    ) {
      this.isMenuOpen = false;
      document.removeEventListener('click', this.clickOutsideListener);
    }
  };

  iniciarInactivityTimer() {
    this.resetInactivityTimer();
  }

  resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      alert(
        'Você ficou inativo por 15 minutos. Redirecionando para a tela de login.'
      );
      this.authService.logout();
      this.router.navigate(['/login']);
    }, 900000); // 15 minutos em milissegundos
  }

  monitorarAtividade() {
    const activityEvents = ['click', 'mousemove', 'keydown'];
    activityEvents.forEach((event) => {
      const listener = () => this.resetInactivityTimer();
      window.addEventListener(event, listener);
      this.activityListeners.push(listener);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.inactivityTimeout);

    const activityEvents = ['click', 'mousemove', 'keydown'];
    activityEvents.forEach((event, index) => {
      window.removeEventListener(event, this.activityListeners[index]);
    });

    document.removeEventListener('click', this.clickOutsideListener);

    if (this.authSubscription) {
      this.authSubscription.unsubscribe(); // Cancela a inscrição do AuthService
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe(); // Cancela a inscrição do PessoaService
    }
  }
}