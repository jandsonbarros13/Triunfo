import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl; // URL da API

  constructor(private http: HttpClient) {}

  // Método para obter dados gerais
  getDados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/dados`);
  }

  // Método para enviar dados gerais
  enviarDados(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/dados`, data);
  }

  // Método para registrar um usuário
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/register`, userData);
  }

  // Método para fazer login
  loginUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, userData);
  }

  // Método para listar todos os usuários
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/auth/users`); 
  }

  // Método para atualizar um usuário
  atualizarUsuario(userId: string, usuarioData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/auth/users/${userId}`, usuarioData);
  }

  // Método para excluir um usuário
  excluirUsuario(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/auth/users/${userId}`);
  }

  // Métodos para adicionar uma nova bobina
  addBobina(bobinaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/bobinas`, bobinaData);
  }

  // Método para obter todas as bobinas
  getBobinas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/bobinas`);
  }

  // Método para atualizar uma bobina
  updateBobina(bobinaId: string, bobinaData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/bobinas/${bobinaId}`, bobinaData);
  }

  // Método para excluir uma bobina
  deleteBobina(bobinaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/bobinas/${bobinaId}`);
  }
}