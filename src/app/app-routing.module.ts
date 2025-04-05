import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Importa o HomeComponent
import { LoginComponent } from './login/login.component'; // Importa o LoginComponent
import { BaterPontoComponent } from './bater-ponto/bater-ponto.component';
import { RelatoriosComponent } from './relatorios/relatorios.component';
import { BobinaComponent } from './bobina/bobina.component';
import { ConfiguracoesComponent } from './configuracoes/configuracoes.component';
import { PrimeiroAcessoComponent } from './primeiro-acesso/primeiro-acesso.component';
import { RegisterComponent } from './register/register.component';

// Define as rotas
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redireciona para a página de login ao acessar a raiz
  { path: 'login', component: LoginComponent }, // Rota para a página de login
  { path: 'home', component: HomeComponent }, // Rota para a página inicial
  { path: 'bater-ponto', component: BaterPontoComponent },
  { path: 'relatorios', component: RelatoriosComponent },
  { path: 'bobinas', component: BobinaComponent },
  { path: 'usuarios', component: RegisterComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent },
  { path: 'primeiro-acesso', component: PrimeiroAcessoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Importa e configura o RouterModule
  exports: [RouterModule] // Exporta o RouterModule
})
export class AppRoutingModule { }