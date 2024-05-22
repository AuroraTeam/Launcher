import 'reflect-metadata';

import Container from 'typedi';
import { expect, test } from 'vitest';

import { Watcher } from './Watcher';

const processStub = {
    kill: () => {
        console.log('killed');
    },
};

const watcher = Container.get(Watcher);

test('add correct file [lib example]', () => {
    expect(
        watcher.addEventChecker(
            'libraries/test/lib.jar',
            ['libraries/test/lib.jar'],
            [],
            processStub,
        ),
    ).not.toBe('killed');
});

test('add correct file [updateVerify path example (mods)]', () => {
    expect(
        watcher.addEventChecker('mods/test/mod.jar', ['mods'], [], processStub),
    ).not.toBe('killed');
});

test('add incorrect file [lib example]', () => {
    expect(
        watcher.addEventChecker(
            'libraries/test/not-whitelisted.jar',
            ['libraries/test/lib.jar'],
            [],
            processStub,
        ),
    ).toBe('killed');
});

test('add incorrect file [updateVerify path example (mods)]', () => {
    expect(
        watcher.addEventChecker('mods/test/mod.jar', ['mods'], [], processStub),
    ).toBe('killed');
});

test('add correct file [updateExclusions example]', () => {
    expect(
        watcher.addEventChecker(
            'mods/test/mod.jar',
            ['mods'],
            ['mods/test'],
            processStub,
        ),
    ).not.toBe('killed');
});

// TODO: add more tests [modifyEventChecker, removeEventChecker]
