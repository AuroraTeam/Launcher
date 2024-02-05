import process from 'process';
import { Platform } from '../core/System';

export class PlatformHelper {
    public static isMac = process.platform == Platform.MACOS;
    public static isLinux = process.platform == Platform.LINUX;
    public static isUnix = this.isMac || this.isLinux
    public static isWindows = process.platform == Platform.WINDOWS;
}
