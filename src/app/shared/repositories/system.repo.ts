import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SystemRepo {
    private VERSION: string = 'v1';
    constructor(private _api: ApiService) {
    }

    addNewUser(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailUser(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/${id}`).pipe(
            map((data: any) => data)
        );
    }

    deleteUser(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/Delete`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    updateUser(body: any = {}) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser`, body).pipe(
            map((data: any) => data)
        );
    }

    resetPasswordUser(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/ResetPassword`, { id: id }).pipe(
            map((data: any) => data)
        );
    }


    getUser(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    getOffice(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    deleteOffice(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/Delete`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    getDetailOffice(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/${id}`).pipe(
            map((data: any) => data)
        );
    }

    updateOffice(body: any = {}) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/Update`, body).pipe(
            map((data: any) => data)
        );
    }


    addNewOffice(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    addUserToOffice(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/AddUserToOffice`, body).pipe(
            map((data: any) => data)
        );
    }

    addUserToDepartment(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/AddUserToDepartment`, body).pipe(
            map((data: any) => data)
        );
    }

    addUserToCompany(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/AddUserToCompany`, body).pipe(
            map((data: any) => data)
        );
    }

    addUserToGroupLevel(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/AddUserToGroup`, body).pipe(
            map((data: any) => data)
        );
    }

    getListCompany() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysCompany`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListCompaniesByUserId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysCompany/GetByUserId`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListUserLevelByUserId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserLevel/GetByUserId`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getComboboxPermission() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysPermissionGeneral/GetDataCombobox`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListPermissionsByUserId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserPermission/GetByUserId`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListSystemUser(body: any = { active: true }) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUser`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListUsersBylevel(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUser/GetUserByLevel`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getSystemUsers(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUser/Query`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getCompany(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/paging`, body, {
            page: '' + page || 1,
            size: '' + size || 10
        }).pipe(
            map((data: any) => data)
        );
    }

    updateCompany(id: string, body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/${id}/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailCompany(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/${id}`).pipe(
            map((data: CommonInterface.IResult) => data.data)
        );
    }

    addNewCompany(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    getDepartment(page?: number, size?: number, body: any = {}) {
        if (!!page && !!size) {
            return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/paging`, body, {
                page: '' + page,
                size: '' + size
            })
        }
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/QueryData`, body);
    }

    getAllDepartment() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment`).pipe(
            map((data: any) => data)
        );
    }

    getDetailDepartment(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/${id}`).pipe(
            map((data: any) => data)
        );
    }

    getAllGroup() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup`).pipe(
            map((data: any) => data)
        );
    }

    getListGroup(body = { active: true }) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/Query`, body).pipe(
            map((data: any) => data)
        );
    }

    getGroup(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }
    getDetailGroup(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/${id}`).pipe(
            map((data: any) => data)
        );
    }
    deleteGroup(id: number) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/${id}`).pipe(
            map((data: any) => data)
        );
    }
    addNewGroup(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup`, body).pipe(
            map((data: any) => data)
        );
    }
    updateGroup(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup`, body).pipe(
            map((data: any) => data)
        );
    }
    getUsersInGroup(groupId: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserGroup/GetByGroup/${groupId}`).pipe(
            map((data: any) => data)
        );
    }
    getUserGroupDetail(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserGroup/${id}`).pipe(
            map((data: any) => data)
        );
    }
    addUserToGroup(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserGroup`, body).pipe(
            map((data: any) => data)
        );
    }
    updateUserGroup(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserGroup`, body).pipe(
            map((data: any) => data)
        );
    }
    deleteUserGroup(id: number) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserGroup/${id}`).pipe(
            map((data: any) => data)
        );
    }
    getAllOffice() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetAll`).pipe(
            map((data: any) => data)
        );
    }

    getOfficeByCompany(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetByCompany/${id}`).pipe(
            map((data: CommonInterface.IResult) => data)
        );
    }

    getLocationOfficeById(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetLocationOfficeById/${id}`).pipe(
            map((data: CommonInterface.IResult) => data)
        );
    }

    queryOffices(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/Query`, body).pipe(
            map((data: any) => data)
        );
    }

    addNewDepartment(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    updateDepartment(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    deleteDepartment(id: number) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/Delete`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    getDepartmentsByOfficeId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/GetDepartmentByOfficeId`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    deleteCompany(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/Delete`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    getGroupsByDeptId(id: number) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/Query`, { departmentId: id }).pipe(
            map((data: any) => data)
        );
    }

    getEmployeeByemployeeid(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmployee/GetByEmployeeId?employeeid=${id}`).pipe(
            map((data: CommonInterface.IResult) => data.data)
        );
    }

    getEmployeeByUserId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmployee/GetEmployeeByUser?userId=${id}`).pipe(
            map((data: any) => data)
        );
    }

    getUserPermission(userid: string, id: string, type: string) {
        if (type === 'office' || type === 'group') {
            return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/GetBy`, { userId: userid, officeId: id }).pipe(
                map((data: any) => data)
            );
        } else if (type === 'user') {
            return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/${id}`).pipe(
                map((data: any) => data)
            );
        }
    }

    getPermissionSample(id: string) {
        /* 
        * Create id = null
        * Detail id = GUID
        */
        if (!!id) {
            return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Get`, { id: id }).pipe(
                map((data: any) => data)
            );
        } else {
            return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Get`).pipe(
                map((data: any) => data)
            );
        }
    }

    createPermissionSample(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    getSystemRole() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysRole`).pipe(
            map((data: any) => data)
        );
    }

    getListPermissionGeneral(page?: number, size?: number, body: any = {}) {
        if (!!page && !!size) {
            return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Paging`, body, {
                page: '' + page,
                size: '' + size
            }).pipe(
                map((data: any) => data)
            );
        }
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Query`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    deletePermissionGeneral(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/${id}`);
    }

    updatePermissionGeneral(body: any = {}) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysPermissionGeneral/Update`, body).pipe(
            map((data: any) => data)
        );
    }


    updateUsersPermission(body: any = {}) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    getAuthorization(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/Paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    getAuthorizedApproval(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/Paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    queryUserLevels(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserLevel/Query`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getUserActiveInfo() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserLevel/GetUserActiveInfo`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListOffices() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetAll`)
            .pipe(
                catchError((error) => throwError(error)),
                map((data: any) => data)
            );
    }

    getListOfficesByUserId(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetByUserId`, { id: id })
            .pipe(
                catchError((error) => throwError(error)),
                map((data: any) => data)
            );
    }

    upLoadUserFile(files: any) {
        return this._api.postFile(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/uploadFile`, files, "uploadedFile");
    }

    downloadUserExcel() {
        return this._api.downloadfile(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUser/DownloadExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    importUser(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUser/Import`, body).pipe(
            map((data: any) => data)
        );
    }

    deleteUserLevel(id: number) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/${id}`)
            .pipe(
                map((data: any) => data)
            );
    }

    updateUserLevelById(body) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel`, body)
    }

    setdefaultUserLeve(id: number) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserLevel/SetDefault`, null, { Id: id });
    }

    deleteRole(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/${id}`)
            .pipe(
                map((data: any) => data)
            );
    }

    addRoleToUser(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    addNewAuthorizedApproval(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    checkAllowGetDetailAuthorizedApproval(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/CheckAllowDetail/${id}`).pipe(
            map((data: any) => data)
        );
    }

    updateAuthorizedApproval(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    deleteAuthorizedApproval(id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/Delete`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    checkDeleteAuthorizedApproval(id: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorizedApproval/CheckDeletePermission/${id}`).pipe(
            map((data: any) => data)
        );
    }

    addNewAuthorization(body: any) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    updateAuthorization(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    deleteAuthorization(id: number) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/Delete`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    getAuthorizationById(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/${id}`).pipe(
            map((data: any) => data)
        );
    }

    getMenu(userId: string, language: string, officeId: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/` + language + `/Menu/GetMenus`, { userId: userId, officeId: officeId }).pipe(
            map((data: any) => data)
        );
    }

    getOfficePermission(username: string, companyId: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysOffice/GetOfficePermission/${username}/${companyId}`).pipe(
            map((data: any) => data)
        );
    }

    getDepartmentGroupPermission(username: string, officeId: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysGroup/GetDepartmentGroupPermission/${username}/${officeId}`).pipe(
            map((data: any) => data)
        );
    }

    getListCompanyPermissionLevel() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysCompany/GetCompanyPermissionLevel`).pipe(
            map((data: any) => data)
        );
    }

    getUserPermissionByMenu(menuId: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserPermission/Permissions/${menuId}`, null, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    getUserLevelByType(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserLevel/GetUsersByType`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListDeptType() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/CatDepartment/GetDepartmentTypes`)
            .pipe(
                catchError((error) => throwError(error)),
                map((data: any) => data)
            );
    }

    checkDetailAuthorizePermission(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/CheckPermission/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkDeleteAuthorizePermission(id: number) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysAuthorization/CheckDeletePermission/${id}`).pipe(
            map((data: any) => data)
        );
    }

    getSettingFlowByOffice(officeId: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysSettingFlow/GetSettingFlowByOffice`, { officeId: officeId }).pipe(
            map((data: any) => data)
        );
    }

    updateSettingFlow(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysSettingFlow`, body).pipe(
            map((data: any) => data)
        );
    }

    getListServiceByPermision() {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/Menu/GetListService`).pipe(
            map((data: any) => data)
        );
    }

    updateProfile(body: any) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/UpdateProfile`, body);
    }

    getListNotifications(page: number = 1, size: number = 15) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserNotification/Paging`, { page: page, size: size }, { "hideSpinner": "true" });
    }

    readMessage(Id: string) {
        return this._api.put(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserNotification/Read`, null, { Id: Id });
    }

    deleteMessage(Id: string) {
        return this._api.delete(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUserNotification/Delete`, { Id: Id });
    }

    getListUsersByCurrentCompany(body: any = {}) {
        return this._api.post(`${environment.HOST.SYSTEM}/api/${this.VERSION}/vi/SysUserLevel/GetListUsersByCurrentCompany`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => {
                return data;
            })
        );
    }

    getListUserWithPermission(menuID: string, action: string) {
        return this._api.get(`${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysUser/GetListUserWithPermission`, { menuID: menuID, action: action }).pipe(
            map((data: any) => data)
        );
    }

    getListEmailSettingByDeptID(Id: number) {
        return this._api.get(
            `${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmailSetting/GetEmailSettingByDeptId/`,
            { id: Id }
        );
    }

    getEmailSettingByID(Id: number) {
        return this._api.get(
            `${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmailSetting/${Id}`
        );
    }

    deleteEmailSetting(Id: number) {
        return this._api.delete(
            `${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmailSetting/Delete`,
            { id: Id }
        );
    }

    addEmailInfo(body: any) {
        return this._api
            .post(
                `${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmailSetting/Add`,
                body
            )
            .pipe(map((data: any) => data));
    }

    updateEmailInfo(body: any = {}) {
        return this._api
            .put(
                `${environment.HOST.SYSTEM}/api/${this.VERSION}/en-US/SysEmailSetting/Update`,
                body
            )
            .pipe(map((data: any) => data));
    }

}

