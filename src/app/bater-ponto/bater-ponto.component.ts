import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { PontoService } from 'src/services/ponto.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

interface Ponto {
  nome: string;
  cargo: string;
  data: string;
  fotoUrlEntrada?: string;
  fotoUrlSaida?: string;
  horarioEntrada: string;
  horarioSaida: string;
}

@Component({
  selector: 'app-bater-ponto',
  templateUrl: './bater-ponto.component.html',
  styleUrls: ['./bater-ponto.component.scss']
})
export class BaterPontoComponent implements OnInit {
  user: any = {};
  nome: string = '';
  cargo: string = '';
  userId: string = '';
  userType: string = '';
  fotoUrlEntrada: string = '';
  fotoUrlSaida: string = '';
  pontoLocal: Ponto | null = null;
  mostrarSaidaInput: boolean = false;
  showCamera: boolean = false;
  capturandoEntrada: boolean = true;
  pontoRegistradoHoje: boolean = false; // Adicionado

  public trigger: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private pontoService: PontoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getUserInfo();
    this.loadSavedEntry();
    this.checkPontoRegistradoHoje(); // Adicionado
  }

  async getUserInfo() {
    this.user = await this.authService.getUser();
    if (this.user) {
      this.nome = this.user.nome;
      this.cargo = this.user.cargo;
      this.userId = this.user._id;
      this.userType = this.user.userType;
      console.log('User Loaded:', this.user);
    } else {
      this.showAlert('Usuário não encontrado', 'Verifique se o login foi realizado corretamente.');
    }
  }

  public async sair() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  public toggleCamera(): void {
    this.showCamera = !this.showCamera;
  }

  public captureImage(): void {
    this.trigger.next();
  }

  public handleImage(webcamImage: any): void {
    if (this.capturandoEntrada) {
      this.fotoUrlEntrada = webcamImage.imageAsDataUrl;
    } else {
      this.fotoUrlSaida = webcamImage.imageAsDataUrl;
    }
    this.showCamera = false;
  }

  public async salvarEntrada() {
    if (this.pontoRegistradoHoje) {
      this.showAlert('Atenção', 'Você já registrou o ponto hoje.');
      return;
    }

    if (!this.fotoUrlEntrada) {
      this.showAlert('Erro', 'Você deve tirar uma foto antes de salvar a entrada.');
      return;
    }

    const dataAtual = new Date().toLocaleDateString();
    const horarioEntrada = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.pontoLocal = {
      nome: this.nome,
      cargo: this.cargo,
      data: dataAtual,
      fotoUrlEntrada: this.fotoUrlEntrada,
      fotoUrlSaida: '',
      horarioEntrada: horarioEntrada,
      horarioSaida: ''
    };

    localStorage.setItem('pontoLocal', JSON.stringify(this.pontoLocal));
    this.pontoRegistradoHoje = true; // Adicionado

    this.showAlert('Entrada Salva', 'Sua entrada foi salva localmente. Agora, você pode registrar a saída.');
    this.mostrarSaidaInput = true;
    this.capturandoEntrada = false;
    this.fotoUrlEntrada = '';
  }

  private loadSavedEntry() {
    const savedEntry = localStorage.getItem('pontoLocal');
    if (savedEntry) {
      this.pontoLocal = JSON.parse(savedEntry);
      this.mostrarSaidaInput = this.pontoLocal !== null && !this.pontoLocal.horarioSaida;
      this.capturandoEntrada = !this.mostrarSaidaInput;
    }
  }

  public async registrarSaida() {
    if (this.pontoRegistradoHoje) {
      this.showAlert('Atenção', 'Você já registrou o ponto hoje.');
      return;
    }

    if (!this.pontoLocal) {
      this.showAlert('Erro', 'Você deve salvar a entrada antes de registrar a saída.');
      return;
    }

    if (!this.userId) {
      this.showAlert('Erro', 'ID do usuário não encontrado. Faça login novamente.');
      return;
    }

    if (!this.fotoUrlSaida) {
      this.showAlert('Erro', 'Você deve tirar uma foto antes de registrar a saída.');
      return;
    }

    this.pontoLocal.horarioSaida = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.pontoLocal.fotoUrlSaida = this.fotoUrlSaida;

    this.pontoService.registrarPonto({
      usuario: this.userId,
      nome: this.nome,
      cargo: this.cargo,
      data: this.pontoLocal.data,
      horarioEntrada: this.pontoLocal.horarioEntrada,
      horarioSaida: this.pontoLocal.horarioSaida,
      fotoUrl: this.pontoLocal.fotoUrlEntrada
    }).subscribe({
      next: async (response) => {
        this.showAlert('Sucesso', 'Ponto registrado com sucesso!');
        this.resetForm();
        this.pontoRegistradoHoje = true; // Adicionado
      },
      error: async (error) => {
        console.error('Erro ao registrar ponto:', error);
        this.showAlert('Erro', 'Erro ao registrar ponto. Tente novamente.');
      }
    });
  }

  private resetForm() {
    this.pontoLocal = null;
    this.mostrarSaidaInput = false;
    this.fotoUrlEntrada = '';
    this.fotoUrlSaida = '';
    localStorage.removeItem('pontoLocal');
    this.pontoRegistradoHoje = false; // Adicionado
    this.capturandoEntrada = true;
  }

  async showAlert(header: string, message: string) {
    alert(`${header}: ${message}`);
  }

  private checkPontoRegistradoHoje() {
    const savedEntry = localStorage.getItem('pontoLocal');
    if (savedEntry) {
      const ponto = JSON.parse(savedEntry);
      if (ponto && ponto.horarioSaida) {
        this.pontoRegistradoHoje = true;
      } else {
        this.pontoRegistradoHoje = false;
      }
    } else {
      this.pontoRegistradoHoje = false;
    }
  }
}