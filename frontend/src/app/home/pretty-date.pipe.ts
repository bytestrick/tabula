import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'prettyDate',
  standalone: true,
})
export class PrettyDatePipe implements PipeTransform {
  // Numero di secondi in un anno, un mese, una settimana e un giorno
  static readonly intervals = {
    'year': 31536000,
    'month': 2592000,
    'week': 604800,
    'day': 86400
  };

  transform(value?: Date | string): string {
    if (!value) return '';

    // Non si cosiderano i tempi futuri al tempo in 'now' che porterebbero a un 'diff' negativo
    const nowS: number = Math.floor(new Date().getTime() / 1000);
    const date: Date = new Date(value);
    const dateS: number = Math.floor(date.getTime() / 1000);
    const diff: number = nowS - dateS;

    const monthName: string = Intl.DateTimeFormat(undefined, {month: 'short'}).format(date);


    const sameDay: boolean = Math.floor(diff / PrettyDatePipe.intervals['day']) === 0;
    const sameWeek: boolean = Math.floor(diff / PrettyDatePipe.intervals['week']) === 0;
    const sameMonth: boolean = Math.floor(diff / PrettyDatePipe.intervals['month']) === 0;

    if (sameDay || sameWeek) {
      return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') ;
    }

    if (sameMonth) {
      return date.getDay() + ' ' + monthName;
    }

    return date.getDay() + ' ' + monthName + ' ' + date.getFullYear();
  }
}
