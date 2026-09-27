import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export interface Step {
  num: number;
  title: string;
  desc: string;
}

export interface CommunityCard {
  initial: string;
  author: string;
  topic: string;
  question: string;
  answer: string;
  bookmarked: boolean;
}

export interface Permission {
  allowed: boolean;
  text: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  currentYear = new Date().getFullYear();
  private observer?: IntersectionObserver;

  // ── Page Data ────────────────────────────────────────────────────────────────

  features: Feature[] = [
    {
      icon: '🗂️',
      title: 'Category → Subcategory → Topic',
      desc: 'Three-level hierarchy keeps every question exactly where it belongs. Find anything in seconds.',
    },
    {
      icon: '❓',
      title: 'Questions & Answers',
      desc: 'Write Q&A in your own language — Hindi, English, or a mix. Notes that actually make sense to you.',
    },
    {
      icon: '🔗',
      title: 'Sub-Questions',
      desc: 'Nest follow-up questions directly under any question. Perfect for deep interview prep chains.',
    },
    {
      icon: '✏️',
      title: 'Edit & Delete',
      desc: 'Your notes, your control. Update answers as you learn more or remove what you no longer need.',
    },
    {
      icon: '🔖',
      title: 'Bookmark Anything',
      desc: 'Found a great question from another user? Bookmark it to your personal collection instantly.',
    },
    {
      icon: '👥',
      title: 'Community Questions',
      desc: 'Browse notes from other learners. View and bookmark freely — but only authors can edit their own.',
    },
  ];

  steps: Step[] = [
    {
      num: 1,
      title: 'Create a Category',
      desc: 'Start broad — "Java", "HR Interviews", "Class 12 Physics".',
    },
    {
      num: 2,
      title: 'Add Subcategories & Topics',
      desc: 'Break it down: Java → Collections → ArrayList. Clean and granular.',
    },
    {
      num: 3,
      title: 'Write Q&A + Sub-Questions',
      desc: 'Add your question, your answer, and any follow-up sub-questions below it.',
    },
    {
      num: 4,
      title: 'Bookmark & Revise',
      desc: 'Bookmark community notes, revisit your own, and ace the preparation.',
    },
  ];

  communityCards: CommunityCard[] = [
    {
      initial: 'P',
      author: 'Priya Sharma',
      topic: 'DSA Prep',
      question: 'What is the time complexity of merge sort?',
      answer: 'O(n log n) in all cases — best, average, and worst.',
      bookmarked: false,
    },
    {
      initial: 'R',
      author: 'Rahul Verma',
      topic: 'HR Interviews',
      question: 'Tell me about yourself (fresher)?',
      answer: 'Start with education, highlight key skills, close with why this role excites you.',
      bookmarked: true,
    },
    {
      initial: 'A',
      author: 'Anjali Mam',
      topic: 'Class 12 Physics',
      question: "State Faraday's law of electromagnetic induction.",
      answer: 'The induced EMF is directly proportional to the rate of change of magnetic flux.',
      bookmarked: false,
    },
  ];

  permissions: Permission[] = [
    { allowed: true,  text: 'View questions added by any user' },
    { allowed: true,  text: 'Bookmark any community question' },
    { allowed: true,  text: 'Add, edit, delete your own questions' },
    { allowed: false, text: 'Edit or delete someone else\'s questions' },
  ];

  // ── Constructor ──────────────────────────────────────────────────────────────

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.setSEO();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  // ── SEO ──────────────────────────────────────────────────────────────────────

  private setSEO(): void {
    this.title.setTitle(
      'Make My e Notes – Organise Q&A Notes for Exams, Interviews & Classes'
    );

    // name-based meta tags
    const nameTags: { name: string; content: string }[] = [
      {
        name: 'description',
        content: 'Make My e Notes helps students, working professionals and teachers organise Questions & Answers by Category, Subcategory and Topic. Add Sub-Questions, bookmark community notes, and prepare smarter for exams, interviews and classes.',
      },
      {
        name: 'keywords',
        content: 'notes app, student notes, interview preparation, Q&A notes, exam notes, teacher notes, bookmark questions, study app, question answer organizer',
      },
      { name: 'author',               content: 'Make My e Notes' },
      { name: 'robots',               content: 'index, follow' },
      { name: 'twitter:card',         content: 'summary_large_image' },
      { name: 'twitter:title',        content: 'Make My e Notes – Smart Notes App' },
      { name: 'twitter:description',  content: 'Q&A notes organised by category. Bookmark community questions. Prepare smarter.' },
    ];

    // property-based meta tags (Open Graph)
    const propertyTags: { property: string; content: string }[] = [
      { property: 'og:type',        content: 'website' },
      { property: 'og:title',       content: 'Make My e Notes – Smart Q&A Notes for Everyone' },
      { property: 'og:description', content: 'Organise notes by Category, Subcategory & Topic. Add Q&A, Sub-Questions, bookmark community content. Built for students, professionals and teachers.' },
      { property: 'og:url',         content: 'https://www.makemynotesss.com/' },
      { property: 'og:image',       content: 'https://www.makemynotesss.com/og-image.png' },
    ];

    nameTags.forEach(tag => this.meta.updateTag({ name: tag.name, content: tag.content }));
    propertyTags.forEach(tag => this.meta.updateTag({ property: tag.property, content: tag.content }));
  }

  // ── Scroll animations ─────────────────────────────────────────────────────────

  private initScrollAnimations(): void {
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.observer!.unobserve(e.target); // animate once
        }
      }),
      { threshold: 0.12 }
    );

    document
      .querySelectorAll('.fcard, .step, .ccard, .community-perms, .cta-inner, .how-visual')
      .forEach(el => this.observer!.observe(el));
  }

  // ── Scroll to section ─────────────────────────────────────────────────────────

  scrollTo(event: Event, sectionId: string): void {
    event.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}