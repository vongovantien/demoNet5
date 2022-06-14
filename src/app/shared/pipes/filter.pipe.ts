import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
    transform<T>(sources: T[], args: RegExp, keys: string[]): any {
        const searchText = new RegExp(args, 'ig');
        if (!!sources.length && !!keys.length) {
            const filtered = sources.filter((item: T) => {
                let match = false;
                for (const key of keys) {
                    if (item.hasOwnProperty(key)) {
                        if ((item[key] || '').toString().search(searchText) === -1) {
                            continue;
                        }
                        if ((item[key] || '').toString().search(searchText) !== -1) {
                            match = true;
                            break;
                        }
                    }
                }
                return match;
            });
            return filtered;
        } return sources;
    }
}
