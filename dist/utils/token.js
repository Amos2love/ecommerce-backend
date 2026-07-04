"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate6DigitToken = void 0;
const generate6DigitToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generate6DigitToken = generate6DigitToken;
