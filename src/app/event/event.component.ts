import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  Injector,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../shared/baseComponent';
import { EventService } from './service/event.service';

export interface CalendarEvent {
  id: string;
  eventName: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  purpose: 'MEETING' | 'TRAVEL' | 'INTERVIEW' | 'OTHERS';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface EventSlot {
  event: CalendarEvent;
  position: 'single' | 'start' | 'middle' | 'end';
  row: number;
}

interface DayCell {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: EventSlot[];
}

const PURPOSE_COLORS: Record<string, string> = {
  MEETING:   '#6366f1',
  TRAVEL:    '#14b8a6',
  INTERVIEW: '#f59e0b',
  OTHERS:    '#ec4899',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:   '#3b82f6',
  IN_PROGRESS: '#f97316',
  COMPLETED:   '#22c55e',
};

const STORAGE_KEY = 'calendar_events';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent extends BaseComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  currentDate = new Date();
  viewYear    = this.currentDate.getFullYear();
  viewMonth   = this.currentDate.getMonth();
  dayCells: DayCell[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  allEvents: CalendarEvent[] = [];

  showPopup  = false;
  isEditMode = false;
  form: CalendarEvent = this.emptyForm();

  purposeOptions = [
    { value: 'MEETING',   label: 'Meeting'   },
    { value: 'TRAVEL',    label: 'Travel'    },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OTHERS',    label: 'Others'    },
  ];

  statusOptions = [
    { value: 'SCHEDULED',   label: 'Scheduled'   },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED',   label: 'Completed'   },
  ];

  purposeColors = PURPOSE_COLORS;
  statusColors  = STATUS_COLORS;

  // ── Overflow expand ──────────────────────────────────────────
  expandedCellDate: string | null = null;

  constructor(injector: Injector, private eventService: EventService) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadEvents();
    this.buildCalendar();
  }

  // ── Month nav ────────────────────────────────────────────────
  get monthLabel(): string {
    return new Date(this.viewYear, this.viewMonth, 1).toLocaleString('default', {
      month: 'long', year: 'numeric',
    });
  }

  prevMonth(): void {
    this.viewMonth === 0 ? (this.viewMonth = 11, this.viewYear--) : this.viewMonth--;
    this.expandedCellDate = null;
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth === 11 ? (this.viewMonth = 0, this.viewYear++) : this.viewMonth++;
    this.expandedCellDate = null;
    this.buildCalendar();
  }

  goToday(): void {
    this.viewYear  = this.currentDate.getFullYear();
    this.viewMonth = this.currentDate.getMonth();
    this.expandedCellDate = null;
    this.buildCalendar();
  }

  // ── Build grid ───────────────────────────────────────────────
  buildCalendar(): void {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const lastDay  = new Date(this.viewYear, this.viewMonth + 1, 0);
    const todayStr = this.localDateStr(new Date());

    this.dayCells = [];

    // Leading pad
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(this.viewYear, this.viewMonth, -firstDay.getDay() + i + 1);
      this.dayCells.push(this.makeCell(d, false, todayStr));
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.dayCells.push(this.makeCell(new Date(this.viewYear, this.viewMonth, d), true, todayStr));
    }
    // Trailing pad
    const remaining = 42 - this.dayCells.length;
    for (let i = 1; i <= remaining; i++) {
      this.dayCells.push(this.makeCell(new Date(this.viewYear, this.viewMonth + 1, i), false, todayStr));
    }

