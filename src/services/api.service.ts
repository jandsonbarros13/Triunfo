import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

// Interface para User Data
export interface UserData {
  nome: string;
  username: string;  // Usando 'username' em vez de 'login'
  password: string;
  cargo: string;
  horarioEntrada: string;
  horarioSaida: string;
  foto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // URL da API do ambiente

  constructor(private http: HttpClient) {}

  // Método para registrar um usuário
  registerUser(userData: UserData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/register`, userData)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para fazer login
  loginUser(userData: { username: string; password: string }): Observable<any> {  // Usando 'username'
    return this.http.post(`${this.apiUrl}/api/auth/login`, userData)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para obter todos os usuários
  getUsuarios(): Observable<UserData[]> {
    return this.http.get<UserData[]>(`${this.apiUrl}/api/auth/users`)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para atualizar um usuário
  updateUsuario(userId: string, userData: UserData): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/auth/users/${userId}`, userData)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para excluir um usuário
  deleteUsuario(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/auth/users/${userId}`)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para fazer upload da imagem
  uploadImage(imageBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg'); // Adiciona o arquivo blob

    return this.http.post(`${this.apiUrl}/api/upload`, formData)
      .pipe(catchError(this.handleError)); // Tratamento de erro
  }

  // Método para tratar erros
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Código de erro: ${error.status}, Mensagem: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}