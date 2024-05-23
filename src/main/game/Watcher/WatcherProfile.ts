import { Profile } from '@aurora-launcher/core';

export type WatcherProfile = Pick<
    Profile,
    'clientDir' | 'updateVerify' | 'updateExclusions'
>;
