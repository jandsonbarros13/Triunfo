import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { LocalizacaoService } from 'src/services/localizacao.service'; // Importe o serviço

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userData = { username: '', password: '' };
  usernameError: string = '';
  passwordError: string = '';
  allowedRadius = 1000; // Raio permitido em metros

  constructor(
    private authService: AuthService,
    private router: Router,
    private localizacaoService: LocalizacaoService // Injete o serviço
  ) {}

  async login() {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.validateUserData()) {
      return;
    }

    this.authService.login(this.userData).subscribe(
      async response => {
        if (response && response.message === 'Login bem-sucedido!') {
          const userInfo = response.userInfo;
          if (userInfo.userType === 'master') {
            this.router.navigate(['/home']);
          } else if (userInfo.userType === 'user') {
            await this.checkUserLocation();
          }
        } else {
          alert('Credenciais inválidas. Tente novamente.');
        }
      },
      async error => {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Tente novamente.');
      }
    );
  }

  validateUserData() {
    let isValid = true;

    if (!this.userData.username.trim()) {
      this.usernameError = 'Nome de usuário é obrigatório.';
      isValid = false;
    }

    if (!this.userData.password.trim()) {
      this.passwordError = 'Senha é obrigatória.';
      isValid = false;
    }

    return isValid;
  }

  async checkUserLocation() {
    try {
      const storedLocation = await this.localizacaoService.obterEnderecoGravado();
      const currentLocation = await this.getCurrentLocation();

      if (currentLocation && storedLocation) {
        const distance = this.calculateDistance(
          storedLocation.latitude,
          storedLocation.longitude,
          currentLocation.latitude,
          currentLocation.longitude
        );

        if (distance <= this.allowedRadius) {
          this.router.navigate(['/bater-ponto']);
        } else {
          alert('Você está fora da área permitida. Não é possível fazer login.');
        }
      } else {
        alert('Não foi possível obter a localização.');
      }
    } catch (error) {
      console.error('Erro ao verificar localização:', error);
      alert('Erro ao verificar localização. Tente novamente.');
    }
  }

  async getCurrentLocation() {
    return new Promise<{ latitude: number, longitude: number }>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          error => {
            reject(error);
          }
        );
      } else {
        reject('Geolocalização não suportada neste navegador.');
      }
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}