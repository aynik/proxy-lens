'use strict';

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ['src/*.ts'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    testEnvironment: 'node',
    preset: 'ts-jest',
};
