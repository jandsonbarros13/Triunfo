import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  userType: string | null = null;
  cargo: string | null = null;
  private inactivityTimeout: any;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.carregarInformacoesUsuario();
    this.iniciarInactivityTimer();
    this.monitorarAtividade();
  }

  async carregarInformacoesUsuario() {
    const userInfo = await this.authService.getUser();
    if (userInfo) {
      this.userType = userInfo.userType;
      this.cargo = userInfo.cargo;
    }
  }

  sair() {
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.addEventListener('click', this.closeMenuOutsideClick);
    } else {
      document.removeEventListener('click', this.closeMenuOutsideClick);
    }
  }

  closeMenuOutsideClick = (event: MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const menuElement = document.querySelector('nav');
    if (menuElement && !menuElement.contains(targetElement) && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  };

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
    document.removeEventListener('click', this.closeMenuOutsideClick);
  }
}