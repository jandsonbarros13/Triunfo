import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment'; // Ajuste o caminho conforme necessário

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private serverUrl = environment.apiUrl + '/status'; // Adiciona o endpoint de status

  constructor(private http: HttpClient) {}

  checkServerStatus(): Observable<any> {
    return this.http.get(this.serverUrl).pipe(
      catchError((error) => {
        console.error('Erro ao verificar o status do servidor', error);
        throw error; // Retorna o erro para ser tratado posteriormente
      })
    );
  }
}