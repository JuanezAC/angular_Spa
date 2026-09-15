import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  carouselImages = [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=600&fit=crop&q=80'
  ];

  carouselIndex = 0;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  startAutoplay(): void {
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, 5000);
  }

  stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  next(): void {
    this.carouselIndex = (this.carouselIndex + 1) % this.carouselImages.length;
  }

  prev(): void {
    this.carouselIndex = (this.carouselIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  goTo(index: number): void {
    this.carouselIndex = index;
    this.stopAutoplay();
    this.startAutoplay();
  }
}
