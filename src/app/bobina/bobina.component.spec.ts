import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BobinaComponent } from './bobina.component';

describe('BobinaComponent', () => {
  let component: BobinaComponent;
  let fixture: ComponentFixture<BobinaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BobinaComponent]
    });
    fixture = TestBed.createComponent(BobinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
