import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {  NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';
import { SidebarComponent } from '../sidebar/sidebar';



@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {}