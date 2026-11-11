import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AirportLookup } from './airport-lookup';

describe('AirportLookup', () => {
  let service: AirportLookup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AirportLookup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
