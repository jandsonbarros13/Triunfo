import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalizacaoService {
  private apiUrl = environment.apiUrl + '/api/localizacoes';

  constructor() {}

  async listarLocalizacoes(): Promise<string[]> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data.map((loc: { endereco: string }) => loc.endereco); // Retorna apenas os endereços
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao buscar localizações: ' + (error.response?.data.message || error.message));
      } else {
        throw new Error('Erro desconhecido ao buscar localizações.');
      }
    }
  }

  async adicionarEndereco(endereco: string, latitude: number, longitude: number): Promise<void> {
    try {
      await axios.post(this.apiUrl, { endereco, latitude, longitude }); // Inclui as coordenadas
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao gravar localização: ' + (error.response?.data.message || error.message));
      } else {
        throw new Error('Erro desconhecido ao gravar localização.');
      }
    }
  }

  async atualizarEndereco(enderecoAntigo: string, novoEndereco: string, latitude: number, longitude: number): Promise<void> {
    try {
      await axios.put(`${this.apiUrl}/${encodeURIComponent(enderecoAntigo)}`, { endereco: novoEndereco, latitude, longitude }); // Inclui as coordenadas
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao atualizar localização: ' + (error.response?.data.message || error.message));
      } else {
        throw new Error('Erro desconhecido ao atualizar localização.');
      }
    }
  }

  async removerEndereco(endereco: { endereco: string }): Promise<void> {
    try {
      await axios.delete(this.apiUrl, { data: endereco }); // Passa o corpo da requisição
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao remover localização: ' + (error.response?.data.message || error.message));
      } else {
        throw new Error('Erro desconhecido ao remover localização.');
      }
    }
  }

  async obterEnderecoGravado(): Promise<{ latitude: number, longitude: number }> {
    try {
      const response = await axios.get(`${this.apiUrl}/gravado`);
      return response.data; // Assume que a resposta contém { latitude, longitude }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao obter localização gravada: ' + (error.response?.data.message || error.message));
      } else {
        throw new Error('Erro desconhecido ao obter localização gravada.');
      }
    }
  }
}