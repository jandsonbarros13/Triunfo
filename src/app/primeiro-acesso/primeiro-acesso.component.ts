import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/services/api.service';
import { Subject } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';

@Component({
  selector: 'app-primeiro-acesso',
  templateUrl: './primeiro-acesso.component.html', 
  styleUrls: ['./primeiro-acesso.component.scss'], 
})
export class PrimeiroAcessoComponent implements OnInit {
  userData = {
    nome: '',
    username: '',
    password: '',
    cargo: 'Serviços Gerais',
    horarioEntrada: '07:00',
    horarioSaida: '17:00',
    foto: '',
    userType: 'user' 
  };

  showCamera: boolean = false;
  public trigger: Subject<void> = new Subject<void>();

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    // Qualquer inicialização necessária pode ser feita aqui
  }

  async cadastrar() {
    if (!this.isFormValid()) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
    
    try {
      const response = await this.apiService.registerUser(this.userData).toPromise();
      console.log('Usuário registrado com sucesso:', response);
      alert('Usuário registrado com sucesso!');
      this.resetForm(); 
      this.router.navigate(['/login']); 
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      const errorMessage = error.message || 'Tente novamente.'; // Corrigido para acessar a mensagem de erro
      alert(`Erro ao registrar usuário: ${errorMessage}`);
    }
  }

  private isFormValid(): boolean {
    return !!(this.userData.nome && this.userData.username && this.userData.password &&
              this.userData.foto &&
              this.userData.horarioEntrada && this.userData.horarioSaida &&
              this.userData.userType); 
  }

  private resetForm() {
    this.userData = {
      nome: '',
      username: '',
      password: '',
      cargo: 'Serviços Gerais',
      horarioEntrada: '07:00',
      horarioSaida: '17:00',
      foto: '',
      userType: 'user'
    };
    this.showCamera = false; 
  }

  public toggleCamera(): void {
    this.showCamera = !this.showCamera;
    if (this.showCamera) {
      this.trigger.next(); 
    }
  }

  public captureImage(webcamImage: WebcamImage): void {
    this.userData.foto = webcamImage.imageAsDataUrl; 
    this.showCamera = false; 
  }

  public logout(): void {
    // Implementar a lógica de logout, se necessário
    alert('Deslogged!'); // Exemplo de mensagem de logout
    this.router.navigate(['/login']); // Navegar para a página de login
  }

  voltar() {
    this.router.navigate(['/login']); 
  }
}