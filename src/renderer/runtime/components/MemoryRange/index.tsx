import { ChangeEventHandler } from 'react';

import { MEMORY_STEP_MB, MIN_MEMORY_MB } from '../../../../common/memory';
import classes from './index.module.sass';

interface MemoryRangeProps {
    id?: string;
    value: number;
    onChange: ChangeEventHandler<HTMLInputElement>;
    limit: number;
}

export function MemoryRange({
    id,
    value,
    onChange,
    limit = 16384,
}: MemoryRangeProps) {
    return (
        <div>
            <div className={classes.wrapper}>
                <input
                    id={id}
                    className={classes.range}
                    min={MIN_MEMORY_MB}
                    max={limit}
                    value={value}
                    step={MEMORY_STEP_MB}
                    onChange={onChange}
                    type="range"
                />
                <div className={classes.label}>
                    {[...Array(Math.floor(limit / 1024))].map(
                        (_: any, ix: number) => (
                            <div key={ix} className={classes.dot} />
                        ),
                    )}
                </div>

                <div className={classes.tips}>
                    {[...Array(Math.floor(limit / 1024))].map(
                        (_: any, ix: number) => (
                            <p key={ix} className={classes.gb}>
                                {ix + 1}G
                            </p>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
