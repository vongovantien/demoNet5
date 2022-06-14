export class StageModel {

    public id: number = 0;
    public code: string = '';
    public stageNameVn: string = '';
    public stageNameEn: string = '';
    public departmentId: number = 0;
    public deptName: string = '';
    public descriptionVn: string = '';
    public descriptionEn: string = '';
    public userCreated: string = '';
    public datetimeCreated: string = '';
    public userModified: string = '';
    public datetimeModified: string = '';
    public active?: boolean = true;
    public inactiveOn?: string = '';

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }

}