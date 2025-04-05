import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // Altere o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private apiUrl = `${environment.apiUrl}/api/pontos/relatorios`; // Certifique-se de que 'apiUrl' esteja definido no environment

  constructor(private http: HttpClient) {}

  // Método para obter todos os pontos
  obterRelatorios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}