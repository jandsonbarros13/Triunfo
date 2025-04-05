import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaterPontoComponent } from './bater-ponto.component';

describe('BaterPontoComponent', () => {
  let component: BaterPontoComponent;
  let fixture: ComponentFixture<BaterPontoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BaterPontoComponent]
    });
    fixture = TestBed.createComponent(BaterPontoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
