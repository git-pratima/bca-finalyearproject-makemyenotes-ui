import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ApiService } from '../service/api.service';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './service/dashboard.service';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { NotificationService } from '../shared/notificationService';
import { Subscription } from 'rxjs';

interface Todo1 { id: string; completed: string; task: string }

interface WeatherCard {
  city: string;
  currentTemp: number;
  zone: string;
  weatherType: string;
  hTemp: number;
  lTemp: number;
  humidity: number;
  lastUpdated: string;
}

interface FutureEvent {
  id: number;
  eventName: string;
  startDate: string;   // ISO date string e.g. '2026-04-20'
  endDate: string;
  purpose: string;     // EventPurpose enum value
  status: string;      // EventStatus enum value
}

interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  provider: string;
  joined: string;
  online: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {

  // ── Future Events ─────────────────────────────────────────
  futureEventList: FutureEvent[] = [];
  currentEventIndex = 0;
  eventSlideInterval: any;

  registeredUsers: RegisteredUser[] = [];

  weatherCard: WeatherCard = {
    city: '',
    currentTemp: 0,
    zone: '',
    weatherType: '',
    hTemp: 0,
    lTemp: 0,
    humidity: 0,
    lastUpdated: ''
  };

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#068d25', '#f86300'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  userName: string | null = null;
  dashboardData: any = '';

  subCategoryCountMap: Map<string, number> = new Map();
  dailyQuestionCountMap: Map<string, number> = new Map();
  userMonthlyRevisionReport: Map<string, number> = new Map();

  educationalStages: { name: string; value: number; color: string }[] = [];

  tenMinSub!: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private apiService: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem("username");
    this.loadDashboardData();
    this.loadTemperature();
    this.loadOnlineUsers();
  }

  ngOnDestroy(): void {
    if (this.eventSlideInterval) clearInterval(this.eventSlideInterval);
  }

  // ── Future Events Slider ──────────────────────────────────

  startEventSlide(): void {
    if (this.futureEventList.length <= 1) return;
    this.eventSlideInterval = setInterval(() => {
      this.currentEventIndex = (this.currentEventIndex + 1) % this.futureEventList.length;
    }, 4000);
  }

  pauseEventSlide(): void {
    if (this.eventSlideInterval) {
      clearInterval(this.eventSlideInterval);
      this.eventSlideInterval = null;
    }
  }

  resumeEventSlide(): void {
    if (!this.eventSlideInterval) this.startEventSlide();
  }

  goToEvent(index: number): void {
    this.currentEventIndex = index;
  }

  /** Returns how many days until the event starts (0 if today or past) */
  getDaysUntil(startDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  /** Returns duration in days (inclusive) */
  getDurationDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 1;
  }

  /** Maps EventPurpose enum → CSS class for the badge */
  getPurposeClass(purpose: string): string {
    const map: Record<string, string> = {
      EXAM:     'purpose-exam',
      STUDY:    'purpose-study',
      PROJECT:  'purpose-project',
      MEETING:  'purpose-meeting',
      HOLIDAY:  'purpose-holiday',
      OTHER:    'purpose-other'
    };
    return map[purpose?.toUpperCase()] ?? 'purpose-other';
  }

  /** Maps EventStatus enum → CSS class for the status chip */
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      UPCOMING:  'status-upcoming',
      ONGOING:   'status-ongoing',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    };
    return map[status?.toUpperCase()] ?? 'status-upcoming';
  }

  // ── Users ─────────────────────────────────────────────────

  loadOnlineUsers(): void {
    this.apiService.loadOnlineUsers().subscribe(response => {
      this.registeredUsers = response.users;
    });
  }

  // ── Weather ───────────────────────────────────────────────

  selectedCity: string = '';

  loadTemperature(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.apiService.getCity(lat, lng).subscribe(res => {
          this.selectedCity = res.city;
          this.apiService.getCurrentWeather(this.selectedCity).subscribe(weather => {
            const timeOnly = weather.current.last_updated.split(' ')[1];
            this.weatherCard = {
              city: weather.location.name + ',' + weather.location.region,
              currentTemp: weather.current.temp_c,
              zone: weather.location.tz_id,
              weatherType: weather.current.condition.text,
              hTemp: weather.current.temp_c,
              lTemp: weather.current.temp_c,
              humidity: weather.current.humidity,
              lastUpdated: timeOnly
            };
          });
        });
      });
    }
  }

  // ── Summary Cards ─────────────────────────────────────────

  summaryCards = [
    { title: 'Total Questions',        value: 0, color: '#f28b82', icon: '❓' },
    { title: 'Questions Added by You', value: 0, color: '#5f63f2', icon: '❓' },
    { title: 'Your Bookmarked',        value: 0, color: '#34a853', icon: '⭐' },
    { title: 'UpComing Events',        value: 0, color: '#fbbc04', icon: '🗓️' },
    { title: 'New Feedback',           value: 0, color: '#cf7eb9', icon: '🗪'  }
  ];

  months: string[] = [
    'All', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ── Todos ─────────────────────────────────────────────────

  todos: { id: string; task: string; completed: string; checked: boolean }[] = [];
  todo1list: Todo1[] = [];
  toDoMap!: { [date: string]: any[] };
  isEditing = false;

  dateDescOrder = (a: any, b: any): number =>
    new Date(b.key).getTime() - new Date(a.key).getTime();

  toggleEdit(): void {
    if (this.isEditing) {
      this.todos = this.todos.map(e => ({ ...e, completed: e.checked ? 'Y' : 'N' }));
      this.dashboardService.createTodos(this.todos).subscribe({
        next: () => this.reloadDashboard(),
        error: (err: any) => {
          if (err.error.status === 401) {
            alert('Need Access/Login!');
            this.router.navigate(['/login']);
          }
          alert(err.error.message);
        }
      });
    }
    this.isEditing = !this.isEditing;
  }

  addEvent(): void {
    this.todos.push({ id: '', task: 'New Event', completed: 'N', checked: false });
  }

  removeEvent(index: number): void {
    this.todos.splice(index, 1);
  }

  // ── Dashboard Data ────────────────────────────────────────

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        this.dashboardData = res.dashboard;

        this.summaryCards[0].value = this.dashboardData.totalQuestion;
        this.summaryCards[1].value = this.dashboardData.userTotalQuestion;
        this.summaryCards[2].value = this.dashboardData.userTotalBookmark;
        this.summaryCards[3].value = this.dashboardData.futureEvents;
        this.summaryCards[4].value = this.dashboardData.unreadFeedback;

        this.subCategoryCountMap = new Map(Object.entries(this.dashboardData.countMap));
        this.educationalStages = Array.from(this.subCategoryCountMap.entries()).map(
          ([key, value], index) => ({ name: key, value: value as number, color: this.getColor(index) })
        );

        this.todo1list = this.dashboardData.toDoList;
        this.todos = this.todo1list.map((item: Todo1) => ({
          id: item.id,
          completed: item.completed,
          task: item.task,
          checked: item.completed === 'Y'
        }));

        this.toDoMap = this.dashboardData.toDoMap;

        this.dailyQuestionCountMap = new Map(Object.entries(this.dashboardData.dailyQuestionCountMap));
        this.loadDailyChart(this.dailyQuestionCountMap);

        this.userMonthlyRevisionReport = new Map(Object.entries(this.dashboardData.userMonthlyRevisionReport));
        this.loadRevisionChart(this.userMonthlyRevisionReport);

        // Theory vs Practical chart
        const theorayPracticalData: any[] = this.dashboardData.theorayPracticalData || [];
        setTimeout(() => this.loadTypeRevisionChart(theorayPracticalData), 0);

        // Future events slider
        this.futureEventList = this.dashboardData.futureEventList || [];
        if (this.futureEventList.length > 0) {
          this.currentEventIndex = 0;
          this.startEventSlide();
        }
      },
      error: () => {}
    });
  }

  // ── Charts ────────────────────────────────────────────────

  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
  }

  loadDailyChart(dailyQuestionCountMap: Map<string, number>): void {
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const currentDay = today.getDate();

    const labels = Array.from(dailyQuestionCountMap.keys());
    const data = Array.from(dailyQuestionCountMap.values());
    const colors = Array.from({ length: currentDay }, () =>
      `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`
    );

    new Chart('dailyChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Questions Added in ${monthName}`,
          data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  loadRevisionChart(revisionMap: Map<string, number>): void {
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });

    const labels = Array.from(revisionMap.keys());
    const data = Array.from(revisionMap.values());

    new Chart('revisionChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Questions Revised in ${monthName}`,
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, labels: { color: '#a0aec0' } }
        },
        scales: {
          x: { ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#a0aec0' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }

  loadTypeRevisionChart(data: any[]): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const labels: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      labels.push(
        new Date(year, month, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      );
    }

    const theoryMap: Record<string, number> = {};
    const practicalMap: Record<string, number> = {};

    data.forEach(row => {
      const key = row['created_date']?.toString().substring(0, 10);
      if (!key) return;
      if (row['type'] === 'theory')    theoryMap[key]    = Number(row['count']);
      else                             practicalMap[key] = Number(row['count']);
    });

    const theoryData: number[] = [];
    const practicalData: number[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      theoryData.push(theoryMap[key] ?? 0);
      practicalData.push(practicalMap[key] ?? 0);
    }

    const ctx = document.getElementById('typeRevisionChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Theory',
            data: theoryData,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129,140,248,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#818cf8',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Practical',
            data: practicalData,
            borderColor: '#2dd4bf',
            backgroundColor: 'rgba(45,212,191,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#2dd4bf',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#94a3b8', maxTicksLimit: 10, font: { size: 9 } },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', stepSize: 1, font: { size: 9 } },
            grid: { color: 'rgba(255,255,255,0.04)' }
          }
        }
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────

  onCardClick(card: any): void {
    if (card.title === 'New Feedback')           this.router.navigate(['/feedback-list']);
    if (card.title === 'Your Bookmarked')        this.router.navigate(['/bookmarked-question']);
    if (card.title === 'Questions Added by You') this.router.navigate(['/all-question']);
  }

  isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  reloadDashboard(): void {
    window.location.reload();
  }

  getDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }

  getTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}