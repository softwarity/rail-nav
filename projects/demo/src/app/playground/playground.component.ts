import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import {
  RailnavComponent,
  RailnavContainerComponent,
  RailnavContentComponent,
  RailnavItemComponent
} from '@softwarity/rail-nav';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatRippleModule,
    RailnavComponent,
    RailnavContainerComponent,
    RailnavContentComponent,
    RailnavItemComponent
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));
  protected hasBackdrop = signal(true);
  protected position = signal<'start' | 'end'>('start');
  protected activeItem = signal('home');
  protected homeBadge = signal(3);
  protected favoritesDot = signal(true);

  protected navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'favorites', icon: 'favorite', label: 'Favorites' },
    { id: 'settings', icon: 'settings', label: 'Settings' }
  ];

  toggleColorScheme(): void {
    this.isDarkMode.update(dark => !dark);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  toggleBackdrop(): void {
    this.hasBackdrop.update(b => !b);
  }

  togglePosition(): void {
    this.position.update(p => p === 'start' ? 'end' : 'start');
  }

  selectItem(id: string): void {
    this.activeItem.set(id);
  }
}
