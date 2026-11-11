import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  Input,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, EMPTY, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, takeUntil } from 'rxjs/operators';

import { AirportLookup } from '../airport-lookup/airport-lookup';
import { Airport } from '../types';

@Component({
  selector: 'app-airport-autocomplete',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './airport-autocomplete.html',
  styleUrl: './airport-autocomplete.css',
})
export class AirportAutocomplete implements OnInit, OnDestroy {
  @Input() label = 'From';

  private lookup = inject(AirportLookup);
  private host = inject(ElementRef<HTMLElement>);

  control = new FormControl<string>('', { nonNullable: true });

  results: Airport[] = [];
  open = false;

  get filteredAirports(): Airport[] {
    return this.results;
  }
  activeIndex = -1;
  selected: Airport | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = (term ?? '').trim();
          if (!trimmed) {
            this.close();
            return EMPTY;
          }
          return this.lookup.search(trimmed).pipe(
            map((results) => ({ term: trimmed, results })),
            catchError(() => of({ term: trimmed, results: [] as Airport[] })),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ term, results }) => {
        if (!term) {
          this.close();
          return;
        }
        this.results = results;
        this.open = true;
        this.activeIndex = results.length > 0 ? 0 : -1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.open) {
      if (event.key === 'Escape') {
        this.close();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.results.length > 0) {
          this.activeIndex = Math.min(this.activeIndex + 1, this.results.length - 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.results.length > 0) {
          this.activeIndex = Math.max(this.activeIndex - 1, 0);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (
          this.activeIndex >= 0 &&
          this.activeIndex < this.results.length
        ) {
          this.select(this.results[this.activeIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      default:
        break;
    }
  }

  select(airport: Airport): void {
    this.control.setValue(airport.code, { emitEvent: false });
    this.selected = airport;
    this.close();
  }

  onItemMouseEnter(index: number): void {
    this.activeIndex = index;
  }

  close(): void {
    this.open = false;
    this.results = [];
    this.activeIndex = -1;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
