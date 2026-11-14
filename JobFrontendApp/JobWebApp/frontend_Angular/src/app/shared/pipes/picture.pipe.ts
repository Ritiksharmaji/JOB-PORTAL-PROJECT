import { Pipe, PipeTransform } from '@angular/core';
import { pictureSrc } from '../../core/utils/file.utils';

/** <img [src]="profile.picture | picture"> — Base64 picture or the default avatar. */
@Pipe({ name: 'picture' })
export class PicturePipe implements PipeTransform {
  transform(value?: string | null): string {
    return pictureSrc(value);
  }
}
