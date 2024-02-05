import { LogHelper } from 'main/helpers/LogHelper';
import { Service } from 'typedi';

@Service()
export class Watcher {
    async watch() {
        LogHelper.info('Watcher not implemented in current version');
    }
}
