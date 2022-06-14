namespace SystemInterface {
    export interface IClaimUser {
        email: string;
        employeeId: string;
        id: string;
        phone_number: string;
        preferred_username: string;
        sub: string;
        userName: string;
        companyId: string;
        officeId: string;
        departmentId: number;
        groupId: number;
        nameEn: string;
        nameVn: string;
        bankAccountNo: string;
        bankAccountName: string;
        bankOfficeAccountNoUsd: string;
        bankOfficeAccountNoVnd: string;
        bankName: string;
        bankCode: string;
        photo: string;
        title: string;
        internalCode: string;
    }

    export interface IDepartmentGroup {
        userId: string;
        departmentId: number;
        groupId: number;
        departmentName: string;
        groupName: string;
        type: string;
    }

    export interface IUserPermission {
        menuId: string;
        access: boolean;
        detail: string;
        write: string;
        delete: string;
        list: string;
        import: boolean;
        export: boolean;
        speacialActions: ISpecialAction[];
        allowAdd: boolean;
        [name: string]: any;

    }

    export interface IToken {
        access_token: string;
        expire_in: number;
        token_type: string;
        refresh_token: string;
    }

    export interface ISpecialAction {
        action: string;
        isAllow: boolean;
    }

    export interface IBravoToken {
        Message: string;
        Success: string;
        TokenKey: string;
    }

    export interface IBRavoResponse {
        Stt: string;
        Success: number;
        Mgs: string;
    }

}

