import { Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'prettyDate',
  standalone: true,
})
export class PrettyDatePipe implements PipeTransform {

    transform(value?: Date | string): string {
    if (! value) return '';

    // Non si cosiderano i tempi futuri al tempo in 'now' che porterebbero a un 'diff' negativo
    const now: Date = new Date();
    const nowS: number = Math.floor(now.getTime() / 1000);
    const date: Date = new Date(value);
    const dateS: number = Math.floor(date.getTime() / 1000)
    const diff: number = nowS - dateS;

    const monthName: string = Intl.DateTimeFormat(undefined, {month: 'short'}).format(date);

    // Numero di secondi in un anno, un mese, una settimana e un giorno
    const intervals = {
      'year': 31536000,
      'month': 2592000,
      'week': 604800,
      'day': 86400
    };

    const sameDay: boolean = Math.floor(diff / intervals['day']) === 0;
    const sameWeek: boolean = Math.floor(diff / intervals['week']) === 0;
    const sameMonth: boolean = Math.floor(diff / intervals['month']) === 0;


    if (sameDay || sameWeek) {
      return date.getHours() + ':' + date.getMinutes();
    }

    if (sameMonth) {
        return date.getDay() + ' ' + monthName;
    }

    return date.getDay() + ' ' + monthName + ' ' + date.getFullYear();
  }
}
