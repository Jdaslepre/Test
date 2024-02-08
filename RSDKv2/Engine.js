// Purpose: RSDK Engine pre-initialization
// Author: Jd1206

/*
This script defines the RSDK_Init function that is
called in EngineInit.js. It simply sets the current
FS directory, and then calls the exported RSDKInitialize
function contained in the webassembly module.
*/

function RSDK_Init()
{
    FS.chdir('/FileSystem/RSDKv2')
    Module._RSDKInitialize();
}