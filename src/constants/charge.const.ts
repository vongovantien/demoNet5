export class ChargeConstants {
    public static readonly IT_CODE: string = "IT";
    public static readonly AI_CODE: string = "AI";
    public static readonly AE_CODE: string = "AE";
    public static readonly SFE_CODE: string = "SFE";
    public static readonly SFI_CODE: string = "SFI";
    public static readonly SLE_CODE: string = "SLE";
    public static readonly SLI_CODE: string = "SLI";
    public static readonly SCE_CODE: string = "SCE";
    public static readonly SCI_CODE: string = "SCI";
    public static readonly CL_CODE: string = "CL";

    public static readonly IT_DES: string = "Inland Trucking";
    public static readonly AI_DES: string = "Air Import";
    public static readonly AE_DES: string = "Air Export";
    public static readonly SFE_DES: string = "Sea FCL Export";
    public static readonly SFI_DES: string = "Sea FCL Import";
    public static readonly SLE_DES: string = "Sea LCL Export";
    public static readonly SLI_DES: string = "Sea LCL Import";
    public static readonly SCE_DES: string = "Sea Consol Export";
    public static readonly SCI_DES: string = "Sea Consol Import";
    public static readonly CL_DES: string = "Custom Logistic";


    public static readonly DEFAULT_AIR = ["BA_A_F_Air", "BA_SCR_Air", "BA_AMS_Air", "BA_BBD_Air"];
    public static readonly BUYING_DEFAULT_FCL_EXPORT = ["BS_OCF_Sea", "BS_BL_Sea", "BS_SEL_Sea", "BS_THCF_Sea"];
    public static readonly BUYING_DEFAULT_LCL_EXPORT = ["BS_OCF_Sea", "BS_BL_Sea", "BS_SEL_Sea", "BS_THCL_Sea"];
    public static readonly BUYING_DEFAULT_FCL_IMPORT = ["BS_OCF_Sea", "BS_D_O_Sea", "BS_CIC_Sea", "BS_THCF_Sea", "BS_HDL_Sea"];
    public static readonly BUYING_DEFAULT_LCL_IMPORT = ["BS_OCF_Sea", "BS_D_O_Sea", "BS_CIC_Sea", "BS_THCL_Sea", "BS_HDL_Sea", "BS_CFS_Sea"];

    public static readonly SELLING_DEFAULT_FCL_EXPORT = ["SS_OCF_Sea", "SS_BL_Sea", "SS_SEL_Sea", "SS_THCF_Sea"];
    public static readonly SELLING_DEFAULT_LCL_EXPORT = ["SS_OCF_Sea", "SS_BL_Sea", "SS_SEL_Sea", "SS_THCL_Sea"];
    public static readonly SELLING_DEFAULT_FCL_IMPORT = ["SS_OCF_Sea", "SS_D_O_Sea", "SS_CIC_Sea", "SS_THCF_Sea", "SS_HDL_Sea"];
    public static readonly SELLING_DEFAULT_LCL_IMPORT = ["SS_OCF_Sea", "SS_D_O_Sea", "SS_CIC_Sea", "SS_THCL_Sea", "SS_HDL_Sea", "SS_CFS_Sea"];

    public static readonly ServiceTypeMapping: CommonInterface.INg2Select[] = <CommonInterface.INg2Select[]>[
        { id: 'All', text: 'All' },
        { id: ChargeConstants.AE_CODE, text: ChargeConstants.AE_DES },
        { id: ChargeConstants.AI_CODE, text: ChargeConstants.AI_DES },
        { id: ChargeConstants.SFE_CODE, text: ChargeConstants.SFE_DES },
        { id: ChargeConstants.SFI_CODE, text: ChargeConstants.SFI_DES },
        { id: ChargeConstants.SLE_CODE, text: ChargeConstants.SLE_DES },
        { id: ChargeConstants.SLI_CODE, text: ChargeConstants.SLI_DES },
        { id: ChargeConstants.CL_CODE, text: ChargeConstants.CL_DES },
        { id: ChargeConstants.IT_CODE, text: ChargeConstants.IT_DES },
        { id: ChargeConstants.SCE_CODE, text: ChargeConstants.SCE_DES },
        { id: ChargeConstants.SCI_CODE, text: ChargeConstants.SCI_DES }
    ];
}