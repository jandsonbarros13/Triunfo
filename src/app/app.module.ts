import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Para usar ngModel
import { HttpClientModule } from '@angular/common/http'; // Importando HttpClientModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { BaterPontoComponent } from './bater-ponto/bater-ponto.component';
import { RelatoriosComponent } from './relatorios/relatorios.component';
import { RegisterComponent } from './register/register.component';
import { BobinaComponent } from './bobina/bobina.component';
import { PrimeiroAcessoComponent } from './primeiro-acesso/primeiro-acesso.component';
import { ConfiguracoesComponent } from './configuracoes/configuracoes.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    BaterPontoComponent,
    RelatoriosComponent,
    RegisterComponent,
    BobinaComponent,
    PrimeiroAcessoComponent,
    ConfiguracoesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, // Para usar ngModel
    HttpClientModule, // Adicione aqui
    AppRoutingModule, BrowserAnimationsModule,
    WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }