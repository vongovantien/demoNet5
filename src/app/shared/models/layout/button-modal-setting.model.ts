import { ButtonType } from "../../enums/type-button.enum";

export interface ButtonModalSetting {
    buttonAttribute?: ButtonAttributeSetting;
    typeButton: ButtonType;
    dataTarget?: string;
}
export interface ButtonAttributeSetting {
    type?: string;
    titleButton?: string;
    classStyle?: string;
    //targetModal?: string;
    icon?: string;
}