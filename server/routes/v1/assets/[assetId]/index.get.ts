import { promises as fs } from 'fs';
import path from 'path';
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3';
import {useServerFileStuff} from "~~/server/utils/utility/useServerFileStuff";

export default defineEventHandler(async (event) => {
    const $util = useServerFileStuff()

    try {
        const assetId = getRouterParam(event, "assetId") || '';
        const ASSETS_FOLDER = "assets";
        const APP_ID = "dev.ctrl-neo.companion"

        // Construct paths
        const appDataDir = $util.getAppDataPath(APP_ID);
        const assetsFolderPath = path.join(appDataDir, ASSETS_FOLDER, assetId);
        const assetBasePath = path.join(assetsFolderPath, assetId);

        // Check if assets folder exists
        try {
            await fs.access(assetsFolderPath);
            // console.log('Assets folder exists');
        } catch (err) {
            console.error('Assets folder access error:', err);
            return createError({
                statusCode: 404,
                statusMessage: "Assets folder not found",
            });
        }

        // Check for existing image files
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        let existingPath = '';

        for (const ext of extensions) {
            const testPath = `${assetBasePath}${ext}`;
            // console.log('Checking path:', testPath);

            try {
                await fs.access(testPath);
                existingPath = testPath;
                // console.log('Found asset at:', existingPath);
                break;
            } catch (err) {
                // console.log('Not found:', testPath);
                continue;
            }
        }

        if (!existingPath) {
            // console.error('No matching asset found with any extension');
            return createError({
                statusCode: 404,
                statusMessage: "Asset not found",
            });
        }

        // Read the found file
        const fileData = await fs.readFile(existingPath);
        // console.log('Successfully read file, size:', fileData.length);

        // Determine content type
        let contentType = 'application/octet-stream';
        if (existingPath.endsWith('.png')) contentType = 'image/png';
        else if (existingPath.endsWith('.jpg') || existingPath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (existingPath.endsWith('.gif')) contentType = 'image/gif';
        else if (existingPath.endsWith('.webp')) contentType = 'image/webp';

        // Set headers
        setResponseHeader(event, 'Content-Type', contentType);
        setResponseHeader(event, 'Content-Length', fileData.length);
        setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
        setResponseHeader(event, 'Pragma', 'no-cache');
        setResponseHeader(event, 'Expires', '0');

        return fileData;
    } catch (e) {
        console.error('Unexpected error:', e);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
        });
    }
});