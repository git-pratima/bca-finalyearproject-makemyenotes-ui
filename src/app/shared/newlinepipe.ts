import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newline',
  standalone: true  // ✅ standalone pipe
})
export class Newlinepipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/ {2}/g, '&nbsp;&nbsp;')  // preserves indentation
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')  // tab = 4 spaces
      .replace(/\n/g, '<br>');  // newlines
  }
}