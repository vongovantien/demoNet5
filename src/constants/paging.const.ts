import { PagerSetting } from "src/app/shared/models/layout/pager-setting.model";
import { SystemConstants } from "src/constants/system.const";

export const PAGINGSETTING: PagerSetting = {
    currentPage: 1,
    pageSize: SystemConstants.OPTIONS_PAGE_SIZE,
    numberToShow: SystemConstants.ITEMS_PER_PAGE,
    numberPageDisplay: SystemConstants.OPTIONS_NUMBERPAGES_DISPLAY
  }