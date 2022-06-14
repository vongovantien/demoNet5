import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSearchChargeComponent } from './form-search-charge.component';

describe('FormSearchChargeComponent', () => {
  let component: FormSearchChargeComponent;
  let fixture: ComponentFixture<FormSearchChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSearchChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSearchChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
