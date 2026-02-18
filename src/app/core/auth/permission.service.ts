import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

export type Permission = "read" | "write" | "admin";

@Injectable({
    providedIn: "root",
})
export class PermissionService {
    constructor(private authService: AuthService) {}

    /**
     * Check if user has required permission
     * @param requiredRole 'read' | 'write' | 'admin'
     */
    validPermission(requiredRole: string): boolean {
        const userRole = this.authService.role;

        if (userRole === "admin") return true;
        if (userRole === "write") return requiredRole === "read" || requiredRole === "write";
        if (userRole === "read") return requiredRole === "read";

        return false;
    }

    /**
     * Check if user is admin
     */
    get isAdmin(): boolean {
        return this.authService.role === "admin";
    }

    /**
     * Check if user has write access
     */
    get canWrite(): boolean {
        return this.validPermission("write");
    }

    /**
     * Check if user has read access
     */
    get canRead(): boolean {
        return this.validPermission("read");
    }
}
