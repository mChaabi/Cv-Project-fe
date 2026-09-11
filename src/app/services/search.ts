import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchTerm = signal<string>('');

  updateSearch(query: string) {
    this.searchTerm.set(query);
  }
}