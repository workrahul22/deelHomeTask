import * as express from 'express';
import { Contract, Job, Profile } from '../model';

declare global {
    namespace Express {
        interface Request {
            profile?: any,
            app?: {
                model?: any
            }
        };
    }
}
export {};