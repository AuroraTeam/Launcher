import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { MemoryLimits } from '../../../../common/memory';
import { MemoryRange } from '../MemoryRange';

interface ClientMemorySettingsProps {
    value: number;
    limits: MemoryLimits;
    onChange: (memory: number) => void;
}

export function ClientMemorySettings({
    value,
    limits,
    onChange,
}: ClientMemorySettingsProps) {
    const { t } = useTranslation('common');
    const id = useId();

    return (
        <div>
            <label htmlFor={id}>
                {t('settings.memory')} {value}MB
            </label>
            <MemoryRange
                id={id}
                limit={limits.maximum}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
            />
            <p>
                {t('settings.memoryRecommended', {
                    memory: limits.recommended,
                })}
            </p>
            {value > limits.recommended && (
                <p role="status">{t('settings.memoryWarning')}</p>
            )}
        </div>
    );
}
