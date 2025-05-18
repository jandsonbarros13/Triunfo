import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/services/api.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userData = {
    nome: '',
    username: '',
    password: '',
    cargo: '',
    horarioEntrada: '',
    horarioSaida: '',
    foto: '',
    userType: 'master',
    fotoTamanho: 'small'
  };

  usuarios: any[] = [];
  displayedUsuarios: any[] = [];
  isEditing: boolean = false;
  currentUserId: string | null = null;

  showCamera: boolean = false;
  public trigger: Subject<void> = new Subject<void>();

  pageSize: number = 5;
  currentPage: number = 0;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  async registrar() {
    if (this.isEditing) {
      this.atualizarUsuario(this.currentUserId!);
    } else {
      this.apiService.registerUser(this.userData).subscribe(
        (response) => {
          this.showAlert('Usuário registrado com sucesso!');
          this.loadUsuarios();
          this.resetForm();
        },
        (error) => {
          this.showAlert(`Erro ao registrar usuário: ${error.error?.message || 'Tente novamente.'}`);
        }
      );
    }
  }

  loadUsuarios() {
    this.apiService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.updateDisplayedUsuarios();
      },
      (error) => {
        this.showAlert('Erro ao buscar usuários. Verifique a conexão.');
      }
    );
  }

  excluirUsuario(userId: string) {
    this.apiService.deleteUsuario(userId).subscribe(
      (response) => {
        this.showAlert('Usuário excluído com sucesso!');
        this.loadUsuarios();
      },
      (error) => {
        this.showAlert('Erro ao excluir usuário. Tente novamente.');
      }
    );
  }

  editarUsuario(usuario: any) {
    this.userData = { ...usuario };
    this.isEditing = true;
    this.currentUserId = usuario._id;
  }

  atualizarUsuario(userId: string) {
    this.apiService.updateUsuario(userId, this.userData).subscribe(
      (response) => {
        this.showAlert('Usuário atualizado com sucesso!');
        this.loadUsuarios();
        this.resetForm();
        this.isEditing = false;
        this.currentUserId = null;
      },
      (error) => {
        this.showAlert(`Erro ao atualizar usuário: ${error.error?.message || 'Tente novamente.'}`);
      }
    );
  }

  showAlert(message: string) {
    alert(message);
  }

  resetForm() {
    this.userData = {
      nome: '',
      username: '',
      password: '',
      cargo: '',
      horarioEntrada: '',
      horarioSaida: '',
      foto: '',
      userType: 'user',
      fotoTamanho: 'small'
    };
    this.isEditing = false;
    this.currentUserId = null;
  }

  sair() {
    this.router.navigate(['/login']);
  }

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

  updateDisplayedUsuarios() {
    const startIndex = this.currentPage * this.pageSize;
    this.displayedUsuarios = this.usuarios.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    this.currentPage++;
    this.updateDisplayedUsuarios();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDisplayedUsuarios();
    }
  }

  isLastPage(): boolean {
    return (this.currentPage + 1) * this.pageSize >= this.usuarios.length;
  }
}