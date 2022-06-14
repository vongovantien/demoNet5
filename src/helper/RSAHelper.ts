import * as JSEncryptModule from 'jsencrypt';
import { SystemConstants } from 'src/constants/system.const';

export class RSAHelper {

    public static encode(plainText: string, key: string): string {
        if (((plainText == null ? null : plainText) || '') === '' || ((key == null ? null : plainText) || '') === '') {
            return null;
        }
        const decrypt = new JSEncryptModule.JSEncrypt(null);
        decrypt.setPublicKey(key);
        return '' + decrypt.encrypt(plainText);
    }

    public static decode(encodingText: string, key): string {
        if (((encodingText == null ? null : encodingText) || '') === '' || ((key == null ? null : key) || '') === '') {
            return null;
        }
        const decrypt = new JSEncryptModule.JSEncrypt(null);
        decrypt.setPrivateKey(key);
        return '' + decrypt.decrypt(encodingText);
    }

    public static clientEncode(plainText: string) {
        return this.encode(plainText, SystemConstants.SECRET_KEY);
    }

    public static clientDecode(encodingText: string) {
        return this.decode(encodingText, SystemConstants.SECRET_KEY);
    }

    public static serverEncode(plainText: string) {
        return this.encode(plainText, SystemConstants.ENCRYPT_SERVER_PUBLIC_KEY);
    }

}