import { Component } from '@angular/core';
import { AirportAutocomplete } from '../airport-autocomplete/airport-autocomplete';

@Component({
  selector: 'app-root',
  imports: [AirportAutocomplete],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
