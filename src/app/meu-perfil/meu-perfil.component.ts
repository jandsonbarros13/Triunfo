import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiService, UserData } from 'src/services/api.service';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-meu-perfil',
  templateUrl: './meu-perfil.component.html',
  styleUrls: ['./meu-perfil.component.scss'],
})
export class MeuPerfilComponent implements OnInit {
  userData: UserData = {
    nome: '',
    username: '',
    password: '', // Este campo será preenchido com a senha (ou hash) se o backend enviar
    cargo: '',
    horarioEntrada: '',
    horarioSaida: '',
    foto: '',
    userType: '',
  };

  showPassword: boolean = false; // Nova propriedade para controlar a visibilidade da senha

  showCamera: boolean = false;
  public trigger: Subject<void> = new Subject<void>();
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  /**
   * Carrega as informações do perfil do usuário logado.
   * Assume que authService.getUser() retorna uma Promise de UserData.
   */
  async loadUserProfile() {
    this.isLoading = true;
    try {
      const userInfo = await this.authService.getUser();
      if (userInfo) {
        // Copia todas as propriedades do userInfo para userData, incluindo 'password'.
        // Se a senha vier vazia do backend, o campo no frontend ficará vazio.
        this.userData = { ...userInfo };
      } else {
        this.showAlert('Não foi possível carregar as informações do perfil. Faça login novamente.');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      this.showAlert('Erro ao carregar perfil. Por favor, tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Salva as alterações no perfil do usuário logado.
   * Envia todos os campos editáveis (nome, username, foto, password).
   */
  async salvarPerfil() {
    this.isLoading = true;

    const currentUser = await this.authService.getUser();
    const userId = currentUser?.['userId'] || currentUser?.['_id'];

    if (!userId) {
      this.showAlert('ID do usuário não encontrado para atualização.');
      this.isLoading = false;
      return;
    }

    // Objeto contendo os dados que podem ser atualizados (nome, username, foto, e agora password)
    const dataToUpdate: Partial<UserData> = {
      nome: this.userData.nome,
      username: this.userData.username,
      foto: this.userData.foto,
      password: this.userData.password, // A senha é enviada como está no campo
    };

    this.apiService.updateUsuario(userId, dataToUpdate as UserData).subscribe({
      next: (response) => {
        this.showAlert('Perfil atualizado com sucesso!');
        // Recarrega os dados para garantir que a UI esteja atualizada
        this.loadUserProfile();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar perfil:', error);
        this.showAlert(`Erro ao atualizar perfil: ${error.error?.message || 'Tente novamente.'}`);
        this.isLoading = false;
      },
    });
  }

  showAlert(message: string) {
    alert(message);
  }

  /**
   * Alterna a visibilidade do campo de senha.
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // --- Métodos da Câmera (mantidos como estão) ---
  capturarFoto() {
    this.showCamera = true;
  }

  public toggleCamera(): void {
    this.showCamera = !this.showCamera;
  }

  public captureImage(): void {
    this.trigger.next();
  }

  public handleImage(webcamImage: any): void {
    this.userData.foto = webcamImage.imageAsDataUrl;
    this.showCamera = false;
  }
}