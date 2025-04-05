import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalizacaoService } from 'src/services/localizacao.service';
import { PontoService } from 'src/services/ponto.service';
import { environment } from 'src/environments/environment';

interface DeleteResponse {
  message: string;
}

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {
  enderecoAtual: string | null = null;
  enderecos: string[] = []; // Array para armazenar endereços gravados
  enderecoEditando: string | null = null; // Endereço que está sendo editado
  apiUrl = environment.apiUrl; // Access the API URL from environment
  showAlertMessage: string | null = null; // Para exibir alertas

  constructor(
    private localizacaoService: LocalizacaoService,
    private pontoService: PontoService, // Inject PontoService
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit() {
    this.listarLocalizacoes(); // Chama o método para listar localizações ao iniciar o componente
    this.obterEnderecoAtual(); // Obtém o endereço atual na inicialização
  }

  async excluirTodosOsPontosEFotos() {
    if (confirm('Tem certeza que deseja excluir todos os pontos e fotos de usuário? Isso não pode ser desfeito.')) {
      try {
        const response: any = await this.pontoService.excluirTodosOsPontosEFotos().toPromise();
        this.showAlert(response?.message || 'Pontos e fotos de usuário excluídos com sucesso.');
      } catch (error: any) {
        console.error('Erro ao excluir pontos e fotos:', error);
        this.showAlert(error.error?.error || 'Erro ao excluir pontos e fotos.');
      }
    }
  }

  async listarLocalizacoes() {
    try {
      this.enderecos = await this.localizacaoService.listarLocalizacoes(); // Usa o serviço para listar
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      this.showAlert('Erro ao carregar localizações.');
    }
  }

  async gravarEndereco() {
    if (this.enderecoAtual) {
      const coordinates = await this.getCurrentLocation(); // Obtém a localização atual
      if (coordinates) {
        if (this.enderecoEditando) {
          // Atualiza um endereço existente
          await this.atualizarEndereco(this.enderecoEditando, this.enderecoAtual, coordinates.latitude, coordinates.longitude);
        } else {
          // Adiciona um novo endereço
          await this.adicionarEndereco(this.enderecoAtual, coordinates.latitude, coordinates.longitude);
        }
        this.enderecoAtual = null; // Limpa o endereço atual após gravar
        this.enderecoEditando = null; // Reseta o estado de edição
        this.listarLocalizacoes(); // Atualiza a lista após gravar
      } else {
        this.showAlert('Falha ao obter a localização atual.');
      }
    } else {
      this.showAlert('Nenhum endereço atual para gravar.');
    }
  }

  async adicionarEndereco(endereco: string, latitude: number, longitude: number) {
    try {
      await this.localizacaoService.adicionarEndereco(endereco, latitude, longitude); // Usa o serviço para adicionar
      this.showAlert('Endereço gravado com sucesso!');
    } catch (error) {
      console.error('Erro ao gravar localização:', error);
      this.showAlert('Erro ao gravar localização.');
    }
  }

  async atualizarEndereco(enderecoAntigo: string, novoEndereco: string, latitude: number, longitude: number) {
    try {
      await this.localizacaoService.atualizarEndereco(enderecoAntigo, novoEndereco, latitude, longitude); // Usa o serviço para atualizar
      const index = this.enderecos.indexOf(enderecoAntigo);
      if (index > -1) {
        this.enderecos[index] = novoEndereco; // Atualiza o endereço no array local
      }
      this.showAlert('Endereço atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      this.showAlert('Erro ao atualizar localização.');
    }
  }

  async obterEnderecoAtual() {
    const coordinates = await this.getCurrentLocation();
    if (coordinates) {
      const address = await this.getAddressFromCoordinates(coordinates.latitude, coordinates.longitude);
      this.enderecoAtual = address;
      console.log('Endereço atual do usuário:', address);
      this.showAlert('Endereço atual obtido com sucesso!');
    } else {
      this.showAlert('Falha ao obter a localização atual.');
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            resolve(null);
          }
        );
      } else {
        console.error('Geolocalização não suportada pelo navegador.');
        resolve(null);
      }
    });
  }

  async getAddressFromCoordinates(lat: number, lon: number): Promise<string> {
    try {
      const response: any = await this.http.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).toPromise();
      if (response && response.display_name) {
        return response.display_name;
      } else {
        return 'Endereço não encontrado';
      }
    } catch (error) {
      console.error('Erro ao obter o endereço:', error);
      return 'Endereço não encontrado';
    }
  }

  showAlert(message: string) {
    this.showAlertMessage = message;
    setTimeout(() => {
      this.showAlertMessage = null;
    }, 3000); // Exibe o alerta por 3 segundos
  }

  async removerEndereco(endereco: string) {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      try {
        await this.localizacaoService.removerEndereco({ endereco }); // Passa o endereço no corpo da requisição
        const index = this.enderecos.indexOf(endereco);
        if (index > -1) {
          this.enderecos.splice(index, 1); // Remove o endereço do array
          this.showAlert('Endereço removido com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao remover localização:', error);
        this.showAlert('Erro ao remover localização.');
      }
    }
  }

  editarEndereco(endereco: string) {
    this.enderecoAtual = endereco; // Define o endereço atual para edição
    this.enderecoEditando = endereco; // Define o estado de edição
  }
}