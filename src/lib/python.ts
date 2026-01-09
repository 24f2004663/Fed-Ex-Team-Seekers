import { exec } from "child_process";
import util from "util";
import path from "path";

const execPromise = util.promisify(exec);

export async function runPythonBackground(
    script: string,
    args: string[]
) {
    const scriptPath = path.join(process.cwd(), script);
    const command = `python "${scriptPath}" ${args.join(" ")}`;

    try {
        const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 1024 * 5 }); // 5MB Buffer
        if (stderr) console.warn("[Python stderr]", stderr);
        console.log("[Python stdout]", stdout);
        return { success: true, stdout };
    } catch (err: any) {
        console.error("[Python failed]", err.message);
        throw err;
    }
}
