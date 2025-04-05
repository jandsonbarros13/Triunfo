import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PontoService {
  private apiUrl = `${environment.apiUrl}/api/pontos`; // Base endpoint for pontos
  private registrarPontoUrl = `${this.apiUrl}/registrar-ponto`; // Endpoint for registering points
  private relatoriosUrl = `${this.apiUrl}/relatorios`; // Endpoint for obtaining reports
  private deletarTodosUrl = `${this.apiUrl}/deletar-todos`; // Endpoint for deleting all points
  private excluirFotosUsuariosUrl = `${environment.apiUrl}/api/upload/delete-user-photos`; // Endpoint for deleting user photos

  constructor(private http: HttpClient) {}

  registrarPonto(data: { usuario: string; nome: string; cargo: string; horarioEntrada: string; horarioSaida: string; data: string; fotoUrl?: string }): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('usuario', data.usuario);
    formData.append('nome', data.nome);
    formData.append('cargo', data.cargo);
    formData.append('horarioEntrada', data.horarioEntrada);
    formData.append('horarioSaida', data.horarioSaida);
    formData.append('data', data.data);

    if (data.fotoUrl) {
      // Angular lida com a conversão de base64 para Blob no frontend
      const byteString = atob(data.fotoUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });
      formData.append('foto', blob, 'foto.jpg');
    }

    return this.http.post(this.registrarPontoUrl, formData);
  }

  obterRelatorios(): Observable<any[]> {
    return this.http.get<any[]>(this.relatoriosUrl);
  }

  excluirTodosOsPontosEFotos(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deletar-tudo`); // Novo endpoint no backend
  }
}