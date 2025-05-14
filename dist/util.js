"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
const hash = (len) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.hash = hash;
