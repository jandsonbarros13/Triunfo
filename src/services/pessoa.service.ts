// src/services/pessoa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Adapte esta interface para as informações COMPLETAS que sua rota '/me' retorna.
// Ela deve ser um espelho da UserInfo do AuthService para consistência,
// mas será usada especificamente para o perfil detalhado.
export interface UserProfileInfo {
  _id?: string;        // ID do usuário (opcional, mas geralmente presente)
  nome: string;        // Nome completo
  username: string;    // Nome de usuário
  cargo: string;       // Cargo (ex: "Extrusor")
  userType: string;    // Tipo de usuário (ex: "master", "user")
  foto?: string;       // URL da foto de perfil (propriedade opcional)
  horarioEntrada?: string; // Horário de entrada
  horarioSaida?: string;   // Horário de saída
  // Adicione quaisquer outras propriedades que sua API de perfil possa retornar:
  // email?: string;
  // dataNascimento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private apiUrl = environment.apiUrl; // Base URL da sua API

  constructor(private http: HttpClient) {}

  /**
   * Obtém as informações detalhadas do perfil do usuário logado a partir do backend.
   * Assume que esta rota (ex: /api/auth/me) exige um token de autenticação (JWT)
   * que é geralmente enviado via HttpInterceptor ou adicionado manualmente.
   */
  getLoggedInUserProfile(): Observable<UserProfileInfo> {
    // --- OPÇÃO 1: Se você tem um HttpInterceptor que já adiciona o token JWT ---
    // Esta é a forma mais comum e recomendada.
    // Certifique-se que a rota '/api/auth/me' no seu backend retorna TODOS os campos da UserProfileInfo.
    return this.http.get<UserProfileInfo>(`${this.apiUrl}/api/auth/me`) // <<--- AJUSTE O CAMINHO DA ROTA DA SUA API AQUI
      .pipe(
        catchError(this.handleError)
      );

    // --- OPÇÃO 2: Se você precisa adicionar o token JWT manualmente (menos comum e repetitivo) ---
    // const token = localStorage.getItem('token'); // Ou como você armazena o token
    // if (!token) {
    //   return throwError(() => new Error('Token de autenticação não encontrado. Usuário não logado?'));
    // }
    //
    // let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    //
    // return this.http.get<UserProfileInfo>(`${this.apiUrl}/api/auth/me`, { headers }) // <<--- AJUSTE O CAMINHO DA ROTA AQUI
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Método para atualizar as informações do usuário.
   * Assume que a rota de atualização é algo como '/api/usuarios/:id'.
   * O 'data' deve ser um objeto com as propriedades a serem atualizadas.
   */
  updateUsuario(userId: string, data: Partial<UserProfileInfo>): Observable<any> {
    // --- OPÇÃO 1: Com HttpInterceptor para o token ---
    return this.http.put<any>(`${this.apiUrl}/api/usuarios/${userId}`, data) // <<--- AJUSTE A ROTA DE ATUALIZAÇÃO AQUI
      .pipe(
        catchError(this.handleError)
      );

    // --- OPÇÃO 2: Com token manual ---
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   return throwError(() => new Error('Token de autenticação não encontrado.'));
    // }
    // let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    // return this.http.put<any>(`${this.apiUrl}/api/usuarios/${userId}`, data, { headers })
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }


  /**
   * Método privado para tratamento de erros HTTP.
   * Centraliza a lógica de como erros de requisição são tratados e propagados.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido ao carregar o perfil!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente (rede, JavaScript)
      errorMessage = `Erro no cliente: ${error.error.message}`;
    } else {
      // Erro do lado do servidor (respostas HTTP com status de erro, ex: 404, 500)
      errorMessage = `Erro no servidor (Código: ${error.status}): ${error.message}`;
      // Se o backend enviar uma mensagem de erro específica, use-a
      if (error.error && error.error.message) {
        errorMessage = `Erro: ${error.error.message}`;
      }
    }
    console.error(`Erro no PessoaService: ${errorMessage}`);
    // Retorna um Observable de erro que pode ser capturado pelo componente que chamou o serviço
    return throwError(() => new Error(errorMessage));
  }
}