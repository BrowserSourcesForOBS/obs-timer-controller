/**
 * Compares two version strings and returns a number indicating their relative order.
 *
 * @param {string} versionA - The first version string to compare.
 * @param {string} versionB - The second version string to compare.
 * @return {number} Returns a negative number if versionA is older than versionB, a positive number if versionA is newer than versionB, and 0 if both versions are equal.
 */
export const compareVersions = (versionA: string, versionB: string): number => {
    if (!versionA || !versionB) return 0;

    const a = versionA.startsWith("v") ? versionA.split("v")[1].split(".").map(Number) : versionA.split(".").map(Number);
    const b = versionB.startsWith("v") ? versionB.split("v")[1].split(".").map(Number) : versionB.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
        if (a[i] < b[i]) return 1; // B is newer than A
        if (a[i] > b[i]) return -1; // B is older than A
    }

    return 0; // Son la misma versión
};
