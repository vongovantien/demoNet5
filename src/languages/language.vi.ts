import { environment } from "src/environments/environment";

export const language = {
  /**
   * Use to configure menu display in page-sidebar component 
   * @param parent_name : name of module 
   * @param icon : css class name of module icon 
   * @param route_parent : route of module 
   * @param display_child : Page-sidbar component use this variable to open-close sub-menu 
   * @param childs : list components under each module 
   * @param name: name of component 
   * @param route_child : route of component , example  : 'http://test.efms.itlvn.com/vi/#/home/catalogue/ware-house' 
   * @param display : If true, component will display on menu in page-sidebar, none display if false  
  */
  Menu: [
    {
      parent_name: "Danh Mục",
      icon: "icon-books",
      route_parent: "/home/catalogue/",
      display_child: false,
      display: true,
      childs: [

        { name: "Kho", route_child: "ware-house", display: true },
        { name: "Cửa Khẩu", route_child: "port-index", display: true },
        { name: "Dữ Liệu Đối Tác", route_child: "partner-data", display: true },
        { name: "Hàng Hóa", route_child: "commodity", display: true },
        { name: "Quản Lí Stage", route_child: "stage-management", display: true },
        { name: "Đơn Vị", route_child: "unit", display: true },
        { name: "Địa Điểm", route_child: "location", display: true },
        { name: "Phí", route_child: "charge", display: true },
        { name: "Tiền Tệ", route_child: "currency", display: true }
      ]
    },

    {
      parent_name: "Hoạt Động",
      icon: "icon-cogs",
      route_parent: "/home/operation/",
      display_child: false,
      display: true,
      childs: [
        { name: "Quản Lý Job", route_child: "job-management", display: true },
        // { name: "Điều Phối", route_child: "assigment", display: true },
        // { name: "Điều Phối Xe", route_child: "trucking-assigment", display: true },
        { name: "Custom Clearance", route_child: "custom-clearance", display: true }
      ]
    },

    {
      parent_name: "Chứng Từ",
      icon: "icon-file-text2",
      route_parent: "/home/documentation/",
      display_child: false,
      display: true,
      childs: [
        // { name: "Inland Trucking", route_child: "inland-trucking", display: true },
        { name: "Air Export", route_child: "air-export", display: true },
        { name: "Air Import", route_child: "air-import", display: true },
        // { name: "Sea Consol Export", route_child: "sea-consol-export", display: true },
        // { name: "Sea Consol Import", route_child: "sea-consol-import", display: true },
        { name: "Sea FCL Export", route_child: "sea-fcl-export", display: true },
        { name: "Sea FCL Import", route_child: "sea-fcl-import", display: true },
        { name: "Sea LCL Export", route_child: "sea-lcl-export", display: true },
        { name: "Sea LCL Import", route_child: "sea-lcl-import", display: true },
        // { name: "Sea LCL Import", route_child: "sea-lcl-import" }
      ]
    },

    {
      parent_name: "Kế Toán",
      icon: "icon-calculator",
      route_parent: "/home/accounting/",
      display_child: false,
      display: true,
      childs: [
        // { name: "Account Receivable Payable", route_child: "account-receivable-payable", display: true },
        { name: "Advance Payment", route_child: "advance-payment", display: true },
        { name: "Settlement Payment", route_child: "settlement-payment", display: true },
        { name: "Statement of Account", route_child: "statement-of-account", display: true }
      ]
    },

    {
      parent_name: "Hệ Thống",
      icon: "icon-database",
      route_parent: "/home/system/",
      display_child: false,
      display: true,
      childs: [
        { name: "Quản Lý Người Dùng", route_child: "user-management", display: true },
        { name: "Nhóm Người Dùng", route_child: "group", display: true },
        { name: "Vai Trò", route_child: "role", display: true },
        { name: "Quyền", route_child: "permission", display: true },
        { name: "Bộ Phận", route_child: "department", display: true },
        { name: "Thông Tin Công Ty", route_child: "company", display: true },
        { name: "Chi nhánh", route_child: "office", display: true },
        { name: "Ủy quyền", route_child: "authorization", display: true }
      ]
    },

    {
      parent_name: "Công Cụ - Cài Đặt",
      icon: "icon-wrench",
      route_parent: "/home/tool/",
      display_child: false,
      display: true,
      childs: [
        // { name: "Định Nghĩa ID", route_child: "id-definition", display: true },
        { name: "Thuế Quan", route_child: "tariff", display: true },
        { name: "Tỉ Giá", route_child: "exchange-rate", display: true },
        { name: "Ecus Connection", route_child: "ecus-connection", display: true },
        // { name: "KPI", route_child: "kpi", display: true },
        // { name: "Nhà Cung Cấp", route_child: "supplier", display: true },
        { name: "Truy Xuất Lịch Sử", route_child: "log-viewer", display: true },
        { name: "Mở khóa", route_child: "unlock", display: true }
      ]
    },

    {
      parent_name: "Báo Cáo",
      icon: "icon-stats-bars",
      route_parent: "/home/report/",
      display_child: false,
      display: false,
      childs: [
        { name: "Báo Cáo P/L", route_child: "pl-report", display: true },
        { name: "Báo Cáo Hiệu Suất", route_child: "performance-report", display: true },
        { name: "Tổng Quan Lô Hàng", route_child: "shipment-overview", display: true }
      ]
    },

    {
      parent_name: "Designs Zone",
      icon: "icon-format_paint",
      route_parent: "/home/designs-zone/",
      display_child: false,
      "display": !environment.production,
      childs: [
        { name: "Form", route_child: "form", display: true },
        { name: "Table", route_child: "table", display: true }
      ]
    }
  ],
  Warehouse: [
    {
      primaryKey: 'id',
      header: 'Id',
      dataType: "number",
      lookup: ''
    },
    {
      primaryKey: 'code',
      header: 'Code',
      isShow: true,
      allowSearch: true,
      dataType: "text",
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'nameEN',
      header: 'Tên (EN)',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'nameVN',
      header: 'Tên (VN)',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'countryName',
      header: 'Quốc gia',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'countryID',
      header: 'Country',
      isShow: false,
      required: true,
      lookup: 'countries'
    },
    {
      primaryKey: 'provinceName',
      header: 'Tỉnh/ Thành phố',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'provinceID',
      header: 'City/ Province',
      isShow: false,
      required: true,
      lookup: 'provinces'
    },
    {
      primaryKey: 'districtName',
      header: 'Quận/ huyện',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'districtID',
      header: 'District',
      isShow: false,
      required: true,
      lookup: 'districts'
    },
    {
      primaryKey: 'address',
      header: 'Địa chỉ',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'inactive',
      header: 'Status',
      isShow: true,
      dataType: 'boolean',
      required: true,
      lookup: ''
    }
  ],
  NOTIFI_MESS: {
    DOWNLOAD_ERR: "Lỗi Tải Xuống",
    FILE_NOT_FOUND: "Không Tìm Thấy Tệp !",
    UNKNOW_ERR: "Lỗi",
    SERVER_ERR_TITLE: "Lỗi Máy Chủ",
    CLIENT_ERR_TITLE: "Yêu Cầu Không Hợp Lệ",
    EXPIRED_SESSION_TITLE: "Hết Phiên Đăng Nhập",
    CHECK_CONNECT: "Vui Lòng Kiểm Tra Kết Nối !",
    EXPIRED_SESSION_MESS: "Vui Lòng Đăng Nhập Để Tiếp Tục !",
    EXPORT_SUCCES: "Xuất Tệp Thành Công !",
    IMPORT_SUCCESS: "Tải Tệp Lên Thành Công !"
  }
}