    // ── Row assignment: week-by-week, freeing rows when events end ──
    for (let weekStart = 0; weekStart < this.dayCells.length; weekStart += 7) {
      const week = this.dayCells.slice(weekStart, weekStart + 7);
      const eventRowMap = new Map<string, number>();   // eventId → row
      const rowOccupant: (string | null)[] = [];       // row index → eventId

      for (const cell of week) {
        // Free rows for events that ended before this cell
        for (let r = 0; r < rowOccupant.length; r++) {
          const occupantId = rowOccupant[r];
          if (occupantId) {
            const ev = this.allEvents.find(e => e.id === occupantId);
            if (ev && ev.endDate < cell.dateStr) {
              rowOccupant[r] = null;
            }
          }
        }

        // Assign rows to active events in this cell
        for (const slot of cell.slots) {
          if (!eventRowMap.has(slot.event.id)) {
            let r = 0;
            while (rowOccupant[r] !== null && rowOccupant[r] !== undefined) r++;
            rowOccupant[r] = slot.event.id;
            eventRowMap.set(slot.event.id, r);
          }
          slot.row = eventRowMap.get(slot.event.id)!;
        }
      }
    }
  }

  private makeCell(date: Date, isCurrentMonth: boolean, todayStr: string): DayCell {
    const dateStr = this.localDateStr(date);
    return {
      date, dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === todayStr,
      slots: this.getSlotsForDate(dateStr),
    };
  }

  getSlotsForDate(dateStr: string): EventSlot[] {
    return this.allEvents
      .filter(e => e.startDate <= dateStr && dateStr <= e.endDate)
      .map(event => {
        const isStart = event.startDate === dateStr;
        const isEnd   = event.endDate   === dateStr;
        let position: EventSlot['position'];
        if (isStart && isEnd)  position = 'single';
        else if (isStart)      position = 'start';
        else if (isEnd)        position = 'end';
        else                   position = 'middle';
        return { event, position, row: 0 };
      });
  }

  // ── Color helpers ────────────────────────────────────────────
  getPurposeColor(purpose: string): string { return PURPOSE_COLORS[purpose] ?? '#6366f1'; }
  getStatusColor(status: string):   string { return STATUS_COLORS[status]   ?? '#3b82f6'; }

  getPurposeLabel(value: string): string {
    return this.purposeOptions.find(p => p.value === value)?.label ?? value;
  }
  getStatusLabel(value: string): string {
    return this.statusOptions.find(s => s.value === value)?.label ?? value;
  }

  // ── Expand overflow ──────────────────────────────────────────
  toggleExpand(dateStr: string, e: MouseEvent): void {
    e.stopPropagation();
    this.expandedCellDate = this.expandedCellDate === dateStr ? null : dateStr;
  }

  isExpanded(dateStr: string): boolean {
    return this.expandedCellDate === dateStr;
  }

  // ── Popup controls ───────────────────────────────────────────
  openNewEventPopup(day: DayCell): void {
    if (!day.isCurrentMonth) return;
    this.expandedCellDate = null;
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.form.startDate = day.dateStr;
    this.form.endDate   = day.dateStr;
    this.showPopup = true;
  }

  openEditEventPopup(event: CalendarEvent, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.isEditMode = true;
    this.form = { ...event };
    this.showPopup = true;
  }

  closePopup(): void { this.showPopup = false; }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('popup-backdrop')) {
      this.closePopup();
    }
  }

  // ── Form actions ─────────────────────────────────────────────
 saveEvent(): void {
  this.closePopup();
  if (!this.isFormValid()) return;

  if (this.isEditMode) {
    // TODO: Replace with backend PUT call
    this.updateEvent(this.form);
    this.buildCalendar();
    this.closePopup();
    this.loadEvents();
  } else {
    this.eventService.saveEvent(this.form).subscribe({
      next: (res: any) => {
        this.notify.success(res.message);

        // Refresh only after successful save
        this.buildCalendar();
        this.closePopup();
        this.loadEvents();
      },
      error: (err: any) => {
        this.notify.info("Some error occurred.");
      }
    });
  }
}

  resetForm(): void {
    if (this.isEditMode) {
      const original = this.allEvents.find(e => e.id === this.form.id);
      if (original) this.form = { ...original };
    } else {
      const start = this.form.startDate;
      this.form = this.emptyForm();
      this.form.startDate = start;
      this.form.endDate   = start;
    }
  }

  deleteEvent(): void {
    this.closePopup();
    this.eventService.deleteEvent(this.form.id).subscribe({
        next: (res: any) => {
          this.notify.success(res.message);
              this.buildCalendar();           
              this.loadEvents();
        },
        error: (err: any) => {
          this.notify.info("Some error occured.");
        }
    });
  }

  isFormValid(): boolean {
    return (
      this.form.eventName.trim().length > 0 &&
      !!this.form.startDate &&
      !!this.form.endDate &&
      this.form.startDate <= this.form.endDate &&
      !!this.form.purpose &&
      !!this.form.status
    );
  }

  // ── Store helpers ────────────────────────────────────────────
  private loadEvents(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.buildCalendar();
      return;
    }

    this.eventService.getUserEvents().subscribe({
      next: (res) => {
        this.allEvents = res.eventList;
        this.buildCalendar();
      },
      error: (err) => console.error(err)
    });
  }

  private updateEvent(event: CalendarEvent): void {
    this.eventService.saveEvent(this.form).subscribe({
        next: (res: any) => {
          this.notify.success(res.message);
        },
        error: (err: any) => {
          if (err.error.status === 401) {
            this.notify.error('Need Access/Login!');
            this.router.navigate(['/login']);
          }
          this.notify.info(err.error.message);
        }
    });
    this.buildCalendar();
    this.closePopup();
    this.loadEvents();
  }

  // ── Timezone-safe date string ────────────────────────────────
  private localDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private emptyForm(): CalendarEvent {
    return { id: '', eventName: '', startDate: '', endDate: '', purpose: 'MEETING', status: 'SCHEDULED' };
  }
}