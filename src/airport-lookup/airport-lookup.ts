import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';

import { Airport } from '../types';

@Injectable({
  providedIn: 'root',
})
export class AirportLookup {
  private http = inject(HttpClient, { optional: true });

  private airports$: Observable<Airport[]> | null = null;

  private loadAirports(): Observable<Airport[]> {
    if (this.airports$) {
      return this.airports$;
    }

    const request$: Observable<Airport[]> = this.http
      ? this.http.get<Airport[]>('/assets/airports.json')
      : from(
          fetch('/assets/airports.json').then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to load airports: ${res.status}`);
            }
            return res.json() as Promise<Airport[]>;
          }),
        );

    this.airports$ = request$.pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError((err) => {
        this.airports$ = null;
        throw err;
      }),
    );
    return this.airports$;
  }

  search(term: string): Observable<Airport[]> {
    const query = (term ?? '').trim().toLowerCase();
    if (!query) {
      return of([]);
    }

    return this.loadAirports().pipe(
      map((airports) =>
        airports
          .filter(
            (airport) =>
              airport.code.toLowerCase().includes(query) ||
              airport.city.toLowerCase().includes(query),
          )
          .slice(0, 5),
      ),
      catchError(() => of([])),
    );
  }
}
