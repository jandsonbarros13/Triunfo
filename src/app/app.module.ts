import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; // Adicione esta linha

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
import { WebcamModule } from 'ngx-webcam';
import { MenuComponent } from './menu/menu.component';
import { CalendarioComponent } from './calendario/calendario.component';

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
    ConfiguracoesComponent,
    MenuComponent,
    CalendarioComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    WebcamModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatIconModule // Adicione esta linha
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }