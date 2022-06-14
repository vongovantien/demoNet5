import { SystemConstants } from "src/constants/system.const";
import { ChargeConstants } from "@constants";
import { CommonEnum } from "@enums";
import { Observable, fromEvent, merge, combineLatest } from "rxjs";
import { distinctUntilChanged, filter, share } from "rxjs/operators";

export class UtilityHelper {
    prepareNg2SelectData(dataSource: any[], id: any, text: any): CommonInterface.INg2Select[] {
        return dataSource.map((item: any) => {
            return { id: item[id], text: item[text] };
        });
    }


    calculateTotalAmountWithVat(vat: number, quantity: number, unitPrice: number): number {
        let total = 0;
        if (vat >= 0) {
            total = quantity * unitPrice * (1 + (vat / 100));
        } else {
            total = quantity * unitPrice + Math.abs(vat);
        }
        total = Number(total);
        return total;
    }

    checkDuplicateInObject(propertyName: string | number, inputArray: { map: (arg0: (item: any) => void) => void; }): boolean {
        let seenDuplicate = false;
        const testObject = {};

        inputArray.map(function (item: { [x: string]: any; duplicate: boolean; }) {
            const itemPropertyName = item[propertyName];
            if (!!itemPropertyName && itemPropertyName in testObject) {
                testObject[itemPropertyName].duplicate = true;
                item.duplicate = true;
                seenDuplicate = true;
            } else {
                testObject[itemPropertyName] = item;
                delete item.duplicate;
            }
        });


        return seenDuplicate;
    }
    checkDuplicateInObjectByKeys(inputArray: any[] = [], propertyNameArray: string[], lengthFieldFirst: number, dupArray: any[] = [], flag: boolean = false): boolean {
        //format fields === null thì gán = "";
        inputArray.forEach(e => {
            propertyNameArray.forEach(ele => {
                if (e[ele] === null) {
                    e[ele] = "";
                }
            });
        });
        if (propertyNameArray.length <= 0) {
            return;
        }
        //
        if (dupArray.length <= 0) {
            dupArray = [...inputArray];
        }

        //remove elements have value by fields = null;
        if (propertyNameArray.length >= lengthFieldFirst) {
            dupArray = dupArray.filter(e => {
                return propertyNameArray.reduce((str, ele) => {
                    return str + e[ele];
                }, "") !== "";
            });
        }
        let obj = dupArray.reduce((a, e) => {
            a[e[propertyNameArray[0]]] = ++a[e[propertyNameArray[0]]] || 0;
            return a;
        }, {});

        const arrayDup = dupArray.filter((e) => {
            return obj[e[propertyNameArray[0]]] >= 1;
        });

        const arrayKeyDup = arrayDup.map(e => e.key);
        inputArray.forEach((element) => {
            if (arrayKeyDup.includes(element.key)) {
                flag = true;
                element.duplicate = true;

            } else {
                element.duplicate = false;
            }
        });

        propertyNameArray.shift();
        if (flag === false) {
            return;
        } else {
            this.checkDuplicateInObjectByKeys(inputArray, propertyNameArray, lengthFieldFirst, arrayDup, flag);
        }
    }

    calculateHeightWeight(width: number, height: number, length: number, packg: number, hwConstant: number) {
        return +((width * height * length / hwConstant) * packg).toFixed(3);
    }

    calculateCBM(width: number, height: number, length: number, packg: number, hwConstant: number) {
        return +((width * height * length / hwConstant / SystemConstants.CBM_AIR_CONSTANT) * packg).toFixed(3);
    }

