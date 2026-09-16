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
    'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&h=600&fit=crop&q=80'
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
    this.autoplayTimer = setInterval(() => this.next(), 4000);
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

  getSlideStyle(i: number): { [klass: string]: any } {
    const total = this.carouselImages.length;
    let offset = i - this.carouselIndex;

    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= 1;

    if (!isVisible) {
      return { opacity: 0, transform: `translateX(${offset > 0 ? 120 : -120}%) scale(0.7)`, zIndex: 0, pointerEvents: 'none' as const };
    }

    const scale = offset === 0 ? 1 : 0.78;
    const translateX = offset * 42;
    const zIndex = 10 - absOffset;
    const opacity = offset === 0 ? 1 : 0.7;

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      zIndex,
      opacity
    };
  }
}
