import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // Ajuste o caminho conforme necessário

@Injectable({
  providedIn: 'root'
})
export class BobinaService {
  private apiUrl = `${environment.apiUrl}/api/bobinas`; // Use a URL do ambiente e adicione o endpoint de bobinas

  constructor(private http: HttpClient) { }

  adicionarBobina(bobina: { nome: string; peso: number }): Observable<any> {
    return this.http.post(this.apiUrl, bobina);
  }

  listarBobinas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  atualizarBobina(id: string, bobina: { nome: string; peso: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bobina);
  }

  excluirBobina(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}