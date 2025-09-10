import { HttpContextToken } from "@angular/common/http";

/**
 * Context token to disable global exception handling for specific requests
 */
export const DISABLE_GLOBAL_EXCEPTION_HANDLING = new HttpContextToken<boolean>(() => false);
