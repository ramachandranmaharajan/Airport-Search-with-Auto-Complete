import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AirportAutocomplete } from './airport-autocomplete';

describe('AirportAutocomplete', () => {
  let component: AirportAutocomplete;
  let fixture: ComponentFixture<AirportAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportAutocomplete],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AirportAutocomplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
