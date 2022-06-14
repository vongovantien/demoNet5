import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SystemConstants } from 'src/constants/system.const';
import { SystemRepo } from '@repositories';
import { Menu } from '@models';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';

@Component({
    selector: 'app-page-sidebar',
    templateUrl: './page-sidebar.component.html',
})
export class PageSidebarComponent implements OnInit, AfterViewInit {

    Menu: Menu[] = [];

    userLogged: SystemInterface.IClaimUser;

    constructor(
        private _systemRepo: SystemRepo,
        private _store: Store<IAppState>
    ) {
    }

    ngOnInit() {
        // TODO Menu tiếng anh - tiếng việt
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.getMenu(this.userLogged.officeId);

        // this._store.select(getClaimUserOfficeState).subscribe((res: any) => {
        //     console.log(res);
        //     if (!!res) {
        //         this.getMenu(res);
        //     }
        // });
    }

    getMenu(officeId: string) {
        if (!!this.userLogged) {
            const language = localStorage.getItem(SystemConstants.CURRENT_LANGUAGE);
            this._systemRepo.getMenu(this.userLogged.id, language, officeId)
                .subscribe(
                    (res: Menu[]) => {
                        this.Menu = res.map((m: Menu) => new Menu(m));
                    }
                );
        }
    }

    ngAfterViewInit(): void {

    }

    toggleSubMenu(index: number) {
        const menuItem = document.getElementsByClassName('m-menu__item--submenu');
        const parentMenu = document.getElementById('parent-' + index.toString());

        for (let i = 0; i < menuItem.length; i++) {
            if (i !== index) {
                menuItem[i].className = 'm-menu__item  m-menu__item--submenu';
            }
        }
        if (!!parentMenu) {
            if (parentMenu.classList.contains('m-menu__item--open')) {
                parentMenu.classList.remove('m-menu__item--open');
                parentMenu.classList.remove('m-menu__item--active');

            } else {
                parentMenu.classList.add('m-menu__item--open');
                parentMenu.classList.add('m-menu__item--active');

            }
        }
    }

    mouseenter() {
        document.body.classList.add('body-fixed');
        if (document.body.classList.contains('m-aside-left--minimize')) {
            document.body.classList.remove('m-aside-left--minimize');
            document.body.classList.add('m-aside-left--minimize-hover');
        }
    }

    mouseleave() {
        document.body.classList.remove('body-fixed');
        if (document.body.classList.contains('m-aside-left--minimize-hover')) {
            document.body.classList.remove('m-aside-left--minimize-hover');
            document.body.classList.add('m-aside-left--minimize');
        }
    }

}
