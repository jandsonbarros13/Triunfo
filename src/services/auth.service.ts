// src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

interface UserInfo {
  userType: string;
  nome: string;
  cargo: string;
  // outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userTypeSubject = new BehaviorSubject<string | null>(null);
  userType$ = this.userTypeSubject.asObservable();
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  constructor(private apiService: ApiService, private http: HttpClient) {}

  login(userData: { username: string; password: string }) {
    return this.apiService.loginUser(userData).pipe(
      tap((response: any) => {
        if (response.message === 'Login bem-sucedido!') {
          this.userTypeSubject.next(response.userInfo.userType);
          localStorage.setItem('userType', response.userInfo.userType);

          this.userInfoSubject.next(response.userInfo);
          localStorage.setItem('userInfo', JSON.stringify(response.userInfo));
          console.log('User Info:', response.userInfo);
        }
      }),
      catchError(error => {
        console.error('Erro durante o login:', error);
        throw error; // Re-lança o erro para tratamento no componente
      })
    );
  }

  logout() {
    this.userTypeSubject.next(null);
    this.userInfoSubject.next(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
  }

  isAuthenticated(): boolean {
    return this.userTypeSubject.getValue() !== null || localStorage.getItem('userType') !== null;
  }

  getUserType(): string | null {
    return this.userTypeSubject.getValue() || localStorage.getItem('userType');
  }

  isMaster(): boolean {
    return this.getUserType() === 'master';
  }

  isUser(): boolean {
    return this.getUserType() === 'user';
  }

  isExtrusor(): boolean {
    const userInfo = this.userInfoSubject.getValue();
    return userInfo ? userInfo.cargo === 'Extrusor' : false; // Sempre retorna boolean
  }

  async getUser() {
    const userInfo = this.userInfoSubject.getValue();
    if (userInfo) {
      return userInfo; // Retorna informações do usuário se disponíveis
    }
    
    const storedUserInfo = localStorage.getItem('userInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null; // Retorna do localStorage se disponível
  }

  async registrarPonto(data: { usuario: string; nome: string; cargo: string; horarioEntrada: string; horarioSaida: string; data: string }) {
    try {
      const response = await this.http.post('/api/registrar-ponto', data).toPromise();
      console.log('Ponto registrado no servidor:', response);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
    }
  }
}