    convertNumberToWords(amount: number | string) {
        const words = new Array();
        words[0] = '';
        words[1] = 'One';
        words[2] = 'Two';
        words[3] = 'Three';
        words[4] = 'Four';
        words[5] = 'Five';
        words[6] = 'Six';
        words[7] = 'Seven';
        words[8] = 'Eight';
        words[9] = 'Nine';
        words[10] = 'Ten';
        words[11] = 'Eleven';
        words[12] = 'Twelve';
        words[13] = 'Thirteen';
        words[14] = 'Fourteen';
        words[15] = 'Fifteen';
        words[16] = 'Sixteen';
        words[17] = 'Seventeen';
        words[18] = 'Eighteen';
        words[19] = 'Nineteen';
        words[20] = 'Twenty';
        words[30] = 'Thirty';
        words[40] = 'Forty';
        words[50] = 'Fifty';
        words[60] = 'Sixty';
        words[70] = 'Seventy';
        words[80] = 'Eighty';
        words[90] = 'Ninety';
        // tslint:disable: triple-equals

        amount = amount.toString();
        const atemp = amount.split(".");
        const number = atemp[0].split(",").join("");
        const n_length = number.length;
        let words_string = "";
        if (n_length <= 9) {
            const n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            const received_n_array = new Array();
            for (let i = 0; i < n_length; i++) {
                received_n_array[i] = number.substr(i, 1);
            }
            for (let i = 9 - n_length, j = 0; i < 9; i++, j++) {
                n_array[i] = received_n_array[j];
            }
            for (let i = 0, j = 1; i < 9; i++, j++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    if (n_array[i] == 1) {
                        // tslint:disable-next-line: radix
                        n_array[j] = 10 + parseInt(n_array[j].toString());
                        n_array[i] = 0;
                    }
                }
            }
            let value: any = "";
            for (let i = 0; i < 9; i++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    value = n_array[i] * 10;
                } else {
                    value = n_array[i];
                }
                if (value != 0) {
                    words_string += words[value] + " ";
                }
                if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Crores ";
                }
                if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Lakhs ";
                }
                if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Thousand ";
                }
                if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                    words_string += "Hundred and ";
                } else if (i == 6 && value != 0) {
                    words_string += "Hundred ";
                }
            }
            words_string = words_string.split("  ").join(" ");
        }
        return words_string;
    }
    calculateRoundStandard(num: number) {
        if (isNaN(num)) {
            return 0;
        } else {
            const d = +(num % 1).toFixed(2);
            if (d < 0.5) {
                return Math.round(num);
            } else if (d > 0.5) {
                return Math.ceil(num);
            } else {
                return num;
            }
        }
    }

    getTransationType(type: string) {
        return new Map([
            [ChargeConstants.AE_CODE, [CommonEnum.TransactionTypeEnum.AirExport]],
            [ChargeConstants.AI_CODE, [CommonEnum.TransactionTypeEnum.AirImport]],
            [ChargeConstants.SFE_CODE, [CommonEnum.TransactionTypeEnum.SeaFCLExport]],
            [ChargeConstants.SFI_CODE, [CommonEnum.TransactionTypeEnum.SeaFCLImport]],
            [ChargeConstants.SLE_CODE, [CommonEnum.TransactionTypeEnum.SeaLCLExport]],
            [ChargeConstants.SLI_CODE, [CommonEnum.TransactionTypeEnum.SeaLCLImport]],
            [ChargeConstants.CL_CODE, [CommonEnum.TransactionTypeEnum.CustomLogistic]],
            [ChargeConstants.SCE_CODE, [CommonEnum.TransactionTypeEnum.SeaConsolExport]],
            [ChargeConstants.SCI_CODE, [CommonEnum.TransactionTypeEnum.SeaConsolImport]],
            [ChargeConstants.IT_CODE, [CommonEnum.TransactionTypeEnum.InlandTrucking]],
        ]).get(type)[0];
    }

    getServiceName(type: string) {
        return new Map([
            [ChargeConstants.AE_CODE, [ChargeConstants.AE_DES]],
            [ChargeConstants.AI_CODE, [ChargeConstants.AI_DES]],
            [ChargeConstants.SFE_CODE, [ChargeConstants.SFE_DES]],
            [ChargeConstants.SFI_CODE, [ChargeConstants.SFI_DES]],
            [ChargeConstants.SLE_CODE, [ChargeConstants.SLE_DES]],
            [ChargeConstants.SLI_CODE, [ChargeConstants.SLI_DES]],
            [ChargeConstants.CL_CODE, [ChargeConstants.CL_DES]],
            [ChargeConstants.IT_CODE, [ChargeConstants.IT_DES]],
            [ChargeConstants.SCE_CODE, [ChargeConstants.SCE_DES]],
            [ChargeConstants.SCI_CODE, [ChargeConstants.SCI_DES]],
        ]).get(type)[0];
    }

    mappingServiceType(type: string) {
        return new Map([
            [ChargeConstants.AE_DES, [ChargeConstants.AE_CODE]],
            [ChargeConstants.AI_DES, [ChargeConstants.AI_CODE]],
            [ChargeConstants.SFE_DES, [ChargeConstants.SFE_CODE]],
            [ChargeConstants.SFI_DES, [ChargeConstants.SFI_CODE]],
            [ChargeConstants.SLE_DES, [ChargeConstants.SLE_CODE]],
            [ChargeConstants.SLI_DES, [ChargeConstants.SLI_CODE]],
            [ChargeConstants.CL_DES, [ChargeConstants.CL_CODE]],
            [ChargeConstants.IT_DES, [ChargeConstants.IT_CODE]],
            [ChargeConstants.SCE_DES, [ChargeConstants.SCE_CODE]],
            [ChargeConstants.SCI_DES, [ChargeConstants.SCI_CODE]],
        ]).get(type)[0];
    }

    getChargeType(type: string) {
        return new Map([
            ['BUY', [CommonEnum.CHARGE_TYPE.DEBIT]],
            ['SELL', [CommonEnum.CHARGE_TYPE.CREDIT]],
            ['OBH', [CommonEnum.CHARGE_TYPE.OBH]],
        ]).get(type)[0];
    }

    findDuplicates = (arr: any) => arr.filter((item: any, index: number) => arr.indexOf(item) != index);

    countBy(arr: any[], fn: any) {
        return arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val) => {
            acc[val as number] = (acc[val as number] || 0) + 1;
            return acc;
        }, {});
    }

    createShortcut = (shortcuts: string[]): Observable<KeyboardEvent[]> => {
        const keyDown$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document as Document, 'keydown');
        const keyUp$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document as Document, 'keyup');

        // * Create KeyboardEvent Observable for specified KeyCode
        const createKeyPressStream = (charCode: string) =>
            merge(keyDown$, keyUp$).pipe(
                distinctUntilChanged((a: KeyboardEvent, b: KeyboardEvent) => a.code === b.code && a.type === b.type),
                share()
            ).pipe(filter((event: KeyboardEvent) => event.code === charCode));

        // * Create Event Stream for every KeyCode in shortcut
        const keyCodeEvents$: Observable<KeyboardEvent>[] = shortcuts.map((shortcut: string) => createKeyPressStream(shortcut));

        // * Emit when specified keys are pressed (keydown).
        // * Emit only when all specified keys are pressed at the same time.
        return combineLatest(keyCodeEvents$).pipe(
            filter<KeyboardEvent[]>((arr) => arr.every((a) => a.type === 'keydown'))
        );
    }

    mergeObject(...objs: any) {
        return [...objs].reduce((acc, obj) =>
            Object.keys(obj).reduce((a, k) => {
                if (acc.hasOwnProperty(k)) {
                    acc[k] = obj[k];
                } else {
                    acc[k] = obj[k];
                }
                return acc;
            }, {}),
            {}
        );
    }

    decodeEntities(str: string) {
        if (str && typeof str === 'string') {
            // str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        }
        return str;
    }

    getServiceType(jobNo: string) {
        let transactionType: string = ChargeConstants.CL_CODE;

        if (jobNo) {
            if (jobNo.indexOf('AE') > -1) {
                transactionType = ChargeConstants.AE_CODE;
            }
            if (jobNo.indexOf('AI') > - 1) {
                transactionType = ChargeConstants.AI_CODE;
            }
            if (jobNo.indexOf('FE') > - 1) {
                transactionType = ChargeConstants.SFE_CODE;
            }
            if (jobNo.indexOf('FI') > - 1) {
                transactionType = ChargeConstants.SFI_CODE;
            }
            if (jobNo.indexOf('LE') > - 1) {
                transactionType = ChargeConstants.SLE_CODE;
            }
            if (jobNo.indexOf('LI') > - 1) {
                transactionType = ChargeConstants.SLI_CODE;
            }
            if (jobNo.indexOf('CE') > - 1) {
                transactionType = ChargeConstants.SCE_CODE;
            }
            if (jobNo.indexOf('CI') > - 1) {
                transactionType = ChargeConstants.SCI_CODE;
            }
        }

        return transactionType;
    }

    newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // isWhiteSpace(input: any) {
    //     if (input != null) {
    //         if (input.trim().length === 0) {
    //             return true;
    //         }
    //     }
    //     if (input === null) {
    //         return true;
    //     }
    //     return false;
    // }


}
