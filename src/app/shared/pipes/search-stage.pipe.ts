import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchStage', pure: false })
export class SearchStage implements PipeTransform {
    transform(sources: any[], args: RegExp): any {
        const searchText = new RegExp(args, 'ig');
        if (!!sources.length) {
            return sources.filter((item) => {
                if (!!item) {
                    return item.stageCode.toString().search(searchText) !== -1
                        || item.stageNameEN.toString().search(searchText) !== -1;
                } return item;
            });
        } return sources;
    }
}